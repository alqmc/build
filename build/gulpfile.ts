import { series } from 'gulp';
import { buildTypescript } from './buildTypescript';
import { buildutils } from './buildUtils';
import { buildvueLib } from './buildVue';

export const ts = series(buildTypescript);
export const utils = series(buildutils);
export const vue = series(buildvueLib);
