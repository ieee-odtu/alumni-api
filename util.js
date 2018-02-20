import _jwt from './middleware/jwt';

import User from './models/user';

module.exports._EUNEXP = (res, err, debug, middleware) => {
  let response = {
    success: false,
    code: 'E_UNEXP',
    msg: 'Unexpected error',
    err: err
  }
  if (typeof debug == 'string') {
    response['middleware'] = debug;
  } else if (typeof debug == 'object' && typeof middleware == 'string') {
    response['debug'] = debug;
    response['middleware'] = middleware;
  }
  return res.status(500).json(response);
}

module.exports._E_CAST = (res, err, code, status, debug, middleware) => {
  let response = {
    success: false,
    code: code
  }
  if (typeof debug == 'string') {
    response['middleware'] = debug;
  } else if (typeof debug == 'object' && typeof middleware == 'string') {
    response['debug'] = debug;
    response['middleware'] = middleware;
  }
  return res.status(status).json(response);
}

module.exports.rlog = (req) => {
  let whois, ccode;
  if (req.user == _jwt.constants.U_UNREG) {
    whois = req.user;
    ccode = "\x1b[31m";
  } else {
    whois = req.user.username;
    ccode = User.ccodes[req.user.utype];
  }
  console.log('[' + req.method + '] ' + req.originalUrl + ' <==> ' + ccode + whois + "\x1b[0m");
}

module.exports.rlog_mw = (req, res, next) => {
  let whois, ccode;
  if (req.user == _jwt.constants.U_UNREG) {
    whois = req.user;
    ccode = "\x1b[31m";
  } else {
    whois = req.user.username;
    ccode = User.ccodes[req.user.utype];
  }
  console.log('[' + req.method + '] ' + req.originalUrl + ' <==> ' + ccode + whois + "\x1b[0m");
  next();
}
