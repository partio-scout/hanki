// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var Promise = require('bluebird');
var expect = require('chai').expect;
var fs = require('fs');
var ReadFile = Promise.promisify(fs.readFile);

describe('DataImport', function() {
    var User = app.models.Purchaseuser;
    var username = 'procurementAdmin';
    var userpass = 'salasana';

    function loginUser(username, userpass) {
      return new Promise(function (resolve, reject) {
        return User.login({
          username: username,
          password: userpass
        }, function(err, accessToken) {
          if (err) {
            throw err;
          }
          if (!accessToken) {
            reject(err);
          } else {
            resolve(accessToken);
          }
        });
      });
    }

    function postCSV(accessToken, csv) {
      return request(app).post('/api/Titles/DataImport')
        .query({ access_token: accessToken.id })
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({ csv: csv });
    }

    function itSholdNotAcceptCSV(description, csv) {
      it('should return 422 when posted csv ' + description, function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          postCSV(accessToken, csv)
          .expect(422)
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
    }

    // REST API tests for unauthenticated and authenticated users (nothing posted)
    describe('REST API', function() {

      it('should decline access for unauthenticated users', function(done) {
        request(app).post('/api/Titles/DataImport')
        .expect(401)
        .end(done);
      });

      it('should grant access for authenticated users', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
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
        loginUser(username, userpass)
        .then(function(accessToken) {
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

      itSholdNotAcceptCSV('containing a single flawed line', ',10,,32,14,45,22,19,Kukkakauppa,0,1,0,0,"lautaa voi käyttää rakentamiseen",0');
      itSholdNotAcceptCSV('containing many lines and one flawed', fs.readFileSync('./server/test/single_flawed_line.csv', 'utf-8'));

      itSholdNotAcceptCSV('with missing title group', '"Ruuvimeisseli","Työkalut",kpl,100,21,121,"Testitili 1","Tmi Toimittaja","Rautatavarakauppa",1,1,0,1,"Rakenteluun",1');
      itSholdNotAcceptCSV('with missing account', '"Ruuvimeisseli","Rautatavara",kpl,100,21,121,"Testitili jota ei ole","Tmi Toimittaja","Rautatavarakauppa",1,1,0,1,"Rakenteluun",1');
      itSholdNotAcceptCSV('with missing supplier', '"Ruuvimeisseli","Rautatavara",kpl,100,21,121,"Testitili 1","Olematon Oy","Rautatavarakauppa",1,1,0,1,"Rakenteluun",1');

      it('should save the titles with the correct titlegroupId, accountId and supplierId if they exist', function(done){
        loginUser(username, userpass)
        .then(function(accessToken) {
          postCSV(accessToken, '"Kakkosnelonen","Puutavara",m,32,21,45,"Testitili 1","Tmi Toimittaja","Lautakauppa",0,1,0,0,"lautaa voi käyttää rakentamiseen",0')
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            } else {
              expect(res.body.result).to.not.be.empty;
              expect(res.body.result[0]).to.have.deep.property('titlegroupId', 2);
              expect(res.body.result[0]).to.have.deep.property('accountId', 1);
              expect(res.body.result[0]).to.have.deep.property('supplierId', 1);
              done();
            }
          });
        })
        .catch(function(err) {
          done(err);
        });
      });

      it('should accept 100 line csv-file', function(done){
        this.timeout(15000);
        var readCSV = ReadFile('./server/test/big_test_100.csv', 'utf-8');
        readCSV
        .then(function(str) {
          loginUser(username, userpass)
          .then(function(accessToken) {
            request(app).post('/api/Titles/DataImport')
            .query({ access_token: accessToken.id })
            .send({ csv: str })
            .expect(200)
            .end(done);
          });
        })
        .catch(function(err) {
          done(err);
        });
      });
    });

    // Check if database is really updated in the previous tests
    // TODO Move these into same tests
    // TODO Make an afterEach hook that restores the database

    describe('Database', function() {

      it('should contain 100 Title-objects', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).get('/api/Titles/count')
          .query({ access_token: accessToken.id })
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            } else {
              expect(res.body.count).to.equal(100);
              done();
            }
          });
        })
        .catch(function(err) {
          done(err);
        });
      });

      it('should have Title-object with name kakkosnelonen and titlegroupId, accountId and supplierId 1', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).get('/api/Titles')
          .query({ access_token: accessToken.id })
          .send({ filter: { where: { name: 'Kakkosnelonen' } } })
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            } else {
              expect(res.body).to.have.length(1);
              expect(res.body[0]).to.have.deep.property('titlegroupId', 2);
              expect(res.body[0]).to.have.deep.property('accountId', 1);
              expect(res.body[0]).to.have.deep.property('supplierId', 1);
              done();
            }
          });
        })
        .catch(function(err) {
          done(err);
        });
      });

    });
  });
