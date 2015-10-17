var app = require('../server');
var request = require('supertest');

describe('User should be allowed to log in as', function() {
  it('Orderer', function(done) {
    request(app).post('/api/Purchaseusers/login')
      .send({
        'username': 'orderer',
        'password': 'salasana'
      })
      .expect(200)
      .end(done);
  });
});
