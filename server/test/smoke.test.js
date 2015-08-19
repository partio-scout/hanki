// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;

describe('Server', function() {
  it('should start up', function(done) {
    request(app).get('/')
      .expect(200)
      .expect(function(res) {
        expect(res.body.started).to.be.a('string');
      })
      .end(done);
  });
});

describe('Accounts', function() {
  it('should initially contain two Account objects', function(done) {
    app.models.Account.find({ }, function(err, res) {
      expect(res).to.have.length(2);
      expect(err).to.be.null;
      done();
    });
  });
});

describe('REST API', function() {
  it('should decline access to Accounts for unauthenticated users', function(done) {
    request(app).get('/api/Accounts')
      .expect(401)
      .end(done);
  });
});
