import type { ProjectManifest } from '@pnpm/types';

export const getPackageDependencies = (
  pkgPath: string
): Record<'dependencies' | 'peerDependencies', string[]> => {
  const { dependencies = {}, peerDependencies = {} } =
    getPackageManifest(pkgPath);

  return {
    dependencies: Object.keys(dependencies),
    peerDependencies: Object.keys(peerDependencies),
  };
};

export const getPackageManifest = (pkgPath: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(pkgPath) as ProjectManifest;
};

// 获取打包忽略引用文件
export const getExternal = async (options: {
  outputPackage: string;
  extraExternal?: string[];
  includePackages: string[];
}) => {
  const { peerDependencies, dependencies } = getPackageDependencies(
    options.outputPackage
  );
  const extraExternal = Array.isArray(options.extraExternal)
    ? options.extraExternal
    : [];
  return (id: string) => {
    const packages: string[] = [
      ...peerDependencies,
      ...dependencies,
      ...extraExternal,
    ].filter((x) => !options.includePackages.includes(x));
    return [...new Set(packages)].some(
      (pkg) => id === pkg || id.startsWith(`${pkg}/`)
    );
  };
};
