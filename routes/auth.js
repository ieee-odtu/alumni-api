import express from 'express';
const router = express.Router();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {secret} from '../config/database';
import {_EUNEXP} from '../util';

import User from '../models/user';

router.post('/login', (req, res, next) => {
  let auth_field;
  let auth_field_val;

  if (typeof req.body.username != 'undefined') {
    auth_field = 'username';
    auth_field_val = req.body.username;
  } else if (typeof req.body.email != 'undefined') {
    auth_field = 'email';
    auth_field_val = req.body.email;
  } else {
    return res.status(409).json({
      success: false,
      code: 'LOGIN_FIELDS_UNDEF'
    });
  }

  let query = {};
  query[auth_field] = auth_field_val;

  User.findOne(query, (err, found) => {
    if (err) return _EUNEXP(res, err, {
      found: found,
      body: req.body
    });
    if (found) {
      bcrypt.compare(req.body.password, found.password, (err, isMatch) => {
        if (err) return _EUNEXP(res, err, {
          found: found,
          body: req.body,
          isMatch: isMatch
        });
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
          return res.status(200).json({
            success: true,
            token: token,
            username: found.username
          });
        } else {
          return res.status(401).json({
            success: false,
            code: 'WRONG_PWD'
          });
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        code: 'U_NF'
      });
    }
  });
});

module.exports = router;
