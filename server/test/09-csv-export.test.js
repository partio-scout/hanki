// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils.js');

describe('CSVExport', function() {

  var testId = 123;

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

  describe('method', function() {

    before(function(done) {
      var costcenter = {
        'costcenterId': testId,
        'code': '00001',
        'name': 'Testikustannuspaikka',
        'approverUserId': 2,
        'controllerUserId': 3
      };
      var purchaseorder = {
        'orderId': testId,
        'name': 'Testitilaus',
        'costcenterId': testId,
        'usageobjectId': 1,
        'subscriberId': 3
      };
      testUtils.createFixture('Costcenter', costcenter)
      .then(
        testUtils.createFixture('Purchaseorder', purchaseorder)
      ).then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    after(function(done) {
      testUtils.deleteFixtureIfExists('Costcenter', testId)
      .then(
        testUtils.deleteFixtureIfExists('Purchaseorder', testId)
      )
      .then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    afterEach(function(done) {
      app.models.Purchaseorderrow.destroyById(testId, done);
    });

    it('should add order name and costcenterId to purchaseorderrow', function(done) {
      var expectedCSV = testId + ',"Testitilaus",' + testId + ',' + testId;

      testUtils.loginUser('procurementAdmin').then(function(accessToken) {
        testUtils.createFixture('Purchaseorderrow',
          {
            'amount': 0,
            'approved': false,
            'confirmed': false,
            'controllerApproval': false,
            'delivered': false,
            'deliveryId': 0,
            'finished': false,
            'memo': 'n/a',
            'modified': '2015-07-26 13:40:15.002+03',
            'orderId': testId,
            'orderRowId': testId,
            'ordered': false,
            'providerApproval': false,
            'purchaseOrderNumber': 0,
            'titleId': 0,
            'userSectionApproval': false,
            'nameOverride': 'n/a',
            'priceOverride': 0,
            'unitOverride': 'n/a'
          }).then(function() {
            request(app).post('/api/Purchaseorderrows/CSVExport?access_token=' + accessToken.id )
            .expect(200)
            .end(function(err, res) {
              if (err) {
                done(err);
              } else {
                try {
                  expect(res.body.csv).to.have.string(expectedCSV);
                  done();
                } catch (e) {
                  done(e);
                }
              }
            });
          })
        .catch(function(err) {
          done(err);
        });
      });
    });
  });
});
