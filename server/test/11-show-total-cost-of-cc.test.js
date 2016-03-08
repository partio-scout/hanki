// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var testUtils = require('./utils/test-utils.js');
var Promise = require('bluebird');

describe('Total sum of orders in costcenter', function() {
  var ccId1, ccId2, ccId3, odrId1, odrId2, odrId3, odrId4, ttlId1, ttlId2, ttlId3, odrrowId1, odrrowId2, odrrowId3, odrrowId4, odrrowId5;

  beforeEach(function(done) {
    var costcenters = [
      {
        'code': '00001',
        'name': 'Kustannuspaikka yhdellä tilauksella',
        'approverUserId': 2,
        'controllerUserId': 3,
      },
      {
        'code': '00002',
        'name': 'Kustannuspaikka kahdella tilauksella',
        'approverUserId': 2,
        'controllerUserId': 3,
      },
      {
        'code': '00003',
        'name': 'Kustannuspaikka omilla tuotteilla',
        'approverUserId': 2,
        'controllerUserId': 3,
      },
    ];
    var titles = [
      {
        'name': 'n/a',
        'titlegroupId': 1,
        'unit': 'kpl',
        'vatPercent': 0.24,
        'priceWithTax': 13,
        'accountId': 1,
        'supplierId': 0,
        'supplierTitleCode': '',
        'toResold': false,
        'toRent': false,
        'toBought': true,
        'toSignedFor': false,
        'memo': 'n/a',
        'selectable': true,
      },
      {
        'name': 'n/a',
        'titlegroupId': 1,
        'unit': 'kpl',
        'vatPercent': 0.24,
        'priceWithTax': 0.50,
        'accountId': 1,
        'supplierId': 0,
        'supplierTitleCode': '',
        'toResold': false,
        'toRent': false,
        'toBought': true,
        'toSignedFor': false,
        'memo': 'n/a',
        'selectable': true,
      },
      {
        'name': 'n/a',
        'titlegroupId': 0,
        'unit': 'kpl',
        'vatPercent': 0.24,
        'priceWithTax': 2000000,
        'accountId': 1,
        'supplierId': 0,
        'supplierTitleCode': '',
        'toResold': false,
        'toRent': false,
        'toBought': true,
        'toSignedFor': false,
        'memo': 'n/a',
        'selectable': true,
      },
    ];

    testUtils.createFixture('Costcenter', costcenters)
    .then(function(createdCostcenters) {
      ccId1 = createdCostcenters[0].costcenterId;
      ccId2 = createdCostcenters[1].costcenterId;
      ccId3 = createdCostcenters[2].costcenterId;

      return testUtils.createFixture('Purchaseorder', [
        {
          'name': 'Tilaus yhdellä rivillä',
          'costcenterId': ccId1,
          'usageobjectId': 1,
          'subscriberId': 3,
        },
        {
          'name': 'Tilaus yhdellä rivillä',
          'costcenterId': ccId2,
          'usageobjectId': 1,
          'subscriberId': 3,
        },
        {
          'name': 'Tilaus kahdella rivillä',
          'costcenterId': ccId2,
          'usageobjectId': 1,
          'subscriberId': 3,
        },
        {
          'name': 'Tilaus yhdellä rivillä',
          'costcenterId': ccId3,
          'usageobjectId': 1,
          'subscriberId': 3,
        },
      ]);
    }).then(function(createdOrders) {
      odrId1 = createdOrders[0].orderId;
      odrId2 = createdOrders[1].orderId;
      odrId3 = createdOrders[2].orderId;
      odrId4 = createdOrders[3].orderId;

      return testUtils.createFixture('Title', titles);
    }).then(function(createdTitles) {
      ttlId1 = createdTitles[0].titleId;
      ttlId2 = createdTitles[1].titleId;
      ttlId3 = createdTitles[2].titleId;

      return testUtils.createFixture('Purchaseorderrow', [
        {
          'titleId': ttlId2,
          'amount': 291,
          'deliveryId': 1,
          'orderId': odrId1,
          'selfSupply': 'false',
          'modified': '2015-07-26 13:40:15.002+03',
          'approved': 'false',
        },
        {
          'titleId': ttlId1,
          'amount': 35,
          'deliveryId': 1,
          'orderId': odrId2,
          'selfSupply': 'false',
          'modified': '2015-07-26 13:40:15.002+03',
          'approved': 'false',
        },
        {
          'titleId': ttlId1,
          'amount': 543,
          'deliveryId': 1,
          'orderId': odrId3,
          'selfSupply': 'false',
          'modified': '2015-07-26 13:40:15.002+03',
          'approved': 'false',
        },
        {
          'titleId': ttlId2,
          'amount': 678,
          'deliveryId': 1,
          'orderId': odrId3,
          'selfSupply': 'false',
          'modified': '2015-07-26 13:40:15.002+03',
          'approved': 'false',
        },
        {
          'titleId': ttlId3,
          'amount': 2344,
          'deliveryId': 1,
          'orderId': odrId4,
          'selfSupply': 'false',
          'modified': '2015-07-26 13:40:15.002+03',
          'approved': 'false',
          'priceOverride': 10,
        },
      ]);
    }).then(function(createdOrderrows) {
      odrrowId1 = createdOrderrows[0].orderRowId;
      odrrowId2 = createdOrderrows[1].orderRowId;
      odrrowId3 = createdOrderrows[2].orderRowId;
      odrrowId4 = createdOrderrows[3].orderRowId;
      odrrowId5 = createdOrderrows[4].orderRowId;
    }).nodeify(done);
  });

  afterEach(function(done) {
    Promise.join(
      testUtils.deleteFixtureIfExists('Costcenter', ccId1),
      testUtils.deleteFixtureIfExists('Costcenter', ccId2),
      testUtils.deleteFixtureIfExists('Costcenter', ccId3),
      testUtils.deleteFixtureIfExists('Purchaseorder', odrId1),
      testUtils.deleteFixtureIfExists('Purchaseorder', odrId2),
      testUtils.deleteFixtureIfExists('Purchaseorder', odrId3),
      testUtils.deleteFixtureIfExists('Purchaseorder', odrId4),
      testUtils.deleteFixtureIfExists('Title', ttlId1),
      testUtils.deleteFixtureIfExists('Title', ttlId2),
      testUtils.deleteFixtureIfExists('Title', ttlId3),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', odrrowId1),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', odrrowId2),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', odrrowId3),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', odrrowId4),
      testUtils.deleteFixtureIfExists('Purchaseorderrow', odrrowId5)
    ).nodeify(done);
  });

  function totalPriceOfCostCenterShouldBe(costcenterId, value, cb) {
    var login = testUtils.loginUser('procurementAdmin');

    login.then(function(accessToken) {
      request(app).get('/api/Costcenters/' + costcenterId + '?access_token=' + accessToken.id)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          cb(err);
        } else {
          try {
            expect(err).to.be.null;
            expect(res.body.totalPrice).to.equal(value);
            cb();
          } catch (e) {
            cb(e);
          }
        }
      });
    });
  }

  it('should calculate right when costcenter has one order with one orderrow', function(done) {
    totalPriceOfCostCenterShouldBe(ccId1, 145.5, done);
  });
  it('should calculate right when costcenter has order with one orderrow and one order with two orderrows', function(done) {
    totalPriceOfCostCenterShouldBe(ccId2, 7853, done);
  });
  it('should calculate right when costcenter has one order with orderrow that has \'Muu tuote\' title', function(done) {
    totalPriceOfCostCenterShouldBe( ccId3, 23440, done);
  });

});
