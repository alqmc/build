import path from 'path';
import { series } from 'gulp';
import { createZip, run, withTask } from '../package/utils';
import { buildTypescriptLib } from '../package/tasks';

import pkg from '../package/package.json';
import { copyFiles } from './copyFile';
import { buildOutPath, enterPath, rootPath } from './const';

export default series(
  withTask('clear', () => run('pnpm run clear')),
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
      fileName: `build-v${pkg.version}.zip`,
      enterPath: buildOutPath,
      outPath: rootPath,
    });
  })
);
