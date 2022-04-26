import path from 'path';
import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { rollup } from 'rollup';
import { Project } from 'ts-morph';
import glob from 'fast-glob';
import { copy, mkdir, writeFile } from 'fs-extra';
import { getExternal } from '../utils/src/pkg';
import { log } from '../utils/src/log';
import type { InputOption, Plugin, RollupBuild } from 'rollup';
import type { SourceFile } from 'ts-morph';

const copyTypes = async (buildOutput: string) => {
  const src = path.resolve(buildOutput, 'type');
  await copy(src, path.resolve(buildOutput, 'es'), { recursive: true });
  await copy(src, path.resolve(buildOutput, 'lib'), { recursive: true });
};

interface TypescriptOptions {
  input: InputOption;
  outPutPath: string;
  enterPath: string;
  pkgPath: string;
  tsConfigPath: string;
}
const getPlugins = (tsConfigPath: string) => {
  return [
    vue(),
    vueJsx(),
    resolve({
      preferBuiltins: true,
    }),
    json(),
    commonjs(),
    esbuild({
      sourceMap: true,
      tsconfig: tsConfigPath,
      loaders: {
        '.vue': 'ts',
      },
    }),
  ] as Plugin[];
};

const buildModules = async (
  input: InputOption,
  pkgPath: string,
  plugin: Plugin[]
) => {
  const bundle = await rollup({
    input,
    external: await getExternal({
      outputPackage: path.resolve(__dirname, pkgPath),
    }),
    plugin,
  });
  return bundle;
};
const writeBundles = async (
  bundle: RollupBuild,
  options: TypescriptOptions
) => {
  bundle.write({
    format: 'es',
    dir: path.resolve(options.outPutPath, 'es'),
    preserveModules: true,
    entryFileNames: '[name].mjs',
  });
  bundle.write({
    format: 'cjs',
    dir: path.resolve(options.outPutPath, 'lib'),
    preserveModules: true,
    entryFileNames: '[name].js',
    exports: 'named',
  });
};

const generateTypesDefinitions = async (options: TypescriptOptions) => {
  const project = new Project({
    compilerOptions: {
      emitDeclarationOnly: true,
      preserveSymlinks: true,
      outDir: path.resolve(options.outPutPath, 'type'),
    },
    tsConfigFilePath: path.resolve(__dirname, options.tsConfigPath),
  });
  const filePaths = await glob(['**/*.ts'], {
    cwd: options.enterPath,
    absolute: true,
    onlyFiles: true,
  });
  const sourceFiles: SourceFile[] = [];
  await Promise.all([
    ...filePaths.map(async (file) => {
      const sourceFile = project.addSourceFileAtPath(file);
      sourceFiles.push(sourceFile);
    }),
  ]);

  const diagnostics = project.getPreEmitDiagnostics();
  // eslint-disable-next-line no-console
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));

  await project.emit({
    emitOnlyDtsFiles: true,
  });

  const tasks = sourceFiles.map(async (sourceFile) => {
    const relativePath = path.relative(
      options.enterPath,
      sourceFile.getFilePath()
    );
    const emitOutput = sourceFile.getEmitOutput();
    const emitFiles = emitOutput.getOutputFiles();
    if (emitFiles.length === 0) {
      log.error(`Emit no file: ${relativePath}`);
      process.exit(1);
    }

    const tasks = emitFiles.map(async (outputFile) => {
      const filepath = outputFile.getFilePath();
      await mkdir(path.dirname(filepath), {
        recursive: true,
      });

      await writeFile(filepath, outputFile.getText(), 'utf8');

      log.success(`create type: ${relativePath}.d.ts`);
    });
    await Promise.all(tasks);
  });
  await Promise.all(tasks);
  await copyTypes(options.outPutPath);
};
export const buildVueLib = async (options: TypescriptOptions) => {
  const { pkgPath, tsConfigPath } = options;

  const plugins = getPlugins(tsConfigPath);
  const bundle = await buildModules(options.input, pkgPath, plugins);

  await writeBundles(bundle, options);
  await generateTypesDefinitions(options);
};
