var app = require('../server');
var request = require('supertest-as-promised');
var testUtils = require('./utils/test-utils');
var Promise = require('bluebird');

describe('Procurement master', function() {
  var userId;
  var rowId;
  var token;

  beforeEach(function() {
    return testUtils.createUserWithRoles(['orderer', 'procurementMaster']).then(function(user) {
      userId = user.id;
      return testUtils.loginUser(user.username);
    }).then(function(newToken) {
      token = newToken.id;
    }).then(function() {
      return testUtils.createFixture('Purchaseorderrow', {
        'titleId': 1,
        'amount': 2,
        'deliveryId': 1,
        'orderId': 2,
        'selfSupply': false,
        'modified': new Date().toISOString(),
        'approved': false,
      });
    }).then(function(row) {
      rowId = row.orderRowId;
    });
  });

  afterEach(function() {
    return Promise.join(
      testUtils.deleteFixtureIfExists('Purchaseuser', userId),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', rowId)
    );
  });

  it('should be allowed to update a row, even if the user is an orderer too', function() {
    return request(app)
      .put('/api/Purchaseorders/2/order_rows/' + rowId + '?access_token=' + token)
      .send({ memo: 'test' })
      .expect(200);
  });
});
