// Mocha's describe(), it() etc. are global

var app = require('../server');
var request = require('supertest');
var Promise = require('bluebird');
var expect = require('chai').expect;
var ReadFile = Promise.promisify(require('fs').readFile);
var Title = app.models.Title;
var CountTitles = Promise.promisify(Title.count, Title);
var FindTitles = Promise.promisify(Title.find, Title);

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
          if (err) {
            throw err;
          }
          if (!accessToken) {
            reject(err);
          }
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
    describe('Method', function() {
      it('should return empty array when posted null', function(done) {
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).post('/api/Titles/DataImport')
          .query({ access_token: accessToken.id })
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ csv: '' })
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            }
            expect(res.body.result).to.be.empty;
            done();
          });
        })
        .catch(function(err) {
          done(err);
        });
      });
      it('should return 422 when posted csv with flawed line', function(done){
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).post('/api/Titles/DataImport')
          .query({ access_token: accessToken.id })
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ csv: ',10,,32,14,45,22,19,Kukkakauppa,0,1,0,0,"lautaa voi käyttää rakentamiseen",0' })
          .expect(422)
          .end(function(err, res) {
            if (err) {
              done(err);
            }
            expect(res.body.result).to.be.empty;
            done();
          });
        })
        .catch(function(err) {
          done(err);
        });
      });
      it('should change non-existing titlegroupId, accountId & supplierId to 0', function(done){
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).post('/api/Titles/DataImport')
          .query({ access_token: accessToken.id })
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .set('Accept', '*/*')
          .send({ csv: '"Ruuvimeisseli",5,kpl,100,21,121,8,6,"Rautatavarakauppa",1,1,0,1,"Rakenteluun",1' })
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            } else {
              expect(res.body.result).to.not.be.empty;
              expect(res.body.result[0]).to.have.deep.property('titlegroupId', 0);
              expect(res.body.result[0]).to.have.deep.property('accountId', 0);
              expect(res.body.result[0]).to.have.deep.property('supplierId', 0);
              done();
            }
          });
        })
        .catch(function(err) {
          done(err);
        });
      });
      it('should not change existing titlegroupId, accountId & supplierId to 0', function(done){
        loginUser(username, userpass)
        .then(function(accessToken) {
          request(app).post('/api/Titles/DataImport')
          .query({ access_token: accessToken.id })
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ csv: '"Kakkosnelonen",1,m,32,21,45,1,1,"Lautakauppa",0,1,0,0,"lautaa voi käyttää rakentamiseen",0' })
          .expect(200)
          .end(function(err, res) {
            if (err) {
              done(err);
            } else {
              expect(res.body.result).to.not.be.empty;
              expect(res.body.result[0]).to.have.deep.property('titlegroupId', 1);
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
      it('should accept 5000 line csv-file', function(done){
        this.timeout(12000);
        var readCSV = ReadFile('./server/test/big_test_5000.csv', 'utf-8');
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
    describe('Database', function() {
      it('should contain 5002 Title-objects', function(done) {
        CountTitles()
        .then(function(count) {
          // console.log(count);
          expect(count).to.equal(5002);
          done();
        });
      });
      it('should have Title-object with name ruuvimeisseli and titlegroupId, accountId and supplierId 0', function(done) {
        FindTitles({ where: { name: 'Ruuvimeisseli' } })
        .then(function(titles) {
          expect(titles).to.have.length(1);
          expect(titles[0]).to.have.deep.property('titlegroupId', 0);
          expect(titles[0]).to.have.deep.property('accountId', 0);
          expect(titles[0]).to.have.deep.property('supplierId', 0);
          done();
        })
        .catch(function(err) {
          done(err);
        });
      });
      it('should have Title-object with name kakkosnelonen and titlegroupId, accountId and supplierId 1', function(done) {
        FindTitles({ where: { name: 'Kakkosnelonen' } })
        .then(function(titles) {
          expect(titles).to.have.length(1);
          expect(titles[0]).to.have.deep.property('titlegroupId', 1);
          expect(titles[0]).to.have.deep.property('accountId', 1);
          expect(titles[0]).to.have.deep.property('supplierId', 1);
          done();
        })
        .catch(function(err) {
          done(err);
        });
      });
    });
  });
