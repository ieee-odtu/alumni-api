import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import {use_jti as USE_JTI} from '../config/auth';
import {_generate_jti} from '../util';

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
	},
	_dbauth: {
		type: Boolean,
		required: function () {
			return this.utype == 'editor';
		}
	},
	_jti: {
		type: String,
		required: function () {
			return (USE_JTI && ['admin', 'editor'].includes(this.utype));
		}
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
	new_user._dbauth = new_user.utype == 'editor' ? (new_user._dbauth || false) : false;
	if (USE_JTI && ['admin', 'editor'].includes(new_user.utype)) {
		new_user._jti = _generate_jti();
	}
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
	if (found) throw 'REG_EMAIL';
	found = await User.findOne({username: _opts.username})
	if (found) throw 'REG_UNAME';
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
