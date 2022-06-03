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
} from './type/build-typescript';

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

const writeBundles = async (
  bundle: RollupBuild,
  baseOptions: BaseOptions,
  buildProduct: BuildProduct[],
  onlyOutput: boolean
) => {
  if (buildProduct.includes('es')) {
    bundle.write({
      format: 'es',
      dir: onlyOutput
        ? baseOptions.outPutPath
        : path.resolve(baseOptions.outPutPath, 'es'),
      preserveModules: true,
      entryFileNames: '[name].mjs',
    });
  }
  if (buildProduct.includes('lib')) {
    bundle.write({
      format: 'cjs',
      dir: onlyOutput
        ? baseOptions.outPutPath
        : path.resolve(baseOptions.outPutPath, 'lib'),
      preserveModules: true,
      entryFileNames: '[name].js',
      exports: 'named',
    });
  }
};

export * from './type/build-typescript';
export const buildTypescriptLib = async ({
  baseOptions,
  pluginOptions,
  externalOptions,
  extraOptions,
  buildProduct = ['lib', 'es', 'type'],
  pureOutput = false,
}: DefineLibConfig) => {
  const bundle = await buildModules({
    baseOptions,
    pluginOptions,
    externalOptions,
    extraOptions,
  });
  const onlyOutput = buildProduct.length === 1 && pureOutput;
  await writeBundles(bundle, baseOptions, buildProduct, onlyOutput);
  if (buildProduct.includes('type')) {
    await generateTypesDefinitions(baseOptions, buildProduct, onlyOutput);
  }
};
