// Dependencies
const axios = require('axios');

// Configuration
import config from './config';

// The entry point.
async function main() {
  console.log(config.foo);

  let instance = axios.create({
    baseURL: 'https://echo.luckymarmot.com/',
    timeout: 10000,
    headers: {'X-Custom-Header': 'foo'}
  });

  let body = await instance.get('foobar');
  console.log(body);
}

// Run the main function.
main();
