import { ManagementConnection } from '../src';
import { createConnection } from './helpers/connection';

describe('ManagementConnection', () => {
  it('should be able to send managment package', (done) => {
    const [alice, bob] = createConnection();
    const aliceM = new ManagementConnection(alice);

    bob.on('data', (chunk: Buffer) => {
      const type = chunk.readInt8(0);
      const content = chunk.slice(1).toString();
      expect(type).toBe(1);
      expect(content).toBe('Hello World');
      done();
    });

    aliceM.managementWrite(Buffer.from('Hello World'));
  });

  it('should be able to send data package', (done) => {
    const [alice, bob] = createConnection();
    const aliceM = new ManagementConnection(alice);

    bob.on('data', (chunk: Buffer) => {
      const type = chunk.readInt8(0);
      const content = chunk.slice(1).toString();
      expect(type).toBe(0);
      expect(content).toBe('Hello World');
      done();
    });

    aliceM.stream.write(Buffer.from('Hello World'));
  });

  it('should be able to receive managment package', (done) => {
    const [alice, bob] = createConnection();
    const bobM = new ManagementConnection(bob);

    bobM.listen((type: number, data: Buffer) => {
      expect(type).toBe(1);
      expect(data.toString()).toBe('Hello World');
      done();
    });

    alice.write(Buffer.concat([
      Buffer.from(new Uint8Array([1])),
      Buffer.from('Hello World'),
    ]));
  });


  it('should be able to receive data package', (done) => {
    const [alice, bob] = createConnection();
    const bobM = new ManagementConnection(bob);

    bobM.stream.on('data', (data: Buffer) => {
      expect(data.toString()).toBe('Hello World');
      done();
    });

    alice.write(Buffer.concat([
      Buffer.from(new Uint8Array([0])),
      Buffer.from('Hello World'),
    ]));
  });

});
