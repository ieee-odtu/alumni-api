import express from 'express';
const router = express.Router();

import Reg from '../models/registry';

import {jwtValidate} from '../middleware/jwt';

import {_EUNEXP, _FAIL, _SUCC, _CREATED, _REMOVED, asyncWrap} from '../util';

router.get('/', asyncWrap(async (req, res, next) => {
  let user_authorized = Reg.authorized(req.user)
  let filter_opts;
  if (user_authorized) {
    filter_opts = {_id: 0, __v: 0, 'positions._id': 0, 'contact._id': 0};
  } else {
    filter_opts = {_id: 0, __v: 0, 'contact.phone': 0, 'contact.email': 0, 'contact.city': 0};
  }
  let regs = await Reg.find({}, filter_opts)
  if (regs.length == 0) {
    return _FAIL(res, 'R_NF');
  } else {
    return _SUCC(res, {
      registries: regs
    });
  }
}));

router.post('/', jwtValidate('utype', ['admin', 'editor']), asyncWrap(async (req, res, next) => {
  let found = await Reg.findOne({name: req.body.reg.name})
  if (found) {
    return _FAIL(res, 'REG_NAME');
  } else {
    await Reg.createNew(req.body.reg);
    return _CREATED(res, 'Registry');
  }
}));

router.get('/:rid', asyncWrap(async (req, res, next) => {
  let user_authorized = Reg.authorized(req.user)
  let filter_opts;
  if (user_authorized) {
    filter_opts = {_id: 0, __v: 0};
  } else {
    filter_opts = {_id: 0, __v: 0, 'contact.phone': 0, 'contact.email': 0, 'contact.city': 0};
  }
  let regs = await Reg.findById(req.params.rid, filter_opts)
  if (regs) {
    return _SUCC(res, {
      registry: regs
    });
  } else {
    return _FAIL(res, 'R_NF');
  }
}));

router.put('/:rid', jwtValidate('utype', ['admin', 'editor']), asyncWrap(async (req, res, next) => {
    let updated = await Reg.update({_id: req.params.rid}, req.body.reg)
    return _CREATED(res, 'Registry', {
      updated: updated
    });
}));

router.delete('/:rid', jwtValidate('utype', ['admin', 'editor']), asyncWrap(async (req, res, next) => {
    let removed = await Reg.remove({_id: req.params.rid})
    return _REMOVED(res, 'Registry');
}));

module.exports = router;
