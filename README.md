# Authenticating Users with Node.js, Express & ArangoDB

This repo uses JSON Web Tokens and the [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) package to implement token based authentication on a simple Node.js API.

This is a starting point to demonstrate the method of authentication by verifying a token using Express route middleware.

## Requirements

- node & npm
- ArangoDB

ArangoDB can be found [here](https://www.arangodb.com/download/) <br>
[Reference](https://www.arangodb.com/tutorials/arangodb-node-js-2/) to setup ArangoDB

## Usage

1. Clone the repo: `git clone https://github.com/yvsssantosh/arango-with-node`

2. Install dependencies: `npm install`

3. Change SECRET in `config.js`

4. Add your own ArangoDB database name and collection name to `config.js`

5. Make sure your ArangoDB is up and running

6. Start the server: `node server.js`

7. Create sample user by visiting: `http://localhost:5000/setup`

Once everything is set up, we can begin to use our app by creating and verifying tokens.

### Getting a Token

Send a `POST` request to `http://localhost:5000/api/authenticate` with test user parameters as `x-www-form-urlencoded`. 

```
  {
    username: 'kurosaki',
    password: 'ichigo'
  }
```

### Verifying a Token

Send a `GET` request to `http://localhost:5000/api/users` with a header parameter of `x-access-token` and the token.

You can also send the token as a URL parameter: `http://localhost:5000/api/users?token=YOUR_TOKEN_HERE`

Or you can send the token as a POST parameter of `token`.
