var path = require('path');
var serverPath = path.resolve(__dirname, '../server');
var app = require(serverPath + '/server.js');
var crypto = require('crypto');

var email = process.argv[2]; // 0=node, 1=create-user.js

if (!email) {
  console.log('Please provide the user\'s email: node create-user.js <email>');
  process.exit(1);
}

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
