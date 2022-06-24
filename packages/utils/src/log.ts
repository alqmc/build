import { green, lightBlue, lightYellow, red } from 'kolorist';

const success = (msg: string) => console.log(green(msg));
const error = (msg: string) => console.log(red(msg));
const warning = (msg: string) => console.log(lightYellow(msg));
const info = (msg: string) => console.log(lightBlue(msg));

/**
 * 控制台日志
 */
export const log = {
  success,
  error,
  warning,
  info,
};
