/**
 * Makes the local app reachable from the internet with a Cloudflare quick tunnel, so the payment
 * provider can call the webhooks. Sets NUXT_PUBLIC_APP_URL in .env to the tunnel address (`pnpm dev`
 * restarts on the change) and restores the previous value when the tunnel is stopped.
 * Usage: `pnpm tunnel` (needs `cloudflared`, uses PORT from .env)
 */
import type { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { config as dotenv } from 'dotenv';

const envFile = new URL('../.env', import.meta.url).pathname;
dotenv({ path: envFile, quiet: true });
const port = process.env.PORT || '3000';

const original = readFileSync(envFile, 'utf8');
const urlLine = /^NUXT_PUBLIC_APP_URL=.*$/m;

function setAppUrl(url: string): void {
  const line = `NUXT_PUBLIC_APP_URL=${url}`;
  const env = readFileSync(envFile, 'utf8');
  writeFileSync(envFile, urlLine.test(env) ? env.replace(urlLine, line) : `${env.trimEnd()}\n${line}\n`);
}

function restore(): void {
  const previous = original.match(urlLine)?.[0];
  const env = readFileSync(envFile, 'utf8');
  writeFileSync(envFile, previous ? env.replace(urlLine, previous) : env.replace(/\n?^NUXT_PUBLIC_APP_URL=.*$/m, ''));
  console.log('↩️ Restored NUXT_PUBLIC_APP_URL in .env');
}

const tunnel = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
let url: string | undefined;

// cloudflared prints the address of the tunnel in its log
for (const stream of [tunnel.stdout, tunnel.stderr]) {
  stream.on('data', (chunk: Buffer) => {
    const found = chunk.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (found && !url) {
      url = found[0];
      setAppUrl(url);
      console.log(`🚇 Tunnel to http://localhost:${port} is open at ${url}\n   NUXT_PUBLIC_APP_URL in .env is set, stop with Ctrl+C`);
    }
  });
}

let stopping = false;
function stop(): void {
  if (stopping) {
    return;
  }
  stopping = true;
  if (url) {
    restore();
  }
  tunnel.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
tunnel.on('exit', (code) => {
  stop();
  process.exit(code ?? 0);
});
tunnel.on('error', (error) => {
  console.error('🔥 Could not start cloudflared, is it installed?', error.message);
  process.exit(1);
});
