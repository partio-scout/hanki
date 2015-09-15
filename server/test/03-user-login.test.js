var app = require('../server');
var request = require('supertest');
//var expect = require('chai').expect;

// same password for all users
//var password = 'salasana';

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
