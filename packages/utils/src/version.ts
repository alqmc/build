import { readFile, writeFile } from 'fs/promises';
import readline from 'readline';
import { log } from './log';
/**
 * 修改version
 * @param {string} version
 * @param {string} source
 */
const changeVersion = (version: string, source: string) => {
  readFile(source)
    .then((data) => {
      const pkg = JSON.parse(data.toString());
      pkg.version = version;
      writeFile(source, JSON.stringify(pkg, null, 2))
        .then(() => {
          console.log(log.success(`${source}文件，version更改为:${version}`));
        })
        .catch((err) => {
          console.error(err);
          process.exit(1);
        });
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
};

/**
 * 获取输入版本号
 * @param rl
 */
const getVersion = (rl: readline.Interface): Promise<string> => {
  return new Promise((resolve) => {
    rl.question('请输入版本号：', async (version) => {
      const reg = /^([0-9]\d|[0-9])(\.([0-9]\d|\d)){2}$/;
      if (reg.test(version)) {
        rl.close();
        resolve(version);
      } else {
        console.log(log.error(`请输入正确的版本号!`));
        resolve(await getVersion(rl));
      }
    });
  });
};
export interface VersionOptions {
  targetPkgPath: string | string[];
}

/**
 * 更新指定文件版本号
 * @param versionOptions
 * @returns
 */
export const updateVersion = async (
  versionOptions: VersionOptions
): Promise<Error | void> => {
  if (!versionOptions) return new Error('versionOptions is required');

  const { targetPkgPath } = versionOptions;
  if (!targetPkgPath || targetPkgPath.length === 0)
    return new Error('targetPkgPath is required');

  const pkgList = Array.isArray(targetPkgPath)
    ? targetPkgPath
    : [targetPkgPath];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const pkgBuffer = await readFile(pkgList[0]);
  const pkg = JSON.parse(pkgBuffer.toString());
  if (!pkg.version) return new Error('version not found');
  rl.question(
    `是否需要修改(当前:${pkg.version})版本号(Y/N)：`,
    async (answer) => {
      if (answer === 'Y' || answer === 'y') {
        const version = await getVersion(rl);
        pkgList.forEach((pkg) => {
          changeVersion(version, pkg);
        });
      } else {
        rl.close();
      }
    }
  );
};
