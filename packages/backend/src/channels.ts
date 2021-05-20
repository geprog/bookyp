/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from '@bookyp/core';

export default function (app: Application): void {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on('connection', (connection: any) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (_authResult: any, { connection }: any) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // Obtain the logged in user from the connection
      // const user = connection.user;

      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);
    }
  });

  app.publish(() =>
    // To publish only for a specific event use `app.publish(eventName, () => {})`
    // e.g. to publish all service events to all authenticated users use
    app.channel('authenticated'),
  );
}
