# Zonky API handler

[![npm version](https://badge.fury.io/js/zonky-api-handler.svg)](https://badge.fury.io/js/zonky-api-handler)
[![renovate-app](https://img.shields.io/badge/renovate-app-blue.svg)](https://renovateapp.com/)
[![Known Vulnerabilities](https://snyk.io/test/github/fabulator/zonky-api-handler/badge.svg)](https://snyk.io/test/github/fabulator/zonky-api-handler)
[![codecov](https://codecov.io/gh/fabulator/zonky-api-handler/branch/master/graph/badge.svg)](https://codecov.io/gh/fabulator/zonky-api-handler)
[![travis](https://travis-ci.org/fabulator/zonky-api-handler.svg?branch=master)](https://travis-ci.org/fabulator/zonky-api-handler)

Unofficial API handler for Zonky. You can see full [documentation on apiary](https://zonky.docs.apiary.io/).

## How to use

Install package:

```nodedaemon
npm install zonky-api-handler
```

You must include polyfill for browser fetch to use it with Node.

```javascript
require('cross-fetch/polyfill');
const { DateTime } = require('luxon');
const { ZonkyApi } = require('zonky-api-handler');

(async () => {
    await api.login(USERNAME, PASSWORD, ZonkyApi.SCOPES.APP_WEB);

    const { transactions } = await api.getTransactions(DateTime.fromISO('2018-01-01'));
    console.log(transactions);
})()
```

You can also request export token and download xls report:

```javascript
require('cross-fetch/polyfill');
const fs = require('fs');
const { ZonkyApi } = require('zonky-api-handler');

(async () => {
    await api.login(USERNAME, PASSWORD, ZonkyApi.SCOPES.FILE_DOWNLOAD);

    const data = await api.downloadTransactions();
    fs.writeFileSync('export.xls', data);
})()
```
