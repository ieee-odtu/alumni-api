import express from 'express';
const router = express.Router();

import Reg from '../models/registry';

import _jwt from '../middleware/jwt';

import {_EUNEXP, _E_CAST} from '../util';

const _AUTH_TAB = ['admin', 'editor'];

router.get('/', (req, res, next) => {
  let filter_query;
  if (req.user == _jwt.constants.U_UNREG || req.user.authorization == 'regular') {
    filter_query = {_id: 0, __v: 0, contact: 0, 'contact.cwd': 1, 'contact.linkedin': 1, 'contact.country': 1};
  } else if (_AUTH_TAB.includes(req.user.authorization)) {
    filter_query = {_id: 0, __v: 0}
  } else {
    return _EUNEXP(res, 'Invalid authorization: ' + req.user.authorization, {
      'req.user': req.user
    });
  }
  Reg.find({}, filter_query, (err, regs) => {
    if (err) return _EUNEXP(res, err, {
      regs: regs
    });
    if (regs.length == 0) {
      return res.status(404).json({
        success: false,
        code: 'R_NF'
      });
    } else {
      return res.status(200).json({
        success: true,
        registries: regs
      });
    }
  });
});

router.post('/', _auth, (req, res, next) => {
  Reg.getRegByName(req.body.reg.name, (err, found) => {
    if (err) return _EUNEXP(res, err, {
      found: found
    });
    if (found) {
      return res.status(409).json({
        success: false,
        code: 'REG_NAME'
      });
    } else {
      let new_reg = new Reg(req.body.reg);
      new_reg.save((err, saved) => {
        if (err) return _EUNEXP(res, err, {
          saved: saved
        });
        return res.status(201).json({
          success: true,
          saved: saved
        });
      });
    }
  });
});

router.get('/:rid', (req, res, next) => {
  let filter_query;
  if (req.user == _jwt.constants.U_UNREG || req.user.authorization == 'regular') {
    filter_query = {_id: 0, __v: 0, contact: 0, 'contact.cwd': 1, 'contact.linkedin': 1, 'contact.country': 1};
  } else if (_AUTH_TAB.includes(req.user.authorization)) {
    filter_query = {_id: 0, __v: 0}
  } else {
    return _EUNEXP(res, 'Invalid authorization: ' + req.user.authorization, {
      'req.user': req.user
    });
  }
  Reg.findById(req.params.rid, filter_query, (err, found) => {
    if (err) {
      if (err.name == 'CastError') {
        return _E_CAST(res, err, 'R_NF', 404);
      } else {
        return _EUNEXP(res, err, {
          found: found
        });
      }
    }
    if (found) {
      return res.status(200).json({
        success: true,
        registry: found
      });
    } else {
      return res.status(404).json({
        success: false,
        code: 'R_NF'
      });
    }
  });
});

router.put('/:rid', _auth, (req, res, next) => {
  Reg.update({_id: req.params.rid}, req.body.reg, (err, updated) => {
    if (err) return _EUNEXP(res, err, {
      updated: updated
    });
    return res.status(201).json({
      success: true,
      updated: updated
    });
  });
});

router.delete('/:rid', _auth, (req, res, next) => {
  Reg.remove({_id: req.params.rid}, (err, removed) => {
    if (err) return _EUNEXP(res, err, {
      removed: removed
    });
    return res.status(200).json({
      success: true,
      removed: removed
    });
  });
});

function _auth(req, res, next){
  if (_AUTH_TAB.includes(req.user.authorization)) {
    next();
  } else {
    return res.status(401).end();
  }
}

module.exports = router;
