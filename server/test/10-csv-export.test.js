// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils.js');
var Promise = require('bluebird');

describe('CSVExport', function() {

  // REST API tests for unauthenticated and authenticated users (nothing posted)
  describe('REST API', function() {

    it('should decline access for unauthenticated users', function(done) {
      request(app).post('/api/Purchaseorderrows/CSVExport')
      .expect(401)
      .end(done);
    });

    it('should grant access for procurementAdmin', function(done) {
      testUtils.loginUser('procurementAdmin').then(function(accessToken) {
        request(app).post('/api/Purchaseorderrows/CSVExport')
        .query({ access_token: accessToken.id })
        .expect(200)
        .end(done);
      });
    });

    it('should grant access for controller', function(done) {
      testUtils.loginUser('controller').then(function(accessToken) {
        request(app).post('/api/Purchaseorderrows/CSVExport')
        .query({ access_token: accessToken.id })
        .expect(200)
        .end(done);
      });
    });

    it('should grant access for procurementMaster', function(done) {
      testUtils.loginUser('procurementMaster').then(function(accessToken) {
        request(app).post('/api/Purchaseorderrows/CSVExport')
        .query({ access_token: accessToken.id })
        .expect(200)
        .end(done);
      });
    });
  });

  describe('method', function() {
    var purchaseorderId, costcenterId, orderrowId, costcenterCode;

    beforeEach(function(done) {
      var costcenter = {
        'code': '00001',
        'name': 'Testikustannuspaikka',
        'approverUserId': 2,
        'controllerUserId': 3
      };
      testUtils.createFixture('Costcenter', costcenter)
      .then(function(ccenter) {
        costcenterId = ccenter.costcenterId;
        costcenterCode = ccenter.code;
        return testUtils.createFixture('Purchaseorder', {
          'name': 'Testitilaus',
          'costcenterId': costcenterId,
          'usageobjectId': 1,
          'subscriberId': 3
        });
      }).then(function(order) {
        purchaseorderId = order.orderId;
      }).nodeify(done);
    });

    afterEach(function(done) {
      Promise.join(
        testUtils.deleteFixtureIfExists('Costcenter', costcenterId),
        testUtils.deleteFixtureIfExists('Purchaseorder', purchaseorderId),
        testUtils.deleteFixtureIfExists('Purchaseorderrow', orderrowId)
      ).nodeify(done);
    });

    it('should add order name and costcenterId to purchaseorderrow', function(done) {
      var login = testUtils.loginUser('procurementAdmin');

      login.then(function(accessToken) {
        return testUtils.createFixture('Purchaseorderrow',
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
            'orderId': purchaseorderId,
            'ordered': false,
            'providerApproval': false,
            'purchaseOrderNumber': 0,
            'titleId': 0,
            'userSectionApproval': false,
            'nameOverride': 'n/a',
            'priceOverride': 0,
            'unitOverride': 'n/a'
          }
        );
      })
      .then(function(orderrow) {
        orderrowId = orderrow.orderRowId;
        var expectedCSV = purchaseorderId + ',"Testitilaus",' + costcenterCode + ',' + orderrowId;
        request(app).post('/api/Purchaseorderrows/CSVExport?access_token=' + login.value().id )
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.csv).to.have.string(expectedCSV);
          }
        });
      }).nodeify(done);
    });
  });
});
