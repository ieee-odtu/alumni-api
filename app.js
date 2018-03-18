import express from 'express';
import mongoose from 'mongoose';
import bluebird from 'bluebird';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import helmet from 'helmet';

import db_config from './config/database';
import server_config from './config/server';

import {jwtBind} from './middleware/jwt';
import {vRF_multi} from './middleware/validate';

import route_users from './routes/users';
import route_regs from './routes/registries';
import route_auth from './routes/auth';

import {rlog_mw, _EUNEXP, _ERR} from './util';

const package_json_parsed = JSON.parse(fs.readFileSync('package.json'));
const API_NAME = package_json_parsed.name;
const API_VER = package_json_parsed.version;
const API_AUTHOR = package_json_parsed.author;

let _api_port = process.env.API_PORT || server_config.port || 3000;

mongoose.Promise = bluebird.Promise;

mongoose.connect(db_config.database)
	.then(() => {
		let app = express();

		// Helmet middleware for base HTTP/S header security
		app.use(helmet({
			noCache: true
		}));

		app.use(helmet.hsts({
			maxAge: 63072000,
			includeSubDomains: false
		}));

		app.use(helmet.referrerPolicy({
			policy: 'same-origin'
		}));

		// Cors middlware for cross-origin resource sharin
		// TODO: This configuration of CORS is not safe
		app.use(cors());

		app.use(bodyParser.json());

		// Nginx (or shitty Apache) reverse-proxy
		app.set('trust proxy', '127.0.0.1');

		// Changing the response header 'X-Powered-By' for security reasons
		app.use((req, res, next) => {
			res.set('X-Powered-By', 'IEEE METU | Computer Society');
			next();
		});

		app.use(jwtBind());
		app.use(rlog_mw);

		// TODO: Implement this
		//app.use(vRF_multi('all'));

		app.get('/', (req, res, next) => {
			return res.status(200).json({
				success: true,
				api: API_NAME,
				api_version: API_VER,
				api_author: API_AUTHOR
			});
		});

		app.use('/u', route_users);
		app.use('/r', route_regs);
		app.use('/auth', route_auth);

		app.use('*', (req, res) => {
			return res.status(404).end('Unimplemented or unknown API endpoint');
		});

		app.use((err, req, res, next) => {
			if (typeof err.name == 'undefined' && typeof err == 'string') {
				console.error('\x1b[1m\x1b[31m[ERROR] <code>', err + '\x1b[0m');
			} else {
				console.error('\x1b[1m\x1b[31m[ERROR]', err.name + '\x1b[0m');
			}
			console.log('[DEBUG] ERR:', err);
			if (!res.headersSent) {
				switch (err.name) {
					case 'JsonWebTokenError':
						res.status(401).json({
							code: 'JV_ERR',
							err: err,
							middleware: 'JV'
						});
						break;
					case 'CastError':
						res.status(409).json({
							code: 'INV_DATA',
							err: err
						});
						break;
					default:
						_ERR(res, err);
				}
			}
		});

		app.listen(_api_port, (err) => {
			if (!err)
				console.log('[+] Server has started on port', _api_port);
		});
	});
