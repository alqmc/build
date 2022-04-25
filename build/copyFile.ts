import path from 'path';
import { copyFile } from 'fs/promises';
import { outputPackage, buildOutPath, rootPath } from './const';

export const copyFiles = () =>
  Promise.all([
    copyFile(outputPackage, path.resolve(buildOutPath, 'package.json')),
    copyFile(path.resolve(rootPath, 'README.md'), path.resolve(buildOutPath, 'README.md')),
  ]);
