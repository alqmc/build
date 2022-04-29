import { resolve } from 'path';
import { series } from 'gulp';
import { createZip, withTask } from '@alqmc/build-utils';
import { copyFile, emptyDir } from 'fs-extra';
import { buildTypescriptLib } from '@alqmc/build-ts';
import pkg from '../packages/typescript/package.json';
import { buildOutPath, enterPath, versionPath } from './const';
const typescript = {
  input: resolve(enterPath, 'typescript/index.ts'),
  outPutPath: resolve(buildOutPath, 'typescript/dist'),
  enterPath: resolve(enterPath, 'typescript'),
  pkgPath: resolve(enterPath, 'typescript/package.json'),
  tsConfigPath: resolve(enterPath, 'typescript/tsconfig.json'),
};
export const buildTypescript = series(
  withTask('clear', async () => {
    try {
      await emptyDir(typescript.outPutPath);
    } catch (error) {}
  }),
  withTask('build', async () => {
    await buildTypescriptLib({
      baseOptions: {
        input: typescript.input,
        outPutPath: typescript.outPutPath,
        enterPath: typescript.enterPath,
        pkgPath: typescript.pkgPath,
        tsConfigPath: typescript.tsConfigPath,
      },
    });
  }),
  withTask('copyfile', async () => {
    Promise.all([
      copyFile(
        typescript.pkgPath,
        resolve(typescript.outPutPath, 'package.json')
      ),
      copyFile(
        resolve(typescript.enterPath, 'README.md'),
        resolve(typescript.outPutPath, 'README.md')
      ),
    ]);
  }),
  withTask('createZip', async () => {
    await createZip({
      fileName: `build-ts-v${pkg.version}.zip`,
      enterPath: typescript.outPutPath,
      outPath: versionPath,
    });
  })
);
