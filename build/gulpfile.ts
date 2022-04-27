import { series } from 'gulp';
import { buildTypescript } from './buildTypescript';
import { buildutils } from './buildUtils';

export default series(buildTypescript, buildutils);
