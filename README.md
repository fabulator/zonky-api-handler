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
    const api = new ZonkyApi();
    await api.login(USERNAME, PASSWORD);

    const { transactions } = await api.getTransactions(DateTime.fromISO('2018-01-01'));
    console.log(transactions);
})()
```

You can also request export token and download xlsx reports:

```javascript
require('cross-fetch/polyfill');
const fs = require('fs');
const { ZonkyApi } = require('zonky-api-handler');

(async () => {
    const api = new ZonkyApi();
    await api.login(USERNAME, PASSWORD);

    const transactions = await api.downloadTransactions();
    fs.writeFileSync('transactions.xlsx', transactions);
    
    const investments = await api.downloadInvestments();
    fs.writeFileSync('investments.xlsx', investments);
    
})()
```

## CLI to download Zonky reports
usage: `zonky-report-download login@email.abc password-zonky transactions.xlsx investments.xlsx`
```javascript
require('cross-fetch/polyfill');
const fs = require('fs');
const { ZonkyApi } = require('zonky-api-handler');

(async () => {

   if (process.argv.length!=6) {
        console.log("zonky-report-download <login-email> <zonky-password> <transaction filename> <investments filename>");
        console.log("zonky-report-download login@email.abc password-zonky transactions.xlsx investments.xlsx");
        process.exit(-1);
   }

    const api = new ZonkyApi();
    console.log(`Login to Zonky: ${process.argv[2]}`);
    await api.login(process.argv[2], process.argv[3]);

    console.log(`Download transactions: ${process.argv[4]}`);
    const transactions = await api.downloadTransactions();
    fs.writeFileSync(process.argv[4], transactions);

    console.log(`Download investments: ${process.argv[5]}`);
    const people = await api.downloadInvestments();
    fs.writeFileSync(process.argv[5], people);

    console.log("Done");
})()
```
