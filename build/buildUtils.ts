import { resolve } from 'path';
import { series } from 'gulp';
import { createZip, getExternal, withTask } from '@alqmc/build-utils';
import { copyFile, emptyDir } from 'fs-extra';
import { buildTypescriptLib } from '@alqmc/build-ts';
import pkg from '../packages/typescript/package.json';
import { buildOutPath, enterPath, versionPath } from './const';
const utils = {
  input: resolve(enterPath, 'utils/index.ts'),
  outPutPath: resolve(buildOutPath, 'utils/dist'),
  enterPath: resolve(enterPath, 'utils'),
  pkgPath: resolve(enterPath, 'utils/package.json'),
  tsConfigPath: resolve(enterPath, 'utils/tsconfig.json'),
};
export const buildutils = series(
  withTask('clear', async () => {
    try {
      await emptyDir(utils.outPutPath);
    } catch (error) {}
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
      externalOptions: await getExternal({
        outputPackage: utils.pkgPath,
        extraExternal: ['fs/promises'],
      }),
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
  withTask('createZip', async () => {
    await createZip({
      fileName: `build-utils-v${pkg.version}.zip`,
      enterPath: utils.outPutPath,
      outPath: versionPath,
    });
  })
);
