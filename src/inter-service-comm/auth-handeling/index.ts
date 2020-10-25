// import bcrypt from 'bcryptjs';
import { Client } from 'nats';

export default (channel: Client): void => {
  channel.subscribe('auth.verify', async (msg, reply) => {
    console.log('Received "' + JSON.stringify(msg) + '"');
  });
};
