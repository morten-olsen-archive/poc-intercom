import { Duplex } from 'stream';
import crypto, { ECDH } from 'crypto';
import WrappedSteam from './WrappedStream';
import Identity from './Identity';
import Passport from './Passport';
import Authorities from './Authorities';
import { pkg, unpkg } from './helpers/pkgs';

const EC_CURVE = 'secp521r1';

interface IntroductionParams {
  challenge: Buffer;
  authorities: Authorities;
  own: {
    identity: Identity;
    nonce: Buffer;
    curve: ECDH;
    challenge: Buffer;
  }
}

interface ChallengeParams extends IntroductionParams {
  participant: {
    publicKey: Buffer;
    passport: Passport;
    nonce: Buffer;
    challenge: Buffer;
  }
}

class SecureConnection extends WrappedSteam {
  private _externalStream: Duplex;

  constructor(
    externalStream: Duplex,
    identity: Identity,
    authorities: Authorities,
  ) {
    super();
    this._externalStream = externalStream;
    this._externalStream.pause();
    const curve = crypto.createECDH(EC_CURVE);
    curve.generateKeys();
    const nonce = crypto.randomBytes(16);
    const challenge = crypto.randomBytes(32);
    this._externalStream.once('data', this._handleIntroduction.bind(undefined, {
      challenge,
      authorities,
      own: {
        identity,
        curve,
        nonce,
        challenge,
      },
    }));
    this._externalStream.resume();
    const data = pkg([
      nonce,
      curve.getPublicKey(),
      identity.getPassport().toBuffer(),
      challenge,
    ]);

    const signed = pkg([
      identity.sign(data),
      data,
    ]);
    this._externalStream.write(signed);
  }

  private _handleIntroduction = (params: IntroductionParams, chunk: Buffer) => {
    const [signature, data] = unpkg(chunk);
    const [nonce, publicKey, passportData, challenge] = unpkg(data);
    const passport = Passport.fromBuffer(passportData);
    if (!passport.identity.verify(data, signature)) {
      throw new Error('Initial signature is not valid');
    }
    if (!params.authorities.validatePassport(passport)) {
      throw new Error('Authorities did not vaildate passport');
    }

    this._externalStream.once('data', this._handleChallengeResponse.bind(undefined, {
      ...params,
      participant: {
        nonce,
        publicKey,
        passport,
        challenge,
      },
    }));
    this._externalStream.write(pkg([
      params.own.identity.sign(challenge),
    ]));
  }

  private _handleChallengeResponse = (params: ChallengeParams, chunk: Buffer) => {
    const {
      own,
      participant,
    } = params;
    const [challengeResponse] = unpkg(chunk);
    const answeredCorrectly = participant.passport.identity.verify(
      own.challenge,
      challengeResponse,
    );
    if (!answeredCorrectly) {
      this._externalStream.destroy(new Error('Challenge failed'));
      throw new Error('Challenge failed');
    }
    const secret = own.curve.computeSecret(participant.publicKey);
    const encrypter = crypto.createCipheriv('chacha20', secret.slice(-32), own.nonce);
    const decrypter = crypto.createDecipheriv('chacha20', secret.slice(-32), participant.nonce);
    this.write.pipe(encrypter).pipe(this._externalStream);
    this._externalStream.pipe(decrypter).pipe(this.read);
    this.stream.resume();
  }
}

export default SecureConnection;
