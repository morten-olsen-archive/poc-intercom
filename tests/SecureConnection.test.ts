import { SecureConnection, Authorities, Identity } from '../src';
import { createConnection } from './helpers/connection';

describe('SecureConnection', () => {
  it('should be able to send an encrypted message', (done) => {
    const authorities = new Authorities();
    const aliceIdentity = Identity.create();
    const bobIdentity = Identity.create();
    const [alice, bob] = createConnection();
    const aliceSecured = new SecureConnection(
      alice,
      aliceIdentity,
      authorities,
    );
    const bobSecured = new SecureConnection(
      bob,
      bobIdentity,
      authorities,
    );

    bobSecured.stream.on('data', (chunk) => {
      expect(chunk.toString('utf-8')).toBe('Protected message');
      done();
    });

    aliceSecured.stream.write(Buffer.from('Protected message'));
  });
});
