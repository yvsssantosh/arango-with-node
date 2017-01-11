// =================================================================
// get the packages we need ========================================
// =================================================================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var Database = require('arangojs').Database;

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./app/models/user'); // get our mongoose model

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 5000; // used to create, sign, and verify tokens
var db = new Database(config.database);// database URL
var collection = db.collection(config.collection_name);// collection name
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// routes ==========================================================
// =================================================================
app.get('/setup', function (req, res) {

	//create a new database 'mydb'
	db.createDatabase(config.db_name).then(
		() => console.log('Database created'),
		err => console.error('Failed to create database:', err)
	).then(function () {
		db.useDatabase(config.db_name);
		//creating a new collection 'mycollection'
		collection = db.collection(config.collection_name);
		collection.create(config.collection_name).then(
			() => console.log('Collection created'),
			err => console.error('Failed to create collection:', err)
		).then(function () {
			// create a sample user in 'mycollection'
			var data = new User({
				_key: 'kurosaki',
				password: 'ichigo',
			});
			// save the sample user into the database
			collection.save(data).then(
				meta => console.log('Document saved:', meta._rev),
				err => console.error('Failed to save document:', err),

				res.json({ success: true })
			);
		});

	});


});

// basic route (http://localhost:5000)
app.get('/', function (req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:5000/api/authenticate
apiRoutes.post('/authenticate', function (req, res) {

	// find the user
	collection.document(req.body.username, function (err, doc) {
		if (!err) {
			var data = JSON.parse(JSON.stringify(doc, null, 2));
			if (req.body.password === data['password']) {
				var token = jwt.sign(req.body.username, app.get('superSecret'), {
					expiresIn: 86400 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}
			else {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			}
		}
		else
			res.json({ success: false, message: 'Authentication failed. Please retry after sometime' });
	});
});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function (req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function (err, decoded) {
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});

	}

});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
apiRoutes.get('/', function (req, res) {
	res.json({ message: 'Welcome !' });
});

apiRoutes.get('/users', function (req, res) {
	//finding all the users in the database
	db.useDatabase(config.db_name);
	collection = db.collection(config.collection_name);

	collection.all().then(
		cursor => cursor.map(doc => doc._key)
	).then(
		keys => console.log('Welcome ' + keys),
		err => console.log('Failed to fetch all documents:', err)
		);
});

apiRoutes.get('/check', function (req, res) {
	res.json(req.decoded);
});

app.use('/api', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port);
console.log('Lets check http://localhost:' + port);
