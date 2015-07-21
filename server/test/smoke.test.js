// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var assert = require('assert');

describe('Server', function() {
  it('should start up', function() {
    request(app).get('/')
      .expect(200)
      .end(function(err, res) {
      	assert(res.body.started.length > 0);
      });
  });
});
