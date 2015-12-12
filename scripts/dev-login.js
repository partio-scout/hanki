var path = require('path');
var serverPath = path.resolve(__dirname, '../server');
var app = require(serverPath + '/server.js');

var email = process.argv[2];

if (!email) {
  console.log('Please provide the user\'s email: node dev-login.js <email>');
  process.exit(1);
}

var query = {
  where: {
    email: email,
  },
};

app.models.Purchaseuser.findOne(query, function(err, user) {
  if (err) {
    console.error('Error loading user:', err);
    process.exit(1);
  } else if (user === null) {
    console.error('Can\'t find user:', email);
    process.exit(0);
  } else {
    user.createAccessToken(8*3600, function(err, accessToken) {
      if (err) {
        console.error('Can\'t generate access token:', err);
      } else {
        var url = 'http://localhost:3000/dev-login/' + accessToken.id;
        console.log('Login URL: ' + url);
        process.exit(0);
      }
    });
  }
});
