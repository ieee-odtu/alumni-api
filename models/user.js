import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import _ecodes from '../config/ec';

const USER_UTYPES = ['admin', 'editor', 'regular'];

let UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	utype: {
		type: String,
		enum: USER_UTYPES,
		required: true
	},
	signup: {
		type: String
	}
});

let User = mongoose.model('user', UserSchema);

module.exports = User;

module.exports.ccodes = {
  'admin': "\x1b[32m",
  'editor': "\x1b[33m",
  'regular': "\x1b[37m"
}

module.exports.UTYPES = USER_UTYPES;

module.exports.createNew = async function(_new_user, callback){
	let new_user = new User(_new_user);
	let salt = await bcrypt.genSalt(10)
	let hash = await bcrypt.hash(new_user.password, salt)
	new_user.password = hash;
	new_user.email = new_user.email.toLowerCase();
	new_user.signup = new Date().toJSON();
	await new_user.save();
}

module.exports.getUserByUsername = function(uname, callback){
	User.findOne({username: uname}, callback);
}

module.exports.getUserByEmail = function(email, callback){
	User.findOne({email: email}, callback);
}

module.exports.getUsersByUtype = function(utype, callback){
	if (!USER_UTYPES.includes(utype)) return callback(_ecodes.USER_WRONG_UTYPE, null);
	User.find({utype: utype}, callback);
}

module.exports.registerEligible = async function(_opts, callback){
	let found = await User.findOne({email: _opts.email})
	if (found) throw _ecodes.REG_EMAIL;
	found = await User.findOne({username: _opts.username})
	if (found) throw _ecodes.REG_UNAME
}

module.exports.deleteUserByEmail = function(email, callback){
	User.remove({email: email}, callback);
}

module.exports.updateUserById = async function(uid, new_user, callback){
	let salt = await bcrypt.genSalt(10)
	let hash = await bcrypt.hash(new_user.password, salt)
	new_user.password = hash;
	await User.update({_id: uid}, new_user)
}
