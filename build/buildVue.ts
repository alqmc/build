import { resolve } from 'path';
import { series } from 'gulp';
import { createZip, withTask } from '@alqmc/build-utils';
import { copyFile, emptyDir } from 'fs-extra';
import { buildTypescriptLib } from '@alqmc/build-ts';
import pkg from '../packages/typescript/package.json';
import { buildOutPath, enterPath, versionPath } from './const';
const vueLib = {
  input: resolve(enterPath, 'vue/index.ts'),
  outPutPath: resolve(buildOutPath, 'vue/dist'),
  enterPath: resolve(enterPath, 'vue'),
  pkgPath: resolve(enterPath, 'vue/package.json'),
  tsConfigPath: resolve(enterPath, 'vue/tsconfig.json'),
};
export const buildvueLib = series(
  withTask('clear', async () => {
    try {
      await emptyDir(vueLib.outPutPath);
    } catch (error) {}
  }),
  withTask('build', async () => {
    await buildTypescriptLib({
      baseOptions: {
        input: vueLib.input,
        outPutPath: vueLib.outPutPath,
        enterPath: vueLib.enterPath,
        pkgPath: vueLib.pkgPath,
        tsConfigPath: vueLib.tsConfigPath,
      },
    });
  }),
  withTask('copyfile', async () => {
    Promise.all([
      copyFile(vueLib.pkgPath, resolve(vueLib.outPutPath, 'package.json')),
      copyFile(
        resolve(vueLib.enterPath, 'README.md'),
        resolve(vueLib.outPutPath, 'README.md')
      ),
    ]);
  }),
  withTask('createZip', async () => {
    await createZip({
      fileName: `build-vueLib-v${pkg.version}.zip`,
      enterPath: vueLib.outPutPath,
      outPath: versionPath,
    });
  })
);
