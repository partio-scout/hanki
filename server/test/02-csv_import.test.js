// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var Promise = require('bluebird');
var expect = require('chai').expect;
var ReadFile = Promise.promisify(require('fs').readFile);
var Title = app.models.Title;
var CountTitles = Promise.promisify(Title.count, Title);

describe('DataImport', function() {
    var User = app.models.User;
    var username = 'some_user';
    var userpass = 'salasana';

    function loginUser(username, userpass) {
      return new Promise(function (resolve, reject) {
        return User.login({
          username: username,
          password: userpass
        }, function(err, accessToken) {
          if (err) throw err;
          if (!accessToken) reject(err);
          else resolve(accessToken);
        });
      });
    }
    function createUser(username,pass) {
      return new Promise(function (resolve, reject) {
        return User.create({
          username: username,
          password: pass,
          email: 'user@foo.fi'
        }, function(err, obj) {
          if (err) throw err;
          resolve(obj);
        });
      });
    }
    before('Create user', function() {
      createUser(username, userpass);
    });
    // REST API tests for unauthenticated and authenticated users (nothing posted)
    describe('REST API', function() {
      it('should decline access for unauthenticated users', function(done) {
        request(app).post('/api/Titles/DataImport')
        .expect(401)
        .end(done);
      });
      it('should grant access for unauthenticated users', function(done) {
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
    describe('method', function() {
      it('should return empty array when posted null', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).post('/api/Titles/DataImport')
          .query({ access_token: accessToken.id })
          .send({ csv: '' })
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            }
            expect(res.body.result).to.be.empty;
            done();
          });
        }, function(err) {
          throw (err);
        });
      });
      it('should return 422 when posted csv with flawed line', function(done){
        var TitlesCountWithWhereClause = CountTitles({ supplierTitlecode: 'Kukkakauppa' });
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).post('/api/Titles/DataImport')
          .query({ access_token: accessToken.id })
          .send({ csv: ',10,,32,14,45,22,19,Kukkakauppa,0,1,0,0,"lautaa voi käyttää rakentamiseen",0' })
          .expect(422)
          .end(function(err, res) {
            if (err) {
              done(err);
            }
            expect(res.body.result).to.be.empty;
            TitlesCountWithWhereClause
            .then(function(count) {
              expect(count).to.be.equal(0);
              done();
            }, function(err) {
              throw (err);
            });
          });
        }, function(err) {
          throw (err);
        });
      });
      it('should change non-existing titlegroupId, accountId & supplierId to 0', function(done){
        // this.timeout(5000);
        var TitlesCount1 = CountTitles();
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).post('/api/Titles/DataImport')
          .query({ access_token: accessToken.id })
          .send({ csv: 'Lauta,10,m,32,14,45,22,19,Lautakauppa,0,1,0,0,"lautaa voi käyttää rakentamiseen",0' })
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw (err);
            } else {
              expect(res.body.result).to.not.be.empty;
              expect(res.body.result[0]).to.have.deep.property('titlegroupId', 0);
              expect(res.body.result[0]).to.have.deep.property('accountId', 0);
              expect(res.body.result[0]).to.have.deep.property('supplierId', 0);
              TitlesCount1
              .then(function(count) {
                console.log(count);
                expect(count).to.be.at.least(1);
                done();
              }, function(err) {
                throw (err);
              });
            }
          });
        }, function(err) {
          throw (err);
        });
      });
      it('should not change existing titlegroupId, accountId & supplierId to 0', function(done){
        var TitlesCount2 = CountTitles();
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).post('/api/Titles/DataImport')
          .query({ access_token: accessToken.id })
          .send({ csv: 'Kakkosnelonen,1,m,32,21,45,1,1,Lautakauppa,0,1,0,0,"lautaa voi käyttää rakentamiseen",0' })
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            } else {
              expect(res.body.result).to.not.be.empty;
              expect(res.body.result[0]).to.have.deep.property('titlegroupId', 1);
              expect(res.body.result[0]).to.have.deep.property('accountId', 1);
              expect(res.body.result[0]).to.have.deep.property('supplierId', 1);
              TitlesCount2
              .then(function(count) {
                console.log(count);
                expect(count).to.be.at.least(1);
                done();
              }, function(err) {
                throw (err);
              });
            }
          });
        }, function(err) {
          throw (err);
        });
      });
      it('should accept 5000 line csv-file', function(done){
        var TitlesCount3 = CountTitles();
        this.timeout(5000);
        var readCSV = ReadFile('./server/test/big_test_5000.csv', 'utf-8');
        readCSV
        .then(function(str) {
          loginUser(username, userpass)
          .then(function(accessToken) {
            request(app).post('/api/Titles/DataImport')
            .query({ access_token: accessToken.id })
            .send({ csv: str })
            .expect(200)
            .end(function(err, res) {
              if (err) {
                throw (err);
              } else {
                expect(res.body.result).to.have.length(5000);
                TitlesCount3
                .then(function(count) {
                  console.log(count);
                  expect(count).to.be.at.least(5000);
                  done();
                }, function(err) {
                  throw (err);
                });
              }
            });
          });
        })
        .catch(function(err) {
          throw (err);
          done(err);
        });
      });
    });
  });
