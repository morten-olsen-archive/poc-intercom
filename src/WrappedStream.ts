import { Duplex, PassThrough } from 'stream';
import Duplexify from 'duplexify';

class WrappedStream {
  private _read: PassThrough;
  private _write: PassThrough;
  private _stream: Duplex;

  constructor() {
    this._read = new PassThrough();
    this._write = new PassThrough();
    this._stream = new Duplexify(this._write, this._read);
  }

  protected get read() {
    return this._read;
  }

  protected get write() {
    return this._write;
  }

  public get stream() {
    return this._stream;
  }
}

export default WrappedStream;
