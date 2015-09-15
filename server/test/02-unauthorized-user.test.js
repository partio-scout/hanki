var app = require('../server');
var request = require('supertest');
//var assert = require('assert');
//var expect = require('chai').expect;

describe('Unauthenticated user', function() {
  it('should not be able to access Accounts', function(done) {
    request(app).get('/api/Accounts')
      .expect(401)
      .end(done);
  });

  it('should not be able to access Costcenters', function(done) {
    request(app).get('/api/Costcenters')
      .expect(401)
      .end(done);
  });

  it('should not be able to access Deliveries', function(done) {
    request(app).get('/api/Deliveries')
      .expect(401)
      .end(done);
  });

  it('should not be able to access Purchaseorderrows', function(done) {
    request(app).get('/api/Purchaseorderrows')
      .expect(401)
      .end(done);
  });

  it('should not be able to access Purchaseorders', function(done) {
    request(app).get('/api/Purchaseorders')
      .expect(401)
      .end(done);
  });

  it('should not be able to access Suppliers', function(done) {
    request(app).get('/api/Suppliers')
      .expect(401)
      .end(done);
  });

  it('should not be able to access Titlegroups', function(done) {
    request(app).get('/api/Titlegroups')
      .expect(401)
      .end(done);
  });

  it('should not be able to access Titles', function(done) {
    request(app).get('/api/Titles')
      .expect(401)
      .end(done);
  });

});
