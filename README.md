# alumni-api

RESTful API server for IEEE METU CS Alumni Project, running Express.js on Node.js

## Installation

```bash
git clone https://github.com/ieee-odtu/alumni-api
cd ./alumni-api
npm install
npm run dev
```

### for developers

For a better development process, add the lines below right after line #240 in express/lib/response.js

```js
if (['POST', 'PUT', 'PATCH'].includes(this.req.method)) {
  val.debug = val.debug || {};
  val.debug.body = this.req.body;
}
```

And add the lines below right before the last return statement in express/lib/response.js at function res.json

```js
function __colorify_status(s) {
  if (s >= 200 && s < 300) {
    return '\x1b[32m' + s + '\x1b[0m';
  } else if (s >= 300 && s < 400) {
    return '\x1b[33m' + s + '\x1b[0m';
  } else if (s >= 400 && s < 500) {
    return '\x1b[1m\x1b[31m' + s + '\x1b[0m';
  } else if (s >= 500) {
    return '\x1b[41m' + s + '\x1b[0m';
  } else {
    return s;
  }
}

console.log('[<==] Response:', __colorify_status(this.statusCode), '(' + body.length + ' B)')
```

<hr></hr>

**This repository is part of IEEE METU CS Alumni Project and has been licensed under The MIT License.**

Project Author: Ozan Sazak

Contact: <ozan.sazak@protonmail.ch>
