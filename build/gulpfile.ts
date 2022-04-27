import { resolve } from 'path';
import { series } from 'gulp';
// import { buildTypescript } from './buildTypescript';
// import { buildutils } from './buildUtils';
import { withTask } from '@alqmc/build-utils';
import { buildVueLib } from './../packages/vue';

export default series(
  withTask('vue', async () => {
    await buildVueLib({
      baseOptions: {
        input: resolve(__dirname, '../example/src/index.ts'),
        enterPath: resolve(__dirname, '../example'),
        outPutPath: resolve(__dirname, '../dist/build-vue'),
        tsConfigPath: resolve(__dirname, '../example/tsconfig.json'),
        pkgPath: resolve(__dirname, '../example/package.json'),
      },
    });
  })
);
