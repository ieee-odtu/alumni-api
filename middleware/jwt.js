import jwt from 'jsonwebtoken';

import {secret} from '../config/database';
import {_EUNEXP} from '../util';

import User from '../models/user';

//VALIDATE_ONUNAUTH_ALLOW = 0;
//VALIDATE_ONUNAUTH_DENY = 1;
//DEF_VALIDATE_ONUNAUTH = 1;
//
//VALIDATE_ONUNF_ALLOW = 0;
//VALIDATE_ONUNF_DENY = 1;
//DEF_VALIDATE_ONUNF = 1;

constants = {
  U_UNREG: 'Unauthorized',
  VALIDATE_UTYPE_ALL: 'all',
  onunauth: {
    VALIDATE_ONUNAUTH_ALLOW: 0,
    VALIDATE_ONUNAUTH_DENY: 1,
    DEF_VALIDATE_ONUNAUTH: 1
  },
  onunf: {
    VALIDATE_ONUNF_ALLOW: 0,
    VALIDATE_ONUNF_DENY: 1,
    DEF_VALIDATE_ONUNF: 1
  }
}

//module.exports.v_onUnauth_A = VALIDATE_ONUNAUTH_ALLOW;
//module.exports.v_onUnauth_D = VALIDATE_ONUNAUTH_DENY;
//module.exports.v_onUnauth_Def = DEF_VALIDATE_ONUNAUTH;
//
//module.exports.v_onUnf_A = VALIDATE_ONUNF_ALLOW;
//module.exports.v_onUnf_D = VALIDATE_ONUNF_DENY;
//module.exports.v_onUnf_Def = DEF_VALIDATE_ONUNF;

module.exports.v_onUnauth_A = constants.onunauth.VALIDATE_ONUNAUTH_ALLOW;
module.exports.v_onUnauth_D = constants.onunauth.VALIDATE_ONUNAUTH_DENY;
module.exports.v_onUnauth_Def = constants.onunauth.DEF_VALIDATE_ONUNAUTH;

module.exports.v_onUnf_A = constants.onunf.VALIDATE_ONUNF_ALLOW;
module.exports.v_onUnf_D = constants.onunf.VALIDATE_ONUNF_DENY;
module.exports.v_onUnf_Def = constants.onunf.DEF_VALIDATE_ONUNF;

module.exports.constants = constants;

module.exports.jwtValidate = (options) => {
  return function(req, res, next){
    let opts = options || {};

    opts.utype = opts.utype || constants.VALIDATE_UTYPE_ALL;
    opts.onunauth = opts.onunauth || constants.onunauth.DEF_VALIDATE_ONUNAUTH;
    opts.onunf = opts.onunf || constants.onunf.DEF_VALIDATE_ONUNF;

    let bearer_token = req.headers.authorization;

    if (typeof bearer_token == 'undefined') {
      return res.status(400).json({
        success: false,
        code: 'JWT_HEADER_ND',
        middleware: 'jwtValidate'
      });
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
      User.findById(decoded.id, (err, found) => {
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
          if (opts.onunf == constants.onunf.VALIDATE_ONUNF_DENY) {
            return res.status(401).json({
              success: false,
              code: 'U_NF',
              debug: {
                found: found
              },
              middleware: 'jwtValidate'
            });
          } else if (opts.onunf == constants.onunf.VALIDATE_ONUNF_ALLOW) {
            req.user = constants.U_UNREG;
            next();
          } else {
            return res.status(500).json({
              success: false,
              msg: 'Internal error - Invalid opts.onunf value: ' + opts.onunf,
              middleware: 'jwtValidate'
            });
          }
        }
      });
    });
  }
}
