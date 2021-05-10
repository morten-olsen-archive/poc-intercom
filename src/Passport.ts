import { pkg, unpkg } from './helpers/pkgs';
import Identity from './Identity';

interface Stamp {
  issuer: string;
  keyId: string;
  signature: string;
}

class Passport {
  #identity: Identity;
  stamps: Stamp[] = [];

  constructor(identity: Identity) {
    this.#identity = identity;
  }

  public get identity() {
    return this.#identity;
  }

  public toBuffer = () => {
    return pkg([
      this.#identity.publicKey,
    ]);
  };

  public static fromBuffer = (buffer: Buffer) => {
    const [publicKey] = unpkg(buffer);
    const identity = Identity.fromPublicKey(publicKey);
    const passport = new Passport(identity);
    return passport;
  };
}

export default Passport;
