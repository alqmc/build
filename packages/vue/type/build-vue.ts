import type {
  ExternalOption,
  InputOption,
  OutputOptions,
  Plugin,
} from 'rollup';
export type BuildProduct = 'type' | 'lib' | 'es';
export interface BaseOptions {
  input: InputOption;
  outPutPath: string;
  enterPath: string;
  pkgPath: string;
  tsConfigPath: string;
  preserveModules?: boolean;
  extraOptions?: Partial<OutputOptions>;
}
export type PluginOptions = {
  mergeType: MergeType;
  plugins: Plugin[];
};
export type MergeType = 'prefix' | 'sufix' | 'overlap';
export interface DefineVueConfig {
  baseOptions: BaseOptions;
  pluginOptions?: PluginOptions;
  externalOptions?: ExternalOption;
  includePackages?: string[];
  extraOptions?: Record<string, any>;
  buildProduct?: BuildProduct[];
  pureOutput?: boolean;
}
