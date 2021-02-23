import express from '@feathersjs/express';
import app from './app';
import config from './config';

function start(): void {
  console.log('⚡ Backend starting ...');

  const { port } = config().app;

  const server = express(app);
  server.listen(port);

  console.log('🚀 Backend running at:');
  console.log(`> Local: http://localhost:${port}`);
}

start();
