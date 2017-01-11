var ignitor = require('ignitor.js');

module.exports = ignitor.Model('Person', {
    username: { type: 'string', required: true },
    password: { type: 'password', required: true }
});
