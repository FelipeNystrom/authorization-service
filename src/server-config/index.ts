import express, { Express } from 'express';
import sanitize from 'sanitize';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

export default (server: Express): void => {
  server.use(morgan('combined'));
  server.use(helmet());
  server.use(compression());
  server.use(sanitize.middleware);
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
};
