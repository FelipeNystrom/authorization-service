import nats, { Client } from 'nats';
import authHandling from './auth-handeling';
import uuid from 'uuid-random';
import Debug from 'debug';

const debug = Debug('authorization:nats-init');

let client: Client | null = null;

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

  client = channel;
};

type Payload = unknown & { __payload_id?: string };
export class RPC {
  topic: string;
  payload: Payload;
  constructor({ topic, payload }) {
    this.topic = topic;
    this.payload = payload;
  }

  send(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const inbox = nats.createInbox();

      this.payload.__payload_id = uuid();

      debug(`payload: ${JSON.stringify(this.payload)}`);
      client.subscribe(inbox, { max: 1 }, (msg) => {
        if (msg) {
          return resolve({ ...msg });
        }
      });

      client.publish(this.topic, this.payload, inbox);

      setTimeout(() => {
        return reject();
      }, 2000);
    });
  }
}
