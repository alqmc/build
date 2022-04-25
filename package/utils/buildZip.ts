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
  const output = fs.createWriteStream(`${enterPath}/${fileName}`);
  const archive = archiver(format ? format : 'zip');
  archive.on('error', (err: any) => {
    throw err;
  });
  archive.pipe(output);
  archive.directory(outPath, false);
  archive.finalize();
  log.success(`已打包文件${fileName}==>${outPath}`);
};
