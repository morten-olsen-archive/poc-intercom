import crypto from 'crypto';
import { pkg } from './helpers/pkgs';
import Passport from './Passport';

const SIGN_ALGORITHM = null;

class Identity {
  #privateKey?: crypto.KeyObject;
  #publicKey!: crypto.KeyObject;

  constructor(publicKey?: crypto.KeyObject, privateKey?: crypto.KeyObject) {
    if (publicKey) {
      this.#publicKey = publicKey;
    }
    if (privateKey) {
      this.#privateKey = privateKey;
      this.#publicKey = crypto.createPublicKey(privateKey);
    }
  }

  public get publicKey() {
    return Buffer.from(
      this.#publicKey.export({
        type: 'spki',
        format: 'pem',
      }),
    );
  }

  public sign = (data: Buffer) => {
    if (!this.#privateKey) {
      throw new Error('Can not sign with only a public key');
    }
    const signature = crypto.sign(SIGN_ALGORITHM, data, this.#privateKey);
    return signature;
  }

  public verify = (data: Buffer, signature: Buffer) => {
    return crypto.verify(SIGN_ALGORITHM, data, this.#publicKey, signature);
  }

  public getPassport = () => {
    const data = pkg([
      Buffer.from(this.#publicKey.export({
        type: 'spki',
        format: 'pem',
      })),
    ]);
    const passport = Passport.fromBuffer(data)
    return passport;
  }

  public static fromPublicKey = (key: Buffer) => {
    const publicKey = crypto.createPublicKey(key);
    const identity = new Identity(publicKey);
    return identity;
  }

  public static fromPrivateKey = (key: Buffer) => {
    const privateKey = crypto.createPrivateKey(key);
    const identity = new Identity(undefined, privateKey);
    return identity;
  }

  public static create = () => {
    const keys = crypto.generateKeyPairSync('ed25519', {
    });
    return Identity.fromPrivateKey(keys.privateKey.export({
      type: 'pkcs8',
      format: 'pem',
    }) as Buffer);
  }
}

export default Identity;
