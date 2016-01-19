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

  it('should not be able to create new Purchaseuser', function(done) {
    request(app).post('/api/Purchaseusers')
      .send({
        email: 'example@example.com',
        password: 'password',
        name: 'n/a',
        phone: 'n/a',
        enlistment: 'n/a',
        userSection: 'n/a',
      })
      .expect(401)
      .end(done);
  });
});
