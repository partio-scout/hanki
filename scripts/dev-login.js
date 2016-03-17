var path = require('path');
var serverPath = path.resolve(__dirname, '../server');
var app = require(serverPath + '/server.js');

var email = process.argv[2];
var opts = {};

if (process.argv[3]) {
  opts.timeToLive = process.argv[3];
}

if (!email) {
  console.log('Please provide the user\'s email: node dev-login.js <email>');
  process.exit(1);
}

app.models.Purchaseuser.getDevLoginUrl(email, opts, function(err, url) {
  if(err) {
    console.error(err);
    process.exit(1);
  } else {
    console.log('Login URL:', url);
    process.exit(0);
  }
});
