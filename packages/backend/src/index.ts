import express from '@feathersjs/express';

import app from './app';
import config from './config';
import { connect as databaseConnect } from './database';

async function start(): Promise<void> {
  console.log('⚡ Backend starting ...');

  const { port } = config().app;

  await databaseConnect();

  const server = express(app);
  server.listen(port);

  console.log('🚀 Backend running at:');
  console.log(`> Local: http://localhost:${port}`);
}

void start();
