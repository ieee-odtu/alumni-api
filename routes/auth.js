import express from 'express';
const router = express.Router();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {secret} from '../config/database';
import {use_jti as USE_JTI, jtiers_list} from '../config/auth';
import {_EUNEXP, _SUCC, _FAIL, asyncWrap} from '../util';

import User from '../models/user';

router.post('/login', asyncWrap(async (req, res, next) => {
  let auth_field;
  let auth_field_val;

  if (typeof req.body.username != 'undefined') {
    auth_field = 'username';
    auth_field_val = req.body.username;
  } else if (typeof req.body.email != 'undefined') {
    auth_field = 'email';
    auth_field_val = req.body.email;
  } else {
    return _FAIL(res, 'LOGIN_FIELDS_UNDEF');
  }

  let query = {};
  query[auth_field] = auth_field_val;

  let found = await User.findOne(query)
  if (found) {
    let isMatch = await bcrypt.compare(req.body.password, found.password)
    if (isMatch) {
      let token = jwt.sign({
        authorization: found.utype,
        username: found.username,
        id: found._id,
        login_time: new Date().toJSON()
      }, secret, {
        algorithm: 'HS512',
        expiresIn: '12h'
      });
      return _SUCC(res, {
        token: token,
        username: found.username
      });
    } else {
      return _FAIL(res, 'WRONG_PWD');
    }
  } else {
    return _FAIL(res, 'U_NF');
  }
}));

module.exports = router;
