import path from 'path';
import { rollup } from 'rollup';
import { getExternal } from '@alqmc/build-utils';
import { generateTypesDefinitions } from './src/generateType';
import { generatePlugin } from './src/generatePlugin';
import type { RollupBuild } from 'rollup';
import type {
  BaseOptions,
  BuildProduct,
  DefineLibConfig,
} from './type/build-vue';

const buildModules = async ({
  baseOptions,
  pluginOptions,
  externalOptions,
  extraOptions,
}: DefineLibConfig) => {
  const bundle = await rollup({
    input: baseOptions.input,
    external: extraOptions
      ? externalOptions
      : await getExternal({
          outputPackage: baseOptions.pkgPath,
        }),
    plugins: generatePlugin(baseOptions, pluginOptions),
    ...extraOptions,
  });
  return bundle;
};

const writeBundles = async (
  bundle: RollupBuild,
  baseOptions: BaseOptions,
  buildProduct: BuildProduct[]
) => {
  if (buildProduct.includes('es')) {
    bundle.write({
      format: 'es',
      dir: path.resolve(baseOptions.outPutPath, 'es'),
      preserveModules: true,
      entryFileNames: '[name].mjs',
    });
  }
  if (buildProduct.includes('lib')) {
    bundle.write({
      format: 'cjs',
      dir: path.resolve(baseOptions.outPutPath, 'lib'),
      preserveModules: true,
      entryFileNames: '[name].js',
      exports: 'named',
    });
  }
};

export const buildVueLib = async ({
  baseOptions,
  pluginOptions,
  externalOptions,
  extraOptions,
  buildProduct = ['es', 'lib', 'type'],
}: DefineLibConfig) => {
  const bundle = await buildModules({
    baseOptions,
    pluginOptions,
    externalOptions,
    extraOptions,
  });
  await writeBundles(bundle, baseOptions, buildProduct);
  if (buildProduct.includes('type')) {
    await generateTypesDefinitions(baseOptions, buildProduct);
  }
};
