var app = require('../server');
var request = require('supertest');
var testUtils = require('./utils/test-utils');
var expect = require('chai').expect;

describe('External order', function() {
  var externalOrderId;

  beforeEach(function(done) {
    testUtils.loginUser('procurementAdmin').then(function(accessToken) {
      request(app).post('/api/Externalorders?access_token=' + accessToken.id)
      .send( {
        'memo': 'Tämä on testi',
        'supplierName': 'testitoimittaja',
        'businessId': '1234567',
      })
      .expect(200)
      .end(done);
    });
  });

  afterEach(function(done) {
    testUtils.deleteFixturesIfExist('Externalorder')
    .nodeify(done);
  });

  it('should have code over 5 characters long', function(done) {
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
            expect(res.body[0].externalorderCode).to.have.length.least(5);
            done();
          } catch (e) {
            done(e);
          }
        }
      });
    });
  });
});
