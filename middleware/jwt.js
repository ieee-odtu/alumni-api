import jwt from 'jsonwebtoken';
import JsonWebTokenError from 'jsonwebtoken/lib/JsonWebTokenError';

import {secret} from '../config/database';
import {bearer as CUSTOM_BEARER, use_jti as USE_JTI, jtiers_list} from '../config/auth';
import {_EUNEXP, _FAIL, asyncWrap} from '../util';

import User from '../models/user';

module.exports.jwtBind = (vopts) => {
  let opts = Object.assign({}, vopts);
  return asyncWrap(async (req, res, next) => {
    let bearer_token = req.headers.authorization;
    if (typeof bearer_token == 'undefined') {
      next();
      return false;
    }
    if (!bearer_token.startsWith(CUSTOM_BEARER)) {
      next();
      return false;
    }
    let decoded;
    try {
      decoded = await jwt.verify(bearer_token.slice(CUSTOM_BEARER.length + 1), secret)
    } catch (e) {
      throw new JsonWebTokenError('corrupt token');
      return false;
    }
    let found = await User.findById(decoded.id, {__v: 0, password: 0})
    if (found) {
      if (USE_JTI) {
        if (jtiers_list.includes(found.utype)) {
          if (typeof decoded.jti != 'undefined') {
            if (found._jti != decoded.jti) {
              next();
              return false;
            }
          } else {
            next();
            return false;
          }
        }
      }
      req.user = found;
      if (opts.logging) {
        console.log('\x1b[1m\x1b[34m[JB]\x1b[0m +', found.username);
      }
      next();
    } else {
      next();
      return false;
    }
  })
}

module.exports.jwtValidate = (vc, vopt) => {
  return asyncWrap(async function(req, res, next) {
    if (typeof vc == 'undefined' || typeof vopt == 'undefined') {
      return _FAIL(res, 'JV_INV_ARGS', 'JV');
    }
    let bearer_token = req.headers.authorization;
    if (typeof bearer_token == 'undefined') {
      return _FAIL(res, 'JV_UNDEF_HEADER', 'JV');
    }
    if (!bearer_token.startsWith(CUSTOM_BEARER)) {
      return _FAIL(res, 'JV_INV_TOKEN', 'JV');
    }
    let decoded;
    try {
      decoded = await jwt.verify(bearer_token.slice(CUSTOM_BEARER.length + 1), secret)
    } catch (e) {
      throw new JsonWebTokenError('corrupt token');
      return false;
    }
    let found = await User.findById(decoded.id, {__v: 0, password: 0})
    if (found) {
      if (USE_JTI) {
        if (jtiers_list.includes(found.utype)) {
          if (typeof decoded.jti != 'undefined') {
            if (found._jti != decoded.jti) {
              return _FAIL(res, 'JV_INV_JTI', 'JV');
            }
          } else {
            return _FAIL(res, 'JV_UNDEF_JTI', 'JV');
          }
        }
      }
      switch (vc) {
        case 'utype':
          if (vopt.includes(found.utype)) {
            req.user = found;

            if (typeof User.ccodes[found.utype] != 'undefined') {
              console.log('\x1b[34m[JV]\x1b[0m +', found.username, User.ccodes[found.utype] + '<' + found.utype + '>\x1b[0m');
            } else {
              console.log('\x1b[34m[JV]\x1b[0m +', found.username, '<' + found.utype + '>');
            }

            next();
          } else {
            return _FAIL(res, 'E_UNAUTH', 'JV');
          }
          break;
        default:
          return _FAIL(res, 'JV_INV_OPTS', 'JV');
      }
    } else {
      return _FAIL(res, 'U_NF', 'JV');
    }
  })
}
