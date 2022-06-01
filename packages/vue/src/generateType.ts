import path from 'path';
import vueCompiler from '@vue/compiler-sfc';
import glob from 'fast-glob';
import { Project } from 'ts-morph';
import { copy, mkdir, readFile, writeFile } from 'fs-extra';
import { log } from '@alqmc/build-utils';
import type { BaseOptions, BuildProduct } from '../type/build-vue';
import type { SourceFile } from 'ts-morph';

const copyTypes = async (buildOutput: string, buildProduct: BuildProduct[]) => {
  const src = path.resolve(buildOutput, 'types');
  if (buildProduct.includes('es')) {
    await copy(src, path.resolve(buildOutput, 'es'), { recursive: true });
  }
  if (buildProduct.includes('lib')) {
    await copy(src, path.resolve(buildOutput, 'lib'), { recursive: true });
  }
};
export const generateTypesDefinitions = async (
  baseOptions: BaseOptions,
  buildProduct: BuildProduct[]
) => {
  const project = new Project({
    compilerOptions: {
      emitDeclarationOnly: true,
      preserveSymlinks: true,
      declaration: true,
      outDir: path.resolve(baseOptions.outPutPath, 'types'),
    },
    skipAddingFilesFromTsConfig: true,
    tsConfigFilePath: path.resolve(__dirname, baseOptions.tsConfigPath),
  });
  const filePaths = await glob(
    ['**/*.{ts,vue}', '!node_modules', '!dist', '!**/*.d.ts'],
    {
      cwd: baseOptions.enterPath,
      absolute: true,
      onlyFiles: true,
    }
  );
  const sourceFiles: SourceFile[] = [];
  await Promise.all([
    ...filePaths.map(async (file) => {
      if (file.endsWith('.vue')) {
        const fileContent = await readFile(file, 'utf-8');
        const sfc = vueCompiler.parse(fileContent);
        const { script } = sfc.descriptor;
        if (script) {
          let content = '';
          let isTS = false;
          if (script && script.content) {
            content += script.content;
            if (script.lang === 'ts' || script.lang === 'tsx') {
              isTS = true;
            }
          }
          const _path =
            path.relative(process.cwd(), file) + (isTS ? '.ts' : '.js');
          const sourceFile = project.createSourceFile(_path, content);

          sourceFiles.push(sourceFile);
        }
      } else {
        const sourceFile = project.addSourceFileAtPath(file);
        sourceFiles.push(sourceFile);
      }
    }),
  ]);

  const diagnostics = project.getPreEmitDiagnostics();
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));

  await project.emit({
    emitOnlyDtsFiles: true,
  });

  const tasks = sourceFiles.map(async (sourceFile) => {
    const relativePath = path.relative(
      baseOptions.enterPath,
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
  if (buildProduct.includes('type'))
    await copyTypes(baseOptions.outPutPath, buildProduct);
};
