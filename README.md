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

<hr></hr>

**This repository is part of IEEE METU CS Alumni Project and has been licensed under The MIT License.**

Project Author: Ozan Sazak

Contact: <ozan.sazak@protonmail.ch>
