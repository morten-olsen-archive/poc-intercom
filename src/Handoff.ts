import { Duplex } from 'stream';
import WrappedStream from './WrappedStream';

type GetStream<T> = (config: T) => Promise<Duplex>;

class Handoff<ConfigType = any> extends WrappedStream {
  private _getStream: GetStream<ConfigType>;
  private _cache?: Buffer;

  constructor(getStream: GetStream<ConfigType>) {
    super();
    this._getStream = getStream;
  }

  public attach = async (config: ConfigType) => {
    this.stream.pause();
    const stream = await this._getStream(config);
    if (this._cache) {
      stream.write(this._cache);
      this._cache = undefined;
    }
    const reconnect = () => {
      this.stream.pause();
      stream.off('error', reconnect);
      stream.off('close', reconnect);
      this.attach(config);
    };
    stream.on('error', reconnect);
    stream.on('close', reconnect);
    stream.on('data', chunk => this.read.push(chunk));
    this.write.on('data', (chunk) => {
      if (stream.destroyed) {
        this._cache = Buffer.concat([
          this._cache || Buffer.alloc(0),
          chunk,
        ]);
      } else {
        stream.write(chunk);
      }
    });
    this.stream.resume();
  }
}

export default Handoff;
