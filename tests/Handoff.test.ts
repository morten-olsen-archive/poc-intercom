import { Duplex } from 'stream';
import { Handoff } from '../src';
import { createConnection } from './helpers/connection';

describe('Handoff', () => {
  it('should be able to send data through the handoff', (done) => {
    const [alice, bob] = createConnection();
    const aliceHandoff = new Handoff<Duplex>(async a => a);
    bob.on('data', (chunk) => {
      expect(chunk.toString()).toBe('test');
      done();
    });
    aliceHandoff.attach(alice);
    aliceHandoff.stream.write('test');
  });

  it('should be able to receive data through the handoff', (done) => {
    const [alice, bob] = createConnection();
    const aliceHandoff = new Handoff<Duplex>(async a => a);
    aliceHandoff.stream.on('data', (chunk) => {
      expect(chunk.toString()).toBe('test');
      done();
    });
    aliceHandoff.attach(alice);
    bob.write('test');
  });

  it('should be able to recover write on new connection', (done) => {
    const [alice1, bob1] = createConnection();
    const [alice2, bob2] = createConnection();
    const alice = [alice1, alice2];
    const aliceHandoff = new Handoff(async () => alice.shift() as any);
    const result: string[][] = [[], []];
    bob1.on('data', (chunk) => {
      result[0].push(chunk.toString());
    });
    bob2.on('data', (chunk) => {
      result[1].push(chunk.toString());
      expect(result).toEqual([
        ['msg 1'],
        ['msg 2'],
      ]);
      done();
    });
    aliceHandoff.attach(undefined);
    aliceHandoff.stream.write('msg 1');
    setTimeout(() => {
      alice1.destroy(new Error('disconnected'));
      aliceHandoff.stream.write('msg 2');
    }, 1);
  });

  it('should be able to recover read on new connection', (done) => {
    const [alice1, bob1] = createConnection();
    const [alice2, bob2] = createConnection();
    const alice = [alice1, alice2];
    const aliceHandoff = new Handoff(async () => alice.shift() as any);
    const result: string[] = [];
    aliceHandoff.stream.on('data', (chunk) => {
      result.push(chunk.toString());
      if (result.length === 2) {
        expect(result).toEqual([
          'msg 1',
          'msg 2',
        ]);
        done();
      }
    });
    aliceHandoff.attach(undefined);
    bob1.write('msg 1');
    setTimeout(() => {
      bob1.destroy(new Error('disconnected'));
      bob2.write('msg 2');
    }, 1);
  });
});
