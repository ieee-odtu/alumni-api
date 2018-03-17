import express from 'express';
const router = express.Router();

import Reg from '../models/registry';

import _jwt from '../middleware/jwt';

import {_EUNEXP, _FAIL, _SUCC, _CREATED, _REMOVED, asyncWrap} from '../util';

const _AUTH_TAB = ['admin', 'editor'];

router.get('/', asyncWrap(async (req, res, next) => {
  let regs = await Reg.find({}, {_id: 0, __v: 0})
  if (regs.length == 0) {
    return _FAIL(res, 'R_NF');
  } else {
    if (! await Reg.authorized(req.user.authorization)) {
      regs = regs.select('-contact.phone -contact.email -contact.city');
    }
    return _SUCC(res, {
      registries: regs
    });
  }
}));

router.post('/', _auth, asyncWrap(async (req, res, next) => {
  let found = await Reg.getRegByName(req.body.reg.name)
  if (found) {
    return _FAIL(res, 'REG_NAME');
  } else {
    await Reg.createNew(req.body.reg);
    return _CREATED(res, 'Registry');
  }
}));

router.get('/:rid', asyncWrap(async (req, res, next) => {
  let found = await Reg.findById(req.params.rid, {_id: 0, __v: 0})
  if (found) {
    if (! await Reg.authorized(req.user.authorization)) {
      regs = regs.select('-contact.phone -contact.email -contact.city');
    }
    return _SUCC(res, {
      registry: found
    });
  } else {
    return _FAIL(res, 'R_NF');
  }
}));

router.put('/:rid', _auth, asyncWrap(async (req, res, next) => {
    let updated = await Reg.update({_id: req.params.rid}, req.body.reg, (err, updated) => {
    return _CREATED(res, 'Registry', {
      updated: updated
    });
}));

router.delete('/:rid', _auth, asyncWrap(async (req, res, next) => {
    let removed = await Reg.remove({_id: req.params.rid})
    return _REMOVED(res, 'Registry');
}));

function _auth(req, res, next){
  if (_AUTH_TAB.includes(req.user.authorization)) {
    next();
  } else {
    return res.status(401).end();
  }
}

module.exports = router;
