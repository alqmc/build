import type { ExternalOption, InputOption, Plugin } from 'rollup';
export interface BaseOptions {
  input: InputOption;
  outPutPath: string;
  enterPath: string;
  pkgPath: string;
  tsConfigPath: string;
}
export type PluginOptions = Plugin[];

export interface DefineLibConfig {
  baseOptions: BaseOptions;
  pluginOptions?: PluginOptions;
  externalOptions?: ExternalOption;
  extraOptions?: Record<string, any>;
}
