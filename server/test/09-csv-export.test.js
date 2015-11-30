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

  describe('method', function() {

    before(function(done) {
      var costcenter = {
        'code': '00001',
        'name': 'Testikustannuspaikka',
        'approverUserId': 2,
        'controllerUserId': 3
      };
      testUtils.createFixture('Costcenter', costcenter)
      .then(function(ccenter) {
        testUtils.createFixture('Purchaseorder', {
          'name': 'Testitilaus',
          'costcenterId': ccenter.costcenterId,
          'usageobjectId': 1,
          'subscriberId': 3
        });
      }).then(function() {
        done();
      })
      .catch(function(err) {
        done(err);
      });
    });

    after(function(done) {
      testUtils.find('Costcenter', { 'name': 'Testikustannuspaikka' })
      .then(function(costcenter) {
        testUtils.find('Purchaseorder', { 'name': 'Testitilaus' })
        .then(function(purchaseorder) {
          testUtils.deleteFixtureIfExists('Costcenter', costcenter.costcenterId)
          .then(
            testUtils.deleteFixtureIfExists('Purchaseorder', purchaseorder.orderId)
          );
        });
      }).then(function() {
        done();
      },function(err) {
        done(err);
      });
    });

    afterEach(function(done) {
      testUtils.find('Purchaseorderrow', { 'memo': 'Tämä on testi csv-exporttia varten' })
      .then(function(orderrow) {
        app.models.Purchaseorderrow.destroyById(orderrow[0].orderRowId, done);
      });
    });

    it('should add order name and costcenterId to purchaseorderrow', function(done) {

      testUtils.loginUser('procurementAdmin').then(function(accessToken) {
        testUtils.find('Costcenter', { 'name': 'Testikustannuspaikka' })
        .then(function(costcenter) {
          testUtils.find('Purchaseorder', { 'name': 'Testitilaus' })
          .then(function(purchaseorder) {
            testUtils.createFixture('Purchaseorderrow',
              {
                'amount': 0,
                'approved': false,
                'confirmed': false,
                'controllerApproval': false,
                'delivered': false,
                'deliveryId': 0,
                'finished': false,
                'memo': 'Tämä on testi csv-exporttia varten',
                'modified': '2015-07-26 13:40:15.002+03',
                'orderId': purchaseorder[0].orderId,
                'ordered': false,
                'providerApproval': false,
                'purchaseOrderNumber': 0,
                'titleId': 0,
                'userSectionApproval': false,
                'nameOverride': 'n/a',
                'priceOverride': 0,
                'unitOverride': 'n/a'
              }
            ).then(function(orderrow) {
              var expectedCSV = purchaseorder[0].orderId + ',"Testitilaus",' + costcenter[0].costcenterId + ',' + orderrow.orderRowId;
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
            });
          });
        });
      })
      .catch(function(err) {
        done(err);
      });
    });
  });
});
