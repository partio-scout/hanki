// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils.js');
var Promise = require('bluebird');

describe('CSVExport', function() {
  var purchaseorderId, costcenterId, orderrowId1, orderrowId2, titleId1, titleId2, ordererId, deliveryId;

  beforeEach(function(done) {
    var costcenter = {
      'code': '0313',
      'name': 'Testikustannuspaikka',
      'approverUserId': 2,
      'controllerUserId': 3,
    };
    var delivery = {
      'name': 'Testitoimitus',
      'description': 'Testitoimitus tulee milloin tulee',
      'address': 'n/a',
    };
    var purchaseuser = {
      'memberNumber': '0000001',
      'username': 'n/a',
      'password': 'salasana',
      'name': 'n/a',
      'phone': '0000000000',
      'email': 'testi@testitilaaja.com',
      'enlistment': 'n/a',
      'userSection': 'n/a',
    };
    testUtils.createFixture('Purchaseuser', purchaseuser)
    .then(function(purchaseuser) {
      ordererId = purchaseuser.id;
      return testUtils.createFixture('Costcenter', costcenter);
    }).then(function(ccenter) {
      costcenterId = ccenter.costcenterId;
      return testUtils.createFixture('Purchaseorder', {
        'name': 'Testitilaus',
        'costcenterId': costcenterId,
        'usageobjectId': 1,
        'subscriberId': ordererId,
      });
    }).then(function(order) {
      purchaseorderId = order.orderId;
      return testUtils.createFixture('Delivery', delivery);
    }).then(function(delivery) {
      deliveryId = delivery.deliveryId;
      return testUtils.createFixture('Title', {
        'name': 'Testituote',
        'titlegroupId': 1,
        'unit': 'm',
        'vatPercent': 0.24,
        'priceWithTax': 375,
        'accountId': 1,
        'supplierId': 0,
        'supplierTitleCode': '',
        'toResold': false,
        'toRent': false,
        'toBought': true,
        'toSignedFor': false,
        'memo': '',
        'selectable': true,
        'titleId': 1,
      });
    }).then(function(title) {
      titleId1 = title.titleId;
      return testUtils.createFixture('Title', {
        'name': 'Muu tuote',
        'titlegroupId': 0,
        'unit': 'n/a',
        'vatPercent': 0.24,
        'priceWithTax': 0,
        'accountId': 1,
        'supplierId': 0,
        'supplierTitleCode': '',
        'toResold': false,
        'toRent': false,
        'toBought': true,
        'toSignedFor': false,
        'memo': '',
        'selectable': true,
        'titleId': 0,
      });
    }).then(function(title) {
      titleId2 = title.titleId;
      return testUtils.createFixture('Purchaseorderrow',
        {
          'amount': 89,
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
          'titleId': titleId1,
          'userSectionApproval': false,
          'nameOverride': 'n/a',
          'priceOverride': 0,
          'unitOverride': 'n/a',
        });
    }).then(function(orderrow) {
      orderrowId1 = orderrow.orderRowId;
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
          'titleId': titleId2,
          'userSectionApproval': false,
          'nameOverride': 'Tuntematon tuote',
          'priceOverride': 107,
          'unitOverride': 'kappale',
        });
    }).then(function(orderrow) {
      orderrowId2 = orderrow.orderRowId;
    }).nodeify(done);
  });

  afterEach(function(done) {
    Promise.join(
      testUtils.deleteFixtureIfExists('Purchaseuser', ordererId),
      testUtils.deleteFixtureIfExists('Costcenter', costcenterId),
      testUtils.deleteFixtureIfExists('Purchaseorder', purchaseorderId),
      testUtils.deleteFixtureIfExists('Delivery', deliveryId),
      testUtils.deleteFixtureIfExists('Title', titleId1),
      testUtils.deleteFixtureIfExists('Title', titleId2),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', orderrowId1),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', orderrowId2)
    ).nodeify(done);
  });

  // REST API tests for unauthenticated and authenticated users (nothing posted)
  describe('REST API', function() {

    function itShouldGrantAccessFor(role) {
      it('should grant access for ' + role, function(done) {
        testUtils.loginUser(role).then(function(accessToken) {
          request(app).post('/api/Purchaseorderrows/CSVExport')
          .query({ access_token: accessToken.id })
          .expect(200)
          .end(done);
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
  });

  describe('method', function() {
    var login = testUtils.loginUser('procurementAdmin');
    var expectedCSV;

    function itShould(description, expectedString) {
      it('should ' + description, function(done) {
        login.then(function(accessToken) {
          request(app).post('/api/Purchaseorderrows/CSVExport?access_token=' + accessToken.id )
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            } else {
              try {
                expect(err).to.be.null;
                expect(res.body.csv).to.have.string(expectedString);
                done();
              } catch (e) {
                done(e);
              }
            }
          });
        });
      });
    }

    expectedCSV = '"0313","Testitilaus","testi@testitilaaja.com"';
    itShould('add order name, costcenterId and ordererEmail to purchaseorderrow', expectedCSV);

    expectedCSV = '"Testituote",89,"m",375';
    itShould('add title name, unit and price ', expectedCSV);

    expectedCSV = '"Tuntematon tuote",0,"kappale",107';
    itShould('add title name, unit and price from orderrow if titlegroup is "Muu tuote"', expectedCSV);

    expectedCSV = '"Testitoimitus tulee milloin tulee"';
    itShould('add delivery description', expectedCSV);
  });
});
