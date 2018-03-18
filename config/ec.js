module.exports = {
  //JWT_HEADER_ND: {
  //  stat: 401,
  //  msg: 'Authorization header not defined'
  //},
  //JWT_INV_AUTH_TOKEN: {
  //  stat: 401,
  //  msg: 'Invalid authorization token'
  //},
  //E_JWT_VERIFY: {
  //  stat: 401,
  //  msg: 'Token verification error'
  //},
  'U_NF': {
    stat: 404,
    msg: 'User not found'
  },
  'R_NF': {
    stat: 404,
    msg: 'Registry not found'
  },
  'E_UNEXP': {
    stat: 500,
    msg: 'Unexpected error'
  },
  'REG_EMAIL': {
    stat: 409,
    msg: 'Registered email'
  },
  'REG_UNAME': {
    stat: 409,
    msg: 'Registered username'
  },
  'REG_NAME': {
    stat: 409,
    msg: 'Registered name for model Registry'
  },
  'USER_WRONG_UTYPE': {
    stat: 409,
    msg: 'Wrong or undefined utype value'
  },
  'LOGIN_FIELDS_UNDEF': {
    stat: 401,
    msg: 'Wrong request: Need to define one of the username or email in request body'
  },
  'WRONG_PWD': {
    stat: 401,
    msg: 'Wrong password'
  },
  'VRF_UNDEF': {
    stat: 409,
    msg: 'Validation of request body fields failed: One or more field(s) not defined'
  },
  'VRF_F_NF': {
    stat: 409,
    msg: 'Validation of request body fields failed: No such field'
  },
  'VRF_UNMATCH': {
    stat: 409,
    msg: 'Validation of request body fields failed: Field didn\'t match the specified regex'
  },
  'JV_INV_JTI': {
    stat: 401
  },
  'JV_INV_ARGS': {
    stat: 401
  },
  'JV_INV_OPTS': {
    stat: 401
  },
  'JV_INV_TOKEN': {
    stat: 401
  },
  'JV_UNDEF_JTI': {
    stat: 401
  },
  'JV_UNDEF_HEADER': {
    stat: 401
  }
}

module.exports.middleware_specific = {
  'JV': 401
}
