var path = require('path');
var serverPath = path.resolve(__dirname, '../server');
var app = require(serverPath + '/server.js');
var crypto = require('crypto');

var opts = require('commander')
  .usage('Usage: npm run create-user <user email>')
  .parse(process.argv);

if (opts.args.length < 1) {
  console.error('Please provide the user\'s email.');
  process.exit(1);
}

var email = opts.args[0];

var password = crypto.randomBytes(24).toString('hex');

var user = {
  email: email,
  password: password,
  name: 'n/a',
  phone: 'n/a',
  enlistment: 'n/a',
  userSection: 'n/a'
};

app.models.Purchaseuser.create(user, function(err, user) {
  if (err) {
    console.error('Can\'t create user:\n', err);
    process.exit(1);
  } else {
    app.models.RoleMapping.create({
      'principalType': 'USER',
      'principalId': user.id,
      'roleId': 1
    }, function(err, res) {
      if (err) {
        console.error('Can\'t create role mapping:\n', err);
        process.exit(1);
      } else {
        console.log('User created:\n', user);
        process.exit(0);
      }
    });
  }
});
