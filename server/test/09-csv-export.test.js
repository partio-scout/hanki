// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils.js');

describe('CSVExport', function() {

  // REST API tests for unauthenticated and authenticated users (nothing posted)
  describe('REST API', function() {

    it('should decline access for unauthenticated users', function(done) {
      request(app).post('/api/Purchaseorderrows/CSVExport')
      .expect(401)
      .end(done);
    });

    it('should grant access for authenticated users', function(done) {
      testUtils.loginUser('procurementAdmin').then(function(accessToken) {
        request(app).post('/api/Purchaseorderrows/CSVExport')
        .query({ access_token: accessToken.id })
        .expect(200)
        .end(done);
      });
    });
  });
});