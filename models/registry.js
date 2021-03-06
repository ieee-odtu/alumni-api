import mongoose from 'mongoose';

import _ecodes from '../config/ec';

let PositionSchema = mongoose.Schema({
  position: {
    type: String,
    required: true
  },
  years: {
    type: String,
    required: true
  }
});

let ContactSchema = mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  linkedin: {
    type: String
  },
  cwd: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  }
});

let RegistrySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  positions: {
    type: [PositionSchema]
  },
  contact: {
    type: ContactSchema,
    required: true
  }
});

let Registry = mongoose.model('registry', RegistrySchema);

module.exports = Registry;

module.exports.createNew = async (new_reg) => {
  let new_instance = new Registry(new_reg);
  await new_instance.save();
}

module.exports.authorized = (user) => {
  if (typeof user == 'undefined') {
    return false;
  }
  if (user.utype == 'admin') {
    return true;
  } else {
    return user._dbauth ? true : false;
  }
}
