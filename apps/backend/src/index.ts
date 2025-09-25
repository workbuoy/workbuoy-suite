import app from './server.js';

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`[workbuoy] backend listening on :${port}`);
});
