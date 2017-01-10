var ignitor = require('ignitor.js');
var Person = ignitor.Model('Person', {
    username: { type: 'string', required: true },
    password: { type: 'password', required: true }
});

module.exports = Person;
