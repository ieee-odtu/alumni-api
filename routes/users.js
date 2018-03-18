import express from 'express';
const router = express.Router();

import User from '../models/user';

import {jwtValidate} from '../middleware/jwt';

import {_EUNEXP, _SUCC, _FAIL, _CREATED, _REMOVED, asyncWrap} from '../util';

router.get('/', jwtValidate('utype', ['admin', 'editor']), asyncWrap(async (req, res, next) => {
  let query = {};
  let filter = {__v: 0, password: 0};
  if (req.user.utype != 'admin') {
    query = {'utype': {$ne: 'admin'}};
    filter = Object.assign({}, filter, {_id: 0, email: 0, _dbauth: 0, _jti: 0, signup: 0});
  }
  let users = await User.find(query, filter)
  if (users.length == 0) {
    return _FAIL(res, 'U_NF');
  } else {
    return _SUCC(res, {
      users: users
    });
  }
}));

// this api call is JUST for admin
// users must use /u/register instead
router.post('/', jwtValidate('utype', ['admin']), asyncWrap(async (req, res, next) => {
  await User.registerEligible({
    email: req.body.user.email,
    username: req.body.user.username
  });
  if (!User.UTYPES.includes(req.body.user.utype)) {
    return _FAIL(res, 'USER_WRONG_UTYPE');
  } else {
    await User.createNew(req.body.user)
    return _CREATED(res, 'User');
  }
}));

router.get('/:uid', jwtValidate('utype', ['admin', 'editor']), asyncWrap(async (req, res, next) => {
  let filter = {__v: 0, password: 0};
  if (req.user.utype != 'admin') {
    filter = Object.assign({}, filter, {_id: 0, email: 0, _dbauth: 0, _jti: 0, signup: 0});
  }
  let found = await User.findById(req.params.uid, filter)
  if (found) {
    if (req.user.utype != 'admin' && found.utype == 'admin') {
      return _FAIL(res, 'U_NF');
    } else {
      return _SUCC(res, {
        user: found
      });
    }
  } else {
    return _FAIL(res, 'U_NF');
  }
}));

router.put('/:uid', jwtValidate('utype', ['admin']), asyncWrap(async (req, res, next) => {
    let updated = await User.updateUserById(req.params.uid, req.body.user)
    return _CREATED(res, 'User', {
      updated: updated
    });
}));

router.delete('/:uid', jwtValidate('utype', ['admin']), asyncWrap(async (req, res, next) => {
  await User.remove({_id: req.params.uid})
  return _REMOVED(res, 'User');
}));

router.post('/register', asyncWrap(async (req, res, next) => {
  await User.registerEligible({
    email: req.body.user.email,
    username: req.body.user.username
  })
  req.body.user.utype = 'regular';
  await User.createNew(req.body.user)
  return _CREATED(res, 'User');
}));

module.exports = router;
