const FIELD = {
  password: /^.+$/,
  email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  string: /^\w+$/,
  number: /^\d+$/
}

module.exports.FIELD = FIELD;

function _dropWUndef(res, undef){
  return res.status(409).json({
    success: false,
    code: 'VRF_UNDEF',
    undef: undef,
    middleware: 'vRF'
  });
}

function _dropWNofield(res, field) {
  return res.status(409).json({
    success: false,
    code: 'VRF_F_NF',
    field: field,
    middleware: 'vRF'
  });
}

function _dropWUnmatch(res, conf_field, body_field){
  return res.status(409).json({
    success: false,
    code: 'VRF_UNMATCH',
    conf_field: conf_field,
    body_field: body_field,
    middleware: 'vRF'
  });
}

// Middleware function vRF
// -----------------------
// Arguments:
//   conf -> Object
//     Example:
//       {
//         username: string,
//         email: email
//       }
//
module.exports.vRF = (conf) => {
  return function(req, res, next){
    for (let field in conf) {
      if (typeof req.body[field] == 'undefined') {
        return _dropWUndef(res, field);
      } else {
        if (typeof FIELD[conf[field]] == 'undefined') {
          return _dropWNofield(res, conf[field]);
        } else {
          if (!FIELD[conf[field]].test(req.body[field])) {
            return _dropWUnmatch(res, conf[field], req.body[field]);
          }
        }
      }
    }
    next();
  }
}

module.exports.vRF_multi = (conf) => {
  return function (req, res, next) {
    if (typeof conf[req.path] != 'undefined' && ['POST', 'PUT'].includes(req.method)) {
      let _conf = conf[req.path];
      for (let field in _conf) {
        if (typeof req.body[field] == 'undefined') {
          return _dropWUndef(res, field);
        } else {
          if (typeof FIELD[_conf[field]] == 'undefined') {
            return _dropWNofield(res, _conf[field]);
          } else {
            if (!FIELD[_conf[field]].test(req.body[field])) {
              return _dropWUnmatch(res, _conf[field], req.body[field]);
            }
          }
        }
      }
    }
    next();
  }
}
