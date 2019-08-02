const fs = require('fs');
const config = require('./config');

fs.writeFileSync('config.json', JSON.stringify(config, null, 4), 'utf8');
