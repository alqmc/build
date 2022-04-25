import { spawn } from 'child_process';
import type { TaskFunction } from 'gulp';

// run shell
export const run = (command: string, dir: string) => {
  const [cmd, ...args] = command.split(' ');
  return new Promise<void>((resolve, reject) => {
    const app = spawn(cmd, args, {
      cwd: dir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    const processExit = () => app.kill('SIGHUP');

    app.on('close', (code) => {
      process.removeListener('exit', processExit);
      if (code === 0) resolve();
      else
        reject(new Error(`command failed: \n command:${cmd} \n code:${code}`));
    });
    process.on('exit', processExit);
  });
};

// 附加glup task name
export const withTask = <T extends TaskFunction>(name: string, fn: T) =>
  Object.assign(fn, {
    displayName: name,
  });
