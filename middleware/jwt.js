import jwt from 'jsonwebtoken';

import {secret} from '../config/database';

import User from '../models/user';

module.exports.jwtValidate = (options) => {
  return function(req, res, next){
    let opts = options || {};
    let bearer_token = req.headers.authorization;

    if (typeof bearer_token == 'undefined') {
      return res.status(400).json({
        success: false,
        msg: 'Authorization header not defined',
        middleware: 'jwtValidate'
      });
    }

    if (!bearer_token.startsWith('JWT ')) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid authorization token',
        middleware: 'jwtValidate'
      });
    }

    jwt.verify(bearer_token.slice(4), secret, (err, decoded) => {
      if (err) {
        return res.status(400).json({
          success: false,
          msg: 'Token verification error',
          err: err,
          debug: {
            decoded: decoded
          },
          middleware: 'jwtValidate'
        });
      }
      User.findById(decoded.id, (err, found) => {
        if (err) {
          return res.status(500).json({
            success: false,
            msg: 'Unexpected error',
            err: err,
            debug: {
              found: found,
              id: decoded.id
            },
            middleware: 'jwtValidate'
          });
        }
        if (found) {
          if (typeof opts.utype != 'undefined') {
            if (!opts.utype.includes(found.utype)) {
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
          }
          req.user = found;
          req.user.authorization = decoded.authorization;
          next();
        } else {
          return res.status(401).json({
            success: false,
            msg: 'User not found',
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
