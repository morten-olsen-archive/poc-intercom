import { Duplex } from 'stream';

interface DeviceDescription {
  id: string;
  name: string;
}

interface Backend<ConnectionConfig = any> {
  onDeviceDiscovered: (listener: (device: DeviceDescription) => void) => void;
  onDeviceList: (listener: (device: DeviceDescription) => void) => void;
  knowsDevice: (deviceId: string) => boolean;
  createStream: (deviceId: string) => Promise<Duplex>;
  listen?: (listener: (stream: Duplex) => void) => void;
  advertise?: (identifier: string) => void;
}

export default Backend;
