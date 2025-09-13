import http from 'http';
import app from '../server';

const PORT = Number(process.env.PORT || 3000);

const server = http.createServer(app);

server.listen(PORT, () => {
  const msg = {
    event: 'server_started',
    port: PORT,
    env: process.env.NODE_ENV || 'development',
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(msg));
});
