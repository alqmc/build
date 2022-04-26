import { format } from 'prettier';
import type { Options } from 'prettier';

const defalutOptions = {
  parser: 'typescript',
  semi: false,
  singleQuote: true,
};
/**
 * prettier 格式化代码
 * @param code
 * @param prettierOptions
 * @returns
 */
export const formatCode = (
  code: string,
  prettierOptions: Options = defalutOptions
) => format(code, prettierOptions);
