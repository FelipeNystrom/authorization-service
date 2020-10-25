import Debug from 'debug';
import express from 'express';
import nats from 'nats';
import dotenv from 'dotenv';

const { NODE_ENV, PORT, NATS_CONNECTION_URI } = process.env;

if (NODE_ENV === 'development') {
  dotenv.config({ path: __dirname + '/.env' });
}

import serviceCommSetup from './inter-service-comm';
import serverConfig from './server-config';

const debug = Debug('user-auth:server');
const server = express();
const nc = nats.connect({ url: NATS_CONNECTION_URI, json: true });

const port = PORT || 3000;

server.get('/healthcheck', (_, res) => {
  res.status(200).end();
});

serverConfig(server);
serviceCommSetup(nc);

server.all('*', (_, res) => {
  res.json({ voice: 'knock knock...' });
});

server.listen(port, () => debug(`User and auth service is up on http://localhost:${port} and nats on ${NATS_CONNECTION_URI}`));
