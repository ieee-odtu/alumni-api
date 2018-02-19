import jwt from 'jsonwebtoken';

import {secret} from '../config/database';
import {_EUNEXP} from '../util';

import User from '../models/user';

const constants = {
  U_UNREG: 'Unauthorized',
  VALIDATE_UTYPE_ALL: 'all',
  onunauth: {
    VALIDATE_ONUNAUTH_ALLOW: 1,
    VALIDATE_ONUNAUTH_DENY: 2,
    DEF_VALIDATE_ONUNAUTH: 2
  },
  onhnd: {
    VALIDATE_ONHND_ALLOW: 1,
    VALIDATE_ONHND_DENY: 2,
    DEF_VALIDATE_ONHND: 2
  }
}

module.exports.v_onUnauth_A = constants.onunauth.VALIDATE_ONUNAUTH_ALLOW;
module.exports.v_onUnauth_D = constants.onunauth.VALIDATE_ONUNAUTH_DENY;
module.exports.v_onUnauth_Def = constants.onunauth.DEF_VALIDATE_ONUNAUTH;

module.exports.v_onHnd_A = constants.onhnd.VALIDATE_ONHND_ALLOW;
module.exports.v_onHnd_D = constants.onhnd.VALIDATE_ONHND_DENY;
module.exports.v_onHnd_Def = constants.onhnd.DEF_VALIDATE_ONHND;

module.exports.constants = constants;

module.exports.jwtValidate = (options) => {
  return function(req, res, next){
    let opts;
    if (typeof options == 'undefined') {
      opts = {};
    } else {
      opts = Object.assign({}, options);
    }

    opts.utype = opts.utype || constants.VALIDATE_UTYPE_ALL;
    opts.onunauth = opts.onunauth || constants.onunauth.DEF_VALIDATE_ONUNAUTH;
    opts.onhnd = opts.onhnd || constants.onhnd.DEF_VALIDATE_ONHND;

    let bearer_token = req.headers.authorization;

    if (typeof bearer_token == 'undefined') {
      if (opts.onhnd == constants.onhnd.VALIDATE_ONHND_DENY) {
        return res.status(400).json({
          success: false,
          code: 'JWT_HEADER_ND',
          middleware: 'jwtValidate'
        });
      } else if (opts.onhnd == constants.onhnd.VALIDATE_ONHND_ALLOW) {
        req.user = constants.U_UNREG;
        next();
        return;
      } else {
        return res.status(500).json({
          success: false,
          msg: 'Internal error - Invalid opts.onunauth value: ' + opts.onunauth,
          middleware: 'jwtValidate'
        });
      }
    }

    if (!bearer_token.startsWith('JWT ')) {
      return res.status(400).json({
        success: false,
        code: 'JWT_INV_AUTH_TOKEN',
        middleware: 'jwtValidate'
      });
    }

    jwt.verify(bearer_token.slice(4), secret, (err, decoded) => {
      if (err) {
        return res.status(400).json({
          success: false,
          code: 'E_JWT_VERIFY',
          err: err,
          debug: {
            decoded: decoded
          },
          middleware: 'jwtValidate'
        });
      }
      User.findById(decoded.id, {__v: 0, password: 0}, (err, found) => {
        if (err) {
          return _EUNEXP(res, err, {
            found: found,
            id: decoded.id
          }, 'jwtValidate');
        }
        if (found) {
          //if (typeof opts.utype != 'undefined') {
          if (opts.utype != constants.VALIDATE_UTYPE_ALL) {
            if (!opts.utype.includes(found.utype)) {
              if (opts.onunauth == constants.onunauth.VALIDATE_ONUNAUTH_DENY) {
                return res.status(401).json({
                  success: false,
                  code: 'Unauthorized user type',
                  debug: {
                    requirement: opts.utype,
                    utype: found.utype,
                    found: found
                  },
                  middleware: 'jwtValidate'
                });
              }
              if (opts.onunauth != constants.onunauth.VALIDATE_ONUNAUTH_ALLOW) {
                return res.status(500).json({
                  success: false,
                  msg: 'Internal error - Invalid opts.onunauth value: ' + opts.onunauth,
                  middleware: 'jwtValidate'
                });
              }
            }
          }
          req.user = found;
          req.user.authorization = decoded.authorization;
          next();
        } else {
          return res.status(401).json({
            success: false,
            code: 'U_NF',
            debug: {
              found: found
            },
            middleware: 'jwtValidate'
          });
        }
      });
    });
  }
}
