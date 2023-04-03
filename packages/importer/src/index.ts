import { Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { AuthenticationService } from '@feathersjs/authentication';
import auth from '@feathersjs/authentication-client';
import { feathers } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import fetch from 'cross-fetch';
import { sign } from 'jsonwebtoken';
import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import { parse } from 'yaml';

type ImportSpace = {
  id: string;
  name: string;
  description: string;
  address: string;
  email: string;
  location: { lon: number; lat: number };
};

type ServiceTypes = {
  authentication: AuthenticationService;
  spaces: AdapterService<Model.Space>;
};

async function init() {
  console.log('Initializing app...');

  if (process.env.FEATHERS_URL === undefined) {
    throw new Error('FEATHERS_URL is not defined');
  }
  if (process.env.JWT_SECRET === undefined) {
    throw new Error('JWT_SECRET is not defined');
  }
  if (process.env.USER_ID === undefined) {
    throw new Error('USER_ID is not defined');
  }

  const app = feathers<ServiceTypes>();

  const socket = io(process.env.FEATHERS_URL, {
    path: '/api/v1/socket',
    transports: ['websocket'],
    autoConnect: false,
  });

  app.configure(socketio(socket));

  app.configure(auth());

  app.on('connect', () => {
    console.log('Connected to backend');
  });

  app.on('disconnect', () => {
    console.log('Disconnected from backend');
  });

  socket.connect();

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  // generate a JWT token from secret
  const accessToken = sign(
    {
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 60 * 60 * 24 * 7,
      aud: 'api',
      sub: process.env.USER_ID,
      jti: uuid(),
    },
    process.env.JWT_SECRET,
  );

  await app.authenticate({
    strategy: 'jwt',
    accessToken,
  });

  const res = await fetch('https://raw.githubusercontent.com/coworkingspaces/spaces/main/spaces.yml');

  if (res.status >= 400) {
    throw new Error('Bad response from server');
  }

  const { spaces } = parse(await res.text()) as { spaces: ImportSpace[] };

  for await (const { name, address, description, email, id, location } of spaces) {
    const existingSpaces = (await app.service('spaces').find({ query: { importId: id } })) as Model.Space[];
    if (existingSpaces.length > 0) {
      console.log(`Updating space "${name}"...`);
      await app.service('spaces').patch(existingSpaces[0]._id, {
        name,
        plan: 'public',
        importId: id,
        address,
        description,
        email,
        coordinates: { lat: location.lat, lng: location.lon },
      });
      continue;
    }
    console.log(`Creating space "${name}"...`);
    await app.service('spaces').create({
      name,
      plan: 'public',
      importId: id,
      address,
      description,
      email,
      coordinates: { lat: location.lat, lng: location.lon },
    });
  }

  socket.disconnect();
}

void init();
