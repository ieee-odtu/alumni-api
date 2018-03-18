import uuidV4 from 'uuid/v4';

import _jwt from './middleware/jwt';
import errcodes from './config/ec';
import {use_response_success} from './config/server';

import User from './models/user';

function get_status_or_500(code) {
  return (typeof errcodes[code] != 'undefined') ? errcodes[code].stat : 500;
}

function _EUNEXP(res, err, debug, middleware) {
  let response = {
    code: 'E_UNEXP',
    msg: 'Unexpected error',
    err: err
  }
  if (use_response_success) {
    response['success'] = false;
  }
  if (typeof debug == 'string') {
    response['middleware'] = debug;
  } else if (typeof debug == 'object') {
    response['debug'] = debug;
    if (typeof middleware == 'string') {
      response['middleware'] = middleware;
    }
  }
  return res.status(500).json(response);
}

module.exports._EUNEXP = _EUNEXP;

module.exports._ERR = (res, err, debug, middleware) => {
  if (typeof errcodes[err] != 'undefined') {
    let response = {
      code: err
    }
    if (use_response_success) {
      response['success'] = false;
    }
    if (typeof debug == 'string') {
      response['middleware'] = debug;
    } else if (typeof debug == 'object' && typeof middleware == 'string') {
      response['debug'] = debug;
      response['middleware'] = middleware;
    }
    return res.status(get_status_or_500(err)).json(response);
  } else {
    return _EUNEXP(res, err, debug, middleware);
  }
}

module.exports._E_CAST = (res, err, code, status, debug, middleware) => {
  let response = {
    code: code
  }
  if (use_response_success) {
    response['success'] = false;
  }
  if (typeof debug == 'string') {
    response['middleware'] = debug;
  } else if (typeof debug == 'object' && typeof middleware == 'string') {
    response['debug'] = debug;
    response['middleware'] = middleware;
  }
  return res.status(status).json(response);
}

module.exports._CREATED = (res, model, debug) => {
  let response = {
    msg: 'New model instance has been created successfully',
    model: model
  }
  if (use_response_success) {
    response['success'] = true;
  }
  if (typeof debug == 'string') {
    response['middleware'] = debug;
  } else if (typeof debug == 'object' && typeof middleware == 'string') {
    response['debug'] = debug;
    response['middleware'] = middleware;
  }
  return res.status(201).json(response);
}
module.exports._REMOVED = (res, model, prop) => {
  let response = {
    msg: 'Model instance has been removed successfully',
    model: model
  }
  if (use_response_success) {
    response['success'] = true;
  }
  if (typeof prop == 'object') {
    response = Object.assign({}, prop, response);
  }
  return res.status(204).json(response);
}

module.exports._SUCC = (res, prop) => {
  let response = {};
  if (use_response_success) {
    response['success'] = true;
  }
  response = Object.assign({}, prop, response);
  return res.status(200).json(response);
}

module.exports._FAIL = (res, code, middleware) => {
  let response = {
    code: code
  }
  if (use_response_success) {
    response['success'] = false;
  }
  if (typeof middleware != 'undefined') {
    response['middleware'] = middleware;
  }
  return res.status(get_status_or_500(code)).json(response);
}

module.exports._generate_jti = () => {
  return uuidV4();
}

module.exports.rlog_mw = (req, res, next) => {
  console.log('\x1b[33m[' + req.method + ']\x1b[0m ' + req.originalUrl);
  next();
}

module.exports.asyncWrap = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
};
