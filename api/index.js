import serverless from 'serverless-http';
import app from '../server/server.js';

export default serverless(app);
export const config = {
  runtime: 'nodejs20.x'
};
