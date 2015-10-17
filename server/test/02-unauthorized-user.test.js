var app = require('../server');
var request = require('supertest');

describe('Unauthenticated user', function() {
  function itShouldDeclineUnauthenticatedAccessTo(endpoint) {
    it('should not be able to access ' + endpoint, function(done) {
      request(app).get('/api/' + endpoint)
        .expect(401)
        .end(done);
    });
  }

  itShouldDeclineUnauthenticatedAccessTo('Accounts');
  itShouldDeclineUnauthenticatedAccessTo('Costcenters');
  itShouldDeclineUnauthenticatedAccessTo('Deliveries');
  itShouldDeclineUnauthenticatedAccessTo('Purchaseorderrows');
  itShouldDeclineUnauthenticatedAccessTo('Purchaseorders');
  itShouldDeclineUnauthenticatedAccessTo('Suppliers');
  itShouldDeclineUnauthenticatedAccessTo('Titlegroups');
  itShouldDeclineUnauthenticatedAccessTo('Titles');

});
