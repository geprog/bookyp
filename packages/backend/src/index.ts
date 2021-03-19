import app from './app';
import config from './config';
import { connect as databaseConnect } from './database';

async function start(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('⚡ Backend starting ...');

  const { port } = config().app;

  await databaseConnect();

  app.listen(port);

  // eslint-disable-next-line no-console
  console.log('🚀 Backend running at:');
  // eslint-disable-next-line no-console
  console.log(`> Local: http://localhost:${port}`);
}

void start();
