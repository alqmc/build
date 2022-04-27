import { resolve } from 'path';

export const rootPath = resolve(__dirname, '..');

export const buildOutPath = resolve(rootPath, 'dist');

export const enterPath = resolve(rootPath, 'packages');
