import path from 'path';
import glob from 'fast-glob';
import { Project } from 'ts-morph';
import { copy, mkdir, writeFile } from 'fs-extra';
import { log } from '@alqmc/build-utils';
import type { BaseOptions, BuildProduct } from '../type/build-typescript';
import type { SourceFile } from 'ts-morph';

const copyTypes = async (
  baseOptions: BaseOptions,
  buildProduct: BuildProduct[],
  onlyOutput: boolean
) => {
  const src = path.resolve(baseOptions.outPutPath, 'types');
  if (buildProduct.includes('es')) {
    await copy(
      src,
      onlyOutput
        ? baseOptions.outPutPath
        : path.resolve(baseOptions.outPutPath, 'es'),
      {
        recursive: true,
      }
    );
  }
  if (buildProduct.includes('lib')) {
    await copy(
      src,
      onlyOutput
        ? baseOptions.outPutPath
        : path.resolve(baseOptions.outPutPath, 'lib'),
      {
        recursive: true,
      }
    );
  }
};
export const generateTypesDefinitions = async (
  baseOptions: BaseOptions,
  buildProduct: BuildProduct[],
  onlyOutput: boolean
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
  const filePaths = await glob(['**/*.ts', '!node_modules'], {
    cwd: baseOptions.enterPath,
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
    await copyTypes(baseOptions, buildProduct, onlyOutput);
};
