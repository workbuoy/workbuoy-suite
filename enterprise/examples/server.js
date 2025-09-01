const express = require('express');
const bodyParser = require('body-parser');
const dsrRouter = require('../api/secure/dsr');
const { getDB, ensureMigration } = require('../lib/secure/dsr');

const app = express();
app.use(bodyParser.json());

const db = getDB();
ensureMigration(db);
app.locals.db = db;

app.locals.gdprExport = async (email) => {
  return { user: { email }, systems: ['billing','product'], items: [{ type: 'profile', email }] };
};

app.use('/api/secure/dsr', dsrRouter);

const port = process.env.PORT || 3333;
if (require.main === module) {
  app.listen(port, () => console.log(`[examples] DSR server listening on :${port}`));
}

module.exports = app;
