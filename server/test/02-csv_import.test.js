// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var expect = require('chai').expect;
var fs = require('fs');
var testUtils = require('./utils/test-utils.js');

describe('DataImport', function() {
  var username = 'procurementAdmin';
  var userpass = 'salasana';

  afterEach(function(done) {
    app.models.Title.destroyAll(done);
  });

  function postCSV(accessToken, csv) {
    return request(app).post('/api/Titles/DataImport')
      .query({ access_token: accessToken.id })
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({ csv: csv });
  }

  function expectTitleCountInDatabaseToBe(num, cb) {
    app.models.Title.count(function(err, count) {
      if (err) {
        throw err;
      }
      expect(count).to.equal(num);
      cb();
    });
  }

  function itShouldNotAcceptCSV(description, csv) {
    it('should return 422 when posted csv ' + description, function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        postCSV(accessToken, csv)
        .expect(422)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.be.empty;
            expectTitleCountInDatabaseToBe(0, done);
          }
        });
      })
      .catch(function(err) {
        done(err);
      });
    });
  }

  // REST API tests for unauthenticated and authenticated users (nothing posted)
  describe('REST API', function() {

    it('should decline access for unauthenticated users', function(done) {
      request(app).post('/api/Titles/DataImport')
      .expect(401)
      .end(done);
    });

    it('should grant access for authenticated users', function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app).post('/api/Titles/DataImport')
        .query({ access_token: accessToken.id })
        .expect(200)
        .end(done);
      });
    });
  });

  // test different input strings
  describe('Method', function() {
    it('should return empty array when posted null', function(done) {
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        postCSV(accessToken, '')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.result).to.be.empty;
            done();
          }
        });
      })
      .catch(function(err) {
        done(err);
      });
    });

    itShouldNotAcceptCSV('containing a single flawed line', ',10,,32,14,45,22,19,Kukkakauppa,0,1,0,0,"lautaa voi käyttää rakentamiseen",0');
    itShouldNotAcceptCSV('containing many lines and one flawed', fs.readFileSync('./server/test/single_flawed_line.csv', 'utf-8'));

    itShouldNotAcceptCSV('with missing title group', '"Ruuvimeisseli","Työkalut",kpl,100,21,121,"Testitili 1","Tmi Toimittaja","Rautatavarakauppa",1,1,0,1,"Rakenteluun",1');
    itShouldNotAcceptCSV('with missing account', '"Ruuvimeisseli","Rautatavara",kpl,100,21,121,"Testitili jota ei ole","Tmi Toimittaja","Rautatavarakauppa",1,1,0,1,"Rakenteluun",1');
    itShouldNotAcceptCSV('with missing supplier', '"Ruuvimeisseli","Rautatavara",kpl,100,21,121,"Testitili 1","Olematon Oy","Rautatavarakauppa",1,1,0,1,"Rakenteluun",1');

    it('should save the titles with the correct titlegroupId, accountId and supplierId if they exist', function(done){
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        postCSV(accessToken, '"Kakkosnelonen","Puutavara",m,32,21,45,"Testitili 1","Tmi Toimittaja","Lautakauppa",0,1,0,0,"lautaa voi käyttää rakentamiseen",0')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          } else {
            expect(res.body.result).to.not.be.empty;
            expect(res.body.result[0]).to.have.deep.property('titlegroupId', 2);
            expect(res.body.result[0]).to.have.deep.property('accountId', 1);
            expect(res.body.result[0]).to.have.deep.property('supplierId', 1);
            expectTitleCountInDatabaseToBe(1, done);
          }
        });
      })
      .catch(function(err) {
        done(err);
      });
    });

    it('should accept 100 line csv-file', function(done) {
      var csv = fs.readFileSync('./server/test/big_test_100.csv', 'utf-8');
      this.timeout(15000);
      testUtils.loginUser(username, userpass).then(function(accessToken) {
        request(app).post('/api/Titles/DataImport')
        .query({ access_token: accessToken.id })
        .send({ csv: csv })
        .expect(200)
        .end(function() {
          expectTitleCountInDatabaseToBe(100, done);
        });
      });
    });
  });
});
