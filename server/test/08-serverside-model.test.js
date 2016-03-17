var app = require('../server');
var expect = require('chai').expect;
var Promise = require('bluebird');

var Purchaseorder = app.models.Purchaseorder;
var createPurchaseOrder = Promise.promisify(Purchaseorder.create, Purchaseorder);
var destroyPurchaseOrderById = Promise.promisify(Purchaseorder.destroyById, Purchaseorder);
var destroyAllPurchaseOrder = Promise.promisify(Purchaseorder.destroyAll, Purchaseorder);
var findPurchaseOrderById = Promise.promisify(Purchaseorder.findById, Purchaseorder);

var Purchaseorderrow = app.models.Purchaseorderrow;
var createPurchaseOrderRow = Promise.promisify(Purchaseorderrow.create, Purchaseorderrow);
var destroyPurchaseOrderRowById = Promise.promisify(Purchaseorderrow.destroyById, Purchaseorderrow);
var findPurchaseOrderRowById = Promise.promisify(Purchaseorderrow.findById, Purchaseorderrow);

var Purchaseuser = app.models.Purchaseuser;

function expectPurchaseOrderRowToBeDeleted(id) {
  return findPurchaseOrderRowById(id).then(function(res) { expect(res).to.be.null; });
}

function expectPurchaseOrderRowToExist(id) {
  return findPurchaseOrderRowById(id).then(function(res) { expect(res).to.be.not.null; });
}

var purchaseOrders = [
  {
    'orderId': 11,
    'name': '11',
    'subscriberId': 1,
    'costcenterId': 1,
  },
  {
    'orderId': 22,
    'name': '22',
    'subscriberId': 1,
    'costcenterId': 1,
  },
];

var purchaseOrderRows = [
  {
    'orderRowId': 111,
    'titleId': 1,
    'amount': 16,
    'deliveryId': 1,
    'orderId': 11,
    'approved': false,
    'finished': false,
    'modified': (new Date()).toISOString(),
  },
  {
    'orderRowId': 222,
    'titleId': 1,
    'amount': 16,
    'deliveryId': 1,
    'orderId': 22,
    'approved': false,
    'finished': false,
    'modified': (new Date()).toISOString(),
  },
];

describe('Purchaseorder', function() {
  beforeEach(function(done) {
    Promise.all(purchaseOrders.map(function (purchaseOrder) { return createPurchaseOrder(purchaseOrder); }))
      .then(function() {
        return Promise.all(purchaseOrderRows.map(function (purchaseOrderRow) { return createPurchaseOrderRow(purchaseOrderRow); }));
      })
      .nodeify(done);
  });

  afterEach(function(done) {
    Promise.all(purchaseOrderRows.map(function (purchaseOrderRow) { return destroyPurchaseOrderRowById(purchaseOrderRow.orderRowId); }))
      .then(function() {
        return Promise.all(purchaseOrders.map(function(purchaseOrder) { return destroyPurchaseOrderById(purchaseOrder.orderId); }));
      })
      .nodeify(done);
  });

  describe('prototype.destroy', function() {
    it('should delete order rows belonging to deleted order', function(done) {
      findPurchaseOrderById('11').then(function(purchaseOrder) { return Promise.promisify(purchaseOrder.destroy, purchaseOrder)(); })
        .then(function() { return expectPurchaseOrderRowToBeDeleted('111'); })
        .nodeify(done);
    });

    it('should not delete order rows belonging to other order', function(done) {
      findPurchaseOrderById('11').then(function(purchaseOrder) { return Promise.promisify(purchaseOrder.destroy, purchaseOrder)(); })
        .then(function() { return expectPurchaseOrderRowToExist('222'); })
        .nodeify(done);
    });
  });

  describe('Purchaseorder.destroyAll', function() {
    it('should delete order rows belonging to deleted order', function(done) {
      destroyAllPurchaseOrder({ orderId: '11' })
        .then(function() { return expectPurchaseOrderRowToBeDeleted('111'); })
        .nodeify(done);
    });

    it('should not delete order rows belonging to other order', function(done) {
      destroyAllPurchaseOrder({ orderId: '11' })
        .then(function() { return expectPurchaseOrderRowToExist('222'); })
        .nodeify(done);
    });
  });

  describe('Purchaseorder.destroyById', function() {
    it('should delete order rows belonging to deleted order', function(done) {
      destroyPurchaseOrderById('11')
        .then(function() { return expectPurchaseOrderRowToBeDeleted('111'); })
        .nodeify(done);
    });

    it('should not delete order rows belonging to other order', function(done) {
      destroyPurchaseOrderById('11')
        .then(function() { return expectPurchaseOrderRowToExist('222'); })
        .nodeify(done);
    });
  });

  describe('Purchaseuser.addCostcenterByCode', function(done) {
    var userId;

    beforeEach(function(done) {
      Purchaseuser.create({
        'memberNumber': '12345',
        'username': 'testuser',
        'password': '$2a$10$1rllCFIqdWhaGQM4sEnQEuUa0XSTyRjuzhXo39VEdyUDOVuc93cGC',
        'name': 'Aasd Asad',
        'phone': '041 79396930',
        'email': 'example@roihu2016.fi',
        'enlistment': 'Testi',
        'userSection': 'Testi',
      }, function(err, res) {
        userId = res.id;
        done(err);
      });
    });

    afterEach(function(done) {
      Purchaseuser.destroyById(userId, done);
    });

    it('should add cost center to user', function(done) {
      Purchaseuser.addCostcenterByCode('example@roihu2016.fi', '00000', function() {
        Purchaseuser.findById(userId, { include: 'costcenters' }).then(function(user) {
          expect(user.costcenters()).to.have.length(1);
          expect(user.costcenters()[0].toObject()).to.have.property('code', '00000');
          done();
        }).catch(done);
      });
    });

    it('should report error when user is not found', function(done) {
      Purchaseuser.addCostcenterByCode('nonexistent@roihu2016.fi', '00000', function(err, res) {
        expect(err).to.be.an('Error');
        done();
      });
    });

    it('should report error when cost center is not found', function(done) {
      Purchaseuser.addCostcenterByCode('example@roihu2016.fi', '99999', function(err, res) {
        expect(err).to.be.an('Error');
        done();
      });
    });

  });
});
