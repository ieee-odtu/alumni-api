import jwt from 'jsonwebtoken';

import {secret} from '../config/database';
import {bearer as CUSTOM_BEARER, use_jti as USE_JTI, jtiers_list} from '../config/auth';
import {_EUNEXP, _FAIL, asyncWrap} from '../util';

import User from '../models/user';

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
    let decoded = await jwt.verify(bearer_token.slice(CUSTOM_BEARER.length + 1), secret)
    let found = await User.findById(decoded.id, {__v: 0, password: 0})
    if (found) {
      if (USE_JTI) {
        if (jtiers_list.includes(found.position)) {
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
          if (vopt.includes(found.position)) {
            req.user = found;
            console.log('[JV] +', found.name);
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
