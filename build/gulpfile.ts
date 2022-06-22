import { series } from 'gulp';
import { buildTypescript } from './buildTypescript';
import { buildutils } from './buildUtils';
import { buildvueLib } from './buildVue';

export default series(buildTypescript);
