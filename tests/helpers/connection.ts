import { PassThrough } from 'stream';

export const createConnection = () => {
  const a = new PassThrough();
  const b = new PassThrough();

  a._write = (chunk, encoding, cb) => {
    b.push(chunk, encoding);
    cb();
  };

  b._write = (chunk, encoding, cb) => {
    a.push(chunk, encoding);
    cb();
  };

  a.on('error', (err) => {
    b.destroy(err);
  });

  b.on('error', (err) => {
    a.destroy(err);
  });

  return [a, b];
};
