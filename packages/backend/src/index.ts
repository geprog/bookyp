import { createLightship } from 'lightship';

import app from './app';
import config from './config';
import { connect as databaseConnect } from './database';

async function start(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('⚡ Backend starting ...');

  const lightship = createLightship();

  const { port, host } = config().app;

  await databaseConnect();

  const server = app
    .listen(port, () => {
      lightship.signalReady();

      // eslint-disable-next-line no-console
      console.log('🚀 Backend running at:');

      // eslint-disable-next-line no-console
      console.log(`> Local: http://localhost:${port}`);

      if (host !== 'localhost') {
        // eslint-disable-next-line no-console
        console.log(`> Public: https://${host}`);
      }
    })
    .on('error', () => {
      void lightship.shutdown();
    });

  lightship.registerShutdownHandler(() => {
    server.close();
  });
}

void start();
