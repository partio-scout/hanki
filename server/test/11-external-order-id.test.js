var app = require('../server');
var request = require('supertest');
var testUtils = require('./utils/test-utils');
var Promise = require('bluebird');
var expect = require('chai').expect;

describe('External order', function() {
  var externalOrderId;

  beforeEach(function(done) {
    testUtils.createFixture('Externalorder', {
      'memo': 'Tämä on testi',
      'supplierId': 1,
    }).then(function(exOrder) {
      externalOrderId = exOrder.externalorderId;
    }).nodeify(done);
  });

  afterEach(function(done) {
    testUtils.deleteFixtureIfExists('Externalorder', externalOrderId)
    .nodeify(done);
  });

  it('should have id over 4 characters long', function(done) {
    testUtils.loginUser('procurementAdmin').then(function(accessToken) {
      request(app).get('/api/Externalorders')
      .query({ access_token: accessToken.id })
      .expect(200)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          try {
            expect(err).to.be.null;
            expect(res.body[0].externalorderId).to.have.length.least(4);
            done();
          } catch (e) {
            done(e);
          }
        }
      });
    });
  });
});
