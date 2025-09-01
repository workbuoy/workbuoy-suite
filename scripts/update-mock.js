const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const channel = process.env.WB_UPDATE_CHANNEL || 'stable';
const root = path.join(process.cwd(), 'mock_feed', channel);

app.get('/', (_req, res) => res.send(`Mock feed OK: ${channel}`));

app.get('/:file', (req, res) => {
  const f = path.join(root, req.params.file);
  if (!fs.existsSync(f)) return res.status(404).send('not found');
  res.sendFile(f);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Mock update feed on http://127.0.0.1:${port} (${root})`));
