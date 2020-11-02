// import bcrypt from 'bcryptjs';
import { Client } from 'nats';
import { ForbiddenError, subject } from '@casl/ability';
import { defineAbilityFor } from '../../permissions-handler';
import { RPC } from '../index';
import { debug } from 'console';

export default (channel: Client): void => {
  channel.subscribe('auth.verify', async (msg, reply) => {
    console.log('Received "' + JSON.stringify(msg) + '"');

    try {
      const abilities = defineAbilityFor(msg.user);

      ForbiddenError.setDefaultMessage((error) => `You are not allowed to ${error.action} on ${error.subjectType}`);

      if (msg.subject?.sub === 'Post' || msg.subject?.sub === 'Comment') {
        try {
          const rpc = new RPC({
            topic: `${msg.subject.sub.toLowerCase()}.get.author`,
            payload: { id: msg.subject.id },
          });

          const author_id = await (rpc.send() as Promise<number>);

          ForbiddenError.from(abilities).throwUnlessCan(msg.action, subject(msg.subject.sub, { author_id }));
        } catch (e) {
          debug(e?.message || e);
          if (e instanceof ForbiddenError) {
            channel.publish(reply, { hasPermission: false });
          }
        }
      } else {
        ForbiddenError.from(abilities).throwUnlessCan(msg.action, msg.subject);
      }

      channel.publish(reply, { hasPermission: true });
    } catch (e) {
      debug(e?.message || e);
      if (e instanceof ForbiddenError) {
        channel.publish(reply, { hasPermission: false });
      }
    }
  });
};
