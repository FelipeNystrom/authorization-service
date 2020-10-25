import { Client } from 'nats';
import authHandling from './auth-handeling';

export default (channel: Client): void => {
  channel.on('error', (e) => {
    console.log('Error: ' + e);
    process.exit();
  });

  channel.on('connect', () => {
    console.log('Connected to NATS');
  });

  channel.on('close', () => {
    console.log('CLOSED');
    process.exit();
  });

  authHandling(channel);
};
