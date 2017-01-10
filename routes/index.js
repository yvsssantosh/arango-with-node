var express = require('express');
var router = express.Router();
var person = require('../models/models');
var bodyParser = require('body-parser');
var Database = require('arangojs').Database;


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login Page' });
});

router.post('/', function(req, res, next) {

    var username = req.body.inputUsername;
    var password = req.body.inputPassword;

    var db = new Database('http://root:root@127.0.0.1:8529');
    db.useDatabase('mydatabase');

    var collection = db.collection('user_data');

    collection.document(username,function(err,doc){
        if(!err) {

            var d = JSON.parse(JSON.stringify(doc,null,2));
            if(password===d['password']){
                res.send('Login success');
            }
            else res.send('Login failed');
        }
        else
            res.send("Some error occured while connecting to DB"+err);
    });
});

module.exports = router;
