import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import type { BaseOptions, PluginOptions } from '../type/build-typescript';
export const generatePlugin = (
  baseOptions: BaseOptions,
  pluginOptions: PluginOptions = []
) => {
  return [
    resolve({
      preferBuiltins: true,
    }),
    json(),
    commonjs(),
    esbuild({
      tsconfig: baseOptions.tsConfigPath,
    }),
    ...pluginOptions,
  ];
};
