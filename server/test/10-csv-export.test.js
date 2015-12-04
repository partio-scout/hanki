// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils.js');
var Promise = require('bluebird');

describe('CSVExport', function() {

  // REST API tests for unauthenticated and authenticated users (nothing posted)
  describe('REST API', function() {

    function itShouldGrantAccessFor(role) {
      it('should grant access for ' + role, function(done) {
        testUtils.loginUser(role).then(function(accessToken) {
          request(app).post('/api/Purchaseorderrows/CSVExport')
          .query({ access_token: accessToken.id })
          .expect(200)
          .end(function(err, res) {
            console.log(err);
            done();
          });
        });
      });
    }

    it('should decline access for unauthenticated users', function(done) {
      request(app).post('/api/Purchaseorderrows/CSVExport')
      .expect(401)
      .end(done);
    });

    itShouldGrantAccessFor('procurementAdmin');
    itShouldGrantAccessFor('controller');
    itShouldGrantAccessFor('procurementMaster');

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
    var purchaseorderId, costcenterId, orderrowId, costcenterCode, ordererEmail, deliveryDescription;
    var titleName, price, titlegroupName, titleUnit, titleId, ordererId, deliveryId;

    beforeEach(function(done) {
      var costcenter = {
        'code': '00001',
        'name': 'Testikustannuspaikka',
        'approverUserId': 2,
        'controllerUserId': 3
      };
      var delivery = {
        "name": "Testitoimitus",
        "description": "Testitoimitus",
        "address": "n/a"
      };
      var purchaseuser = {
        "memberNumber": "0000001",
        "username": "n/a",
        "password": "salasana",
        "name": "n/a",
        "phone": "0000000000",
        "email": "testi@testitilaaja.com",
        "enlistment": "n/a",
        "userSection": "n/a"
      };
      testUtils.createFixture('Purchaseuser', purchaseuser)
      .then(function(purchaseuser) {
        ordererId = purchaseuser.id;
        ordererEmail = purchaseuser.email;
        return testUtils.createFixture('Costcenter', costcenter);
      }).then(function(ccenter) {
        costcenterId = ccenter.costcenterId;
        costcenterCode = ccenter.code;
        return testUtils.createFixture('Purchaseorder', {
          'name': 'Testitilaus',
          'costcenterId': costcenterId,
          'usageobjectId': 1,
          'subscriberId': ordererId
        });
      }).then(function(order) {
        purchaseorderId = order.orderId;
        return testUtils.createFixture('Delivery', delivery);
      }).then(function(delivery) {
        deliveryDescription = delivery.description;
        deliveryId = delivery.deliveryId;
        return testUtils.createFixture('Title', {
          "name": "Testituote",
          "titlegroupId": 1,
          "unit": "m",
          "vatPercent": 0.24,
          "priceWithTax": 2.50,
          "accountId": 1,
          "supplierId": 0,
          "supplierTitleCode": "",
          "toResold": false,
          "toRent": false,
          "toBought": true,
          "toSignedFor": false,
          "memo": "",
          "selectable": true
        });
      }).then(function(title) {
        titleId = title.titleId;
        return testUtils.createFixture('Purchaseorderrow',
          {
            'amount': 0,
            'approved': false,
            'confirmed': false,
            'controllerApproval': false,
            'delivered': false,
            'deliveryId': deliveryId,
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
          });
      }).then(function(orderrow) {
        orderrowId = orderrow.orderRowId;
      }).nodeify(done);
    });

    afterEach(function(done) {
      Promise.join(
        testUtils.deleteFixtureIfExists('Purchaseuser', ordererId),
        testUtils.deleteFixtureIfExists('Costcenter', costcenterId),
        testUtils.deleteFixtureIfExists('Purchaseorder', purchaseorderId),
        testUtils.deleteFixtureIfExists('Delivery', deliveryId),
        testUtils.deleteFixtureIfExists('Title', titleId),
        testUtils.deleteFixtureIfExists('Purchaseorderrow', orderrowId)
      ).nodeify(done);
    });

    // lisättävä testit nimikkeen ja tilauksen tietojen lisäyksestä

    it('should add order name, costcenterId, ordererEmail to purchaseorderrow', function(done) {
      var login = testUtils.loginUser('procurementAdmin');

      login.then(function(accessToken) {
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
