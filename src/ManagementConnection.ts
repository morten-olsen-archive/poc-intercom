import { Duplex, Transform } from 'stream';
import WrappedSteam from './WrappedStream';

type Listener = (type: number, content: Buffer) => void;

class ManagmentConnection extends WrappedSteam {
  private _externalStream: Duplex;
  private _listeners: Listener[] = [];

  constructor(stream: Duplex) {
    super();
    this._externalStream = stream;
    const outTransform = new Transform();
    outTransform._transform = (chunk, encoding, cb) => {
      outTransform.push(Buffer.concat([
        new Uint8Array([0]),
        chunk,
      ]), encoding);
      cb();
    };

    const inTransform = new Transform();
    inTransform._transform = (chunk: Buffer, encoding, cb) => {
      const type = chunk.readInt8(0);
      const content = chunk.slice(1);
      if (type > 0) {
        this._listeners.forEach(l => l(type, content));
      } else {
        inTransform.push(content, encoding);
      }
      cb();
    };

    this._externalStream.pipe(inTransform).pipe(this.read);
    this.write.pipe(outTransform).pipe(this._externalStream);
  }

  public managementWrite = (buffer: Buffer) => {
    this._externalStream.write(Buffer.concat([
      new Uint8Array([1]),
      buffer,
    ]));
  };

  public unlisten = (listener: Listener) => {
    this._listeners = this._listeners.filter(l => l !== listener);
  };

  public listen = (listener: Listener) => {
    this._listeners.push(listener);
  };
}

export default ManagmentConnection;
