import express from 'express';
const router = express.Router();

import User from '../models/user';

import {jwtValidate} from '../middleware/jwt';

import {_EUNEXP, _SUCC, _FAIL, _CREATED, _REMOVED, asyncWrap} from '../util';

router.get('/', jwtValidate('utype', ['admin', 'editor']), asyncWrap(async (req, res, next) => {
  let users = await User.find({}, {__v: 0, password: 0})
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
  let found = await User.findById(req.params.uid, {__v: 0, password: 0})
  if (found) {
    return _SUCC(res, {
      user: found
    });
  } else {
    return _FAIL(res, 'U_NF');
  }
}));

router.put('/:uid', jwtValidate('utype', ['admin']), asyncWrap(async (req, res, next) => {
    let updated = await User.update(req.params.uid, req.body.user)
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
  await User.addUser(req.body.user)
  return _CREATED(res, 'User');
}));

module.exports = router;
