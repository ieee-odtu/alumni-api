import express from 'express';
const router = express.Router();

import User from '../models/user';

import _ecodes from '../config/ec';

import {_EUNEXP, _E_CAST} from '../util';

router.get('/', _auth, (req, res, next) => {
  User.find({}, {__v: 0, password: 0}, (err, users) => {
    if (err) return _EUNEXP(res, err, {
      users: users
    });
    if (users.length == 0) {
      return res.status(404).json({
        success: false,
        code: 'U_NF'
      });
    } else {
      return res.status(200).json({
        success: true,
        users: users
      });
    }
  });
});

// this api call is JUST for admin
// users must use /u/register instead
router.post('/', _auth, (req, res, next) => {
  User.registerEligible({
    email: req.body.user.email,
    username: req.body.user.username
  }, (err, _ret) => {
    if (err) {
      switch (err) {
        case _ecodes.REG_EMAIL:
          return res.status(409).json({
              success: false,
              code: 'REG_EMAIL'
          });
          break;
        case _ecodes.REG_UNAME:
          return res.status(409).json({
            success: false,
            code: 'REG_UNAME'
          });
          break;
        default:
          return _EUNEXP(res, err);
      }
    } else {
      if (!User.UTYPES.includes(req.body.user.utype)) {
        return res.status(409).json({
          success: false,
          code: 'USER_WRONG_UTYPE',
          debug: {
            utype: req.body.user.utype
          }
        });
      } else {
        User.addUser(req.body.user, (err, created) => {
          if (err) return _EUNEXP(res, err, {
            created: created
          });
          return res.status(201).json({
            success: true,
            created: created
          });
        });
      }
    }
  });
});

router.get('/:uid', _auth, (req, res, next) => {
  User.findById(req.params.uid, {__v: 0, password: 0}, (err, found) => {
    if (err) {
      if (err.name == 'CastError') {
        return _E_CAST(res, err, 'U_NF', 404);
      } else {
        return _EUNEXP(res, err, {
          found: found
        });
      }
    }
    if (found) {
      return res.status(200).json({
        success: true,
        user: found
      });
    } else {
      return res.status(404).json({
        success: false,
        code: 'U_NF'
      });
    }
  });
});

router.put('/:uid', _auth, (req, res, next) => {
  User.update(req.params.uid, req.body.user, (err, updated) => {
    if (err) return _EUNEXP(res, err, {
      updated: updated
    });
    return res.status(201).json({
      success: true,
      updated: updated
    });
  });
});

router.delete('/:uid', _auth, (req, res, next) => {
  User.remove({_id: req.params.uid}, (err, _ret) => {
    if (err) return _EUNEXP(res, err);
    return res.status(200).json({
      success: true
    });
  });
});

router.get('/profile', (req, res, next) => {
  res.status(502).json({
    success: false,
    msg: 'Unimplemented API endpoint'
  });
});

router.post('/register', (req, res, next) => {
  User.registerEligible({
    email: req.body.user.email,
    username: req.body.user.username
  }, (err, _ret) => {
    if (err) {
      switch (err) {
        case _ecodes.REG_EMAIL:
          return res.status(409).json({
              success: false,
              code: 'REG_EMAIL'
          });
          break;
        case _ecodes.REG_UNAME:
          return res.status(409).json({
            success: false,
            code: 'REG_UNAME'
          });
          break;
        default:
          return _EUNEXP(res, err);
      }
    } else {
      req.body.user.utype = 'regular';
      User.addUser(req.body.user, (err, created) => {
        if (err) return _EUNEXP(res, err);
        return res.status(201).json({
          success: true
        });
      });
    }
  });
});

function _auth(req, res, next) {
  if (req.user.authorization == 'admin') {
    next();
  } else {
    return res.status(401).end();
  }
}

module.exports = router;
