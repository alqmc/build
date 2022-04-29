import type { ExternalOption, InputOption, Plugin } from 'rollup';
export interface BaseOptions {
  input: InputOption;
  outPutPath: string;
  enterPath: string;
  pkgPath: string;
  tsConfigPath: string;
}
export type PluginOptions = {
  mergeType: MergeType;
  plugins: Plugin[];
};
export type MergeType = 'prefix' | 'sufix' | 'overlap';
export interface DefineLibConfig {
  baseOptions: BaseOptions;
  pluginOptions?: PluginOptions;
  externalOptions?: ExternalOption;
  extraOptions?: Record<string, any>;
}
