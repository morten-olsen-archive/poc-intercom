import Passport from './Passport';
import Identity from './Identity';

interface Authority {
  identity: Identity;
}

class Authorities {
  #authorities: Authority[] = [];

  public validatePassport = (passport: Passport) => {
    return true;
  };

  public toBuffer = (identity: Identity) => {
  };

  public static fromBuffer = (data: Buffer, identity: Identity) => {
  };
}

export default Authorities;
