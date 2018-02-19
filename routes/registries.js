import express from 'express';
const router = express.Router();

import Reg from '../models/registry';

import _jwt from '../middleware/jwt';

import {_EUNEXP} from '../util';

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

});

router.get('/:rid', (req, res, next) => {

});

router.put('/:rid', _auth, (req, res, next) => {

});

router.delete('/:rid', _auth, (req, res, next) => {

});

function _auth(req, res, next){
  if (_AUTH_TAB.includes(req.user.authorization)) {
    next();
  } else {
    return res.status(401).end();
  }
}

module.exports = router;
