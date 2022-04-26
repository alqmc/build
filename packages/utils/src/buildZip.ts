import fs from 'fs';
import archiver from 'archiver';
import { log } from './log';
export interface ZipOptions {
  fileName: string;
  enterPath: string;
  outPath: string;
  format?: 'zip' | 'tar';
}
/**
 * 打包目录到指定文件夹
 * @param zipOptions
 */
export const createZip = async (zipOptions: ZipOptions) => {
  const { fileName, outPath, enterPath, format } = zipOptions;
  const output = fs.createWriteStream(`${outPath}/${fileName}`);
  const archive = archiver(format ? format : 'zip');
  archive.on('error', (err: any) => {
    throw err;
  });
  archive.pipe(output);
  archive.directory(enterPath, false);
  archive.finalize();
  log.success(`[打包]:文件${fileName}`);
};
