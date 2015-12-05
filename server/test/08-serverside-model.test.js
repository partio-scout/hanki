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
});
