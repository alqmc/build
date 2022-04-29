import path from 'path';
import { rollup } from 'rollup';
import { getExternal } from '@alqmc/build-utils';
import { generateTypesDefinitions } from './src/generateType';
import { generatePlugin } from './src/generatePlugin';
import type { RollupBuild } from 'rollup';
import type { DefineLibConfig } from './type/build-typescript';

const buildModules = async ({
  baseOptions,
  pluginOptions,
  externalOptions,
  extraOptions,
}: DefineLibConfig) => {
  const bundle = await rollup({
    input: baseOptions.input,
    external: externalOptions
      ? externalOptions
      : await getExternal({
          outputPackage: path.resolve(__dirname, baseOptions.pkgPath),
        }),
    plugins: generatePlugin(baseOptions, pluginOptions),
    ...extraOptions,
  });
  return bundle;
};

const writeBundles = async (bundle: RollupBuild, outPutPath: string) => {
  bundle.write({
    format: 'es',
    dir: path.resolve(outPutPath, 'es'),
    preserveModules: true,
    entryFileNames: '[name].mjs',
  });
  bundle.write({
    format: 'cjs',
    dir: path.resolve(outPutPath, 'lib'),
    preserveModules: true,
    entryFileNames: '[name].js',
    exports: 'named',
  });
};

export const buildTypescriptLib = async ({
  baseOptions,
  pluginOptions,
  externalOptions,
  extraOptions,
}: DefineLibConfig) => {
  const bundle = await buildModules({
    baseOptions,
    pluginOptions,
    externalOptions,
    extraOptions,
  });
  await writeBundles(bundle, baseOptions.outPutPath);
  await generateTypesDefinitions(baseOptions);
};
