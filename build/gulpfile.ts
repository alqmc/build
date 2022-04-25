import path from 'path';
import { series } from 'gulp';
import { utils } from '../dist';
import { buildTypescriptLib } from '../package/tasks';

import { copyFiles } from './copyFile';
import { buildOutPath, enterPath, rootPath } from './const';

const { createZip, run, withTask } = utils;
export default series(
  withTask('clear', () => run('pnpm run clear', '../')),
  withTask('build', async () => {
    await buildTypescriptLib({
      input: path.resolve(enterPath, 'index.ts'),
      outPutPath: buildOutPath,
      enterPath,
      pkgPath: path.resolve(enterPath, 'package.json'),
      tsConfigPath: path.resolve(rootPath, 'tsconfig.json'),
    });
  }),
  copyFiles,
  withTask('createZip', async () => {
    await createZip({
      fileName: '@alqmc/build.zip',
      enterPath: buildOutPath,
      outPath: rootPath,
    });
  })
);
