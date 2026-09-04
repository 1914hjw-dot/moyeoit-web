import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
const nextBinary = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
const server = spawn(process.execPath, [nextBinary, 'start', '--hostname', '127.0.0.1', '--port', '0'], {
  cwd: projectDirectory,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

function waitForServer() {
  return new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => finish(new Error('Local production server did not become ready.')), 45_000);
    function finish(error, url) {
      clearTimeout(timeout);
      server.stdout.off('data', onOutput);
      server.stderr.off('data', onOutput);
      server.off('error', onError);
      server.off('exit', onExit);
      if (error) reject(error);
      else resolve(url);
    }
    function onOutput(chunk) {
      output = `${output}${chunk}`.slice(-8_000);
      const address = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (address && output.includes('Ready in')) finish(undefined, address[0]);
    }
    function onError(error) {
      finish(error);
    }
    function onExit(code) {
      finish(new Error(`Local production server exited (${code}).\n${output}`));
    }
    server.stdout.on('data', onOutput);
    server.stderr.on('data', onOutput);
    server.once('error', onError);
    server.once('exit', onExit);
  });
}

try {
  const baseUrl = await waitForServer();
  const exitCode = await new Promise((resolve, reject) => {
    const tests = spawn(process.execPath, [
      '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
      '--experimental-strip-types',
      '--test',
      'tests/content.test.mts',
    ], {
      cwd: projectDirectory,
      env: { ...process.env, CONTENT_TEST_BASE_URL: baseUrl },
      stdio: 'inherit',
      windowsHide: true,
    });
    tests.once('error', reject);
    tests.once('exit', (code) => resolve(code ?? 1));
  });
  process.exitCode = exitCode;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (server.exitCode === null && server.signalCode === null) {
    await new Promise((resolve) => {
      const timeout = setTimeout(() => server.kill('SIGKILL'), 5_000);
      server.once('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
      server.kill();
    });
  }
}
