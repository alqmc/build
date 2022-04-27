import { resolve } from 'path';
import { series } from 'gulp';
import { createZip, updateVersion, withTask } from '@alqmc/build-utils';
import { copyFile, emptyDir } from 'fs-extra';
import { buildTypescriptLib } from '@alqmc/build-ts';
import pkg from '../packages/typescript/package.json';
import { buildOutPath, enterPath, rootPath } from './const';
const utils = {
  input: resolve(enterPath, 'utils/index.ts'),
  outPutPath: resolve(buildOutPath, 'build-utils'),
  enterPath: resolve(enterPath, 'utils'),
  pkgPath: resolve(enterPath, 'utils/package.json'),
  tsConfigPath: resolve(enterPath, 'utils/tsconfig.json'),
};
export const buildutils = series(
  withTask('clear', async () => {
    await emptyDir(utils.outPutPath);
  }),
  withTask('build', async () => {
    await buildTypescriptLib({
      baseOptions: {
        input: utils.input,
        outPutPath: utils.outPutPath,
        enterPath: utils.enterPath,
        pkgPath: utils.pkgPath,
        tsConfigPath: utils.tsConfigPath,
      },
    });
  }),
  withTask('copyfile', async () => {
    Promise.all([
      copyFile(utils.pkgPath, resolve(utils.outPutPath, 'package.json')),
      copyFile(
        resolve(utils.enterPath, 'README.md'),
        resolve(utils.outPutPath, 'README.md')
      ),
    ]);
  }),
  withTask('update-version', async () => {
    await updateVersion({
      targetPkgPath: [resolve(utils.outPutPath, 'package.json')],
    });
  }),
  withTask('createZip', async () => {
    await createZip({
      fileName: `build-utils-v${pkg.version}.zip`,
      enterPath: utils.outPutPath,
      outPath: rootPath,
    });
  })
);
