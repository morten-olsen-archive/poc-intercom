import Backend from './Backend';
import { nanoid } from 'nanoid';
import { EventEmitter } from 'events';
import { Duplex } from 'stream';


class ConnectionFactory extends EventEmitter {
  #deviceId: string;
  #backends: Backend[] = [];

  constructor(deviceId: string) {
    this.#deviceId = deviceId;
  }

  private _handleStream = (stream: Duplex) => {
    this.emit('connection', stream);
  }

  public registerBackend = (backend: Backend) => {
    this.#backends.push(backend);
    if (backend.listen) {
      backend.listen(this._handleStream);
    }
    if (backend.advertise) {
      backend.advertise(this.#deviceId);
    }
  };

  public createConnection = (deviceId: string) => {
    // Fetch all device lists
    // find connection which contains given deviceId
    // establish connection using the given backend
  };
}

export default ConnectionFactory;
