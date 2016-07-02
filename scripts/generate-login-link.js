var path = require('path');
var serverPath = path.resolve(__dirname, '../server');
var app = require(serverPath + '/server.js');

var email = process.argv[2];
var opts = {};

if (process.argv[3]) {
  opts.timeToLive = process.argv[3];
}

if (process.argv[4]) {
  opts.host = process.argv[4];
}

if (!email) {
  console.log('WARNING: The login link is primarily a development tool. You should not use it '
    + 'in production for other than read-only users.\n');
  console.log('Please provide the user\'s email and optional time-to-live in seconds and '
    + 'optional root url: node generate-login-link.js <email> [<ttl>] [<root url>]');
  process.exit(1);
}

app.models.Purchaseuser.getLoginUrl(email, opts, function(err, url) {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    console.log('Login URL:', url);
    process.exit(0);
  }
});
