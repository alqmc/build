import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import type { Plugin } from 'rollup';
import type {
  BaseOptions,
  MergeType,
  PluginOptions,
} from '../type/build-typescript';
export const generatePlugin = (
  baseOptions: BaseOptions,
  pluginOptions: PluginOptions = {
    mergeType: 'sufix',
    plugins: [],
  }
) => {
  const defaultOptions = [
    resolve({
      preferBuiltins: true,
    }),
    json(),
    commonjs(),
    esbuild({
      tsconfig: baseOptions.tsConfigPath,
    }),
  ];
  if (pluginOptions.mergeType === 'overlap') return pluginOptions.plugins;
  return mergePlugins(
    defaultOptions,
    pluginOptions.plugins,
    pluginOptions.mergeType
  );
};

export const mergePlugins = (
  defaultPlugins: Plugin[],
  propsPlugins: Plugin[],
  mergeType: MergeType
) => {
  const plugins = [] as Plugin[];
  defaultPlugins.forEach((x) => {
    const plugin = propsPlugins.filter((p) => p.name === x.name);
    if (plugin.length > 0) {
      plugins.push(plugin[0]);
    } else {
      plugins.push(x);
    }
  });
  const extraPlugins = [] as Plugin[];
  propsPlugins.forEach((x) => {
    const plugin = defaultPlugins.filter((p) => p.name === x.name);
    if (plugin.length === 0) {
      extraPlugins.push(x);
    }
  });
  if (mergeType === 'prefix') return [...extraPlugins, ...plugins];
  if (mergeType === 'sufix') return [...plugins, ...extraPlugins];
  return plugins;
};
