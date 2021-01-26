import express from '@feathersjs/express';
import app from './app';

const server = express(app);

server.listen(3000);
