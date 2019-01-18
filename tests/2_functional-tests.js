/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('post new thread', function(done) {
        chai.request(server)
        .post('/api/threads/:board')
        .send({
          board: 'test',
          text: 'test text',
          delete_password: '1234'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('get most recent threads', (done) => {
        chai.request(server)
        .get('/api/threads/test')
        //.query({test: 'test'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'board');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.isArray(res.body[0].replies);
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('delete entire thread', (done) => {
        chai.request(server)
        .get('/api/threads/test')
        //.query({board: 'test'})
        .end((error, response) => {
          chai.request(server)
          .delete('/api/threads/test')
          .send({
            thread_id: response.body[0]._id,
            delete_password: '1234'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
        });
      });

      test('delete with incorrect password', (done) => {
        chai.request(server)
        .post('/api/threads/:board')
        .send({
          board: 'test2',
          text: 'test text2',
          delete_password: '1234'
        })
        .end((error, response) => {
          chai.request(server)
          .get('/api/threads/test')
          //.query({board: 'test2'})
          .end((error2, response2) => {
            chai.request(server)
            .delete('/api/threads/test')
            .send({
              board: 'test',
              thread_id: response2.body._id,
              delete_password: '1111'
            })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, 'Incorrect password');
              done();
            });
          });
        });
      });
    });
    
    suite('PUT', function() {
      test('report thread', (done) => {
        chai.request(server)
        .get('/api/threads/test2')
        .end((err, res) => {
          chai.request(server)
          .put('/api/threads/:board')
          .send({
            board: res.body[0].board,
            thread_id: res.body[0]._id
          })
          .end((error, response) => {
            assert.equal(response.status, 200);
            assert.equal(response.text, 'success');
            done();
          });
        });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('post new reply to thread', (done) => {
        chai.request(server)
        .get('/api/threads/test2')
        .end((err, res) => {
          chai.request(server)
          .post('/api/replies/:board')
          .send({
            board: res.body[0].board,
            thread_id: res.body[0]._id,
            text: 'test',
            delete_password: '1234'
          })
          .end((error, response) => {
            assert.equal(response.status, 200);
            done();
          });
        });
      });
    });
    
    suite('GET', function() {
      test('get all replies in thread', (done) => {
        chai.request(server)
        .get('/api/threads/test2')
        .end((err, res) => {
          chai.request(server)
          .get('/api/replies/test2')
          .query({thread_id: res.body[0]._id})
          .end((error, response) => {
            assert.equal(response.status, 200);
            assert.property(response.body[0], 'text');
            assert.property(response.body[0], 'thread_id');
            assert.property(response.body[0], 'created_on');
            done();
          });
        });
      });
    });
    
    suite('PUT', function() {
      test('report a reply', (done) => {
        chai.request(server)
        .get('/api/threads/test2')
        .end((err, res) => {
          chai.request(server)
          .get('/api/replies/test2')
          .query({thread_id: res.body[0]._id})
          .end((error, response) => {
            chai.request(server)
            .put('/api/replies/test2')
            .send({
              board: res.body[0].board,
              thread_id: res.body[0]._id,
              reply_id: response.body[0]._id
            })
            .end((error2, response2) => {
              assert.equal(response2.status, 200);
              assert.equal(response2.text, 'success');
              done();
            });
          });
        });
      });
    });
    
    suite('DELETE', function() {
      test('delete reply with incorrect password', (done) => {
        chai.request(server)
        .get('/api/threads/test2')
        .end((err, res) => {
          chai.request(server)
          .get('/api/replies/test2')
          .query({thread_id: res.body[0]._id})
          .end((error, response) => {
            chai.request(server)
            .delete('/api/replies/test2')
            .send({
              board: res.body[0].board,
              thread_id: res.body[0]._id,
              reply_id: response.body[0]._id,
              delete_password: '1111'
            })
            .end((error2, response2) => {
              assert.equal(response2.status, 200);
              assert.equal(response2.text, 'incorrect password');
              done();
            });
          });
        });
      });

      test('delete reply with correct password', (done) => {
        chai.request(server)
        .get('/api/threads/test2')
        .end((err, res) => {
          chai.request(server)
          .get('/api/replies/test2')
          .query({thread_id: res.body[0]._id})
          .end((error, response) => {
            chai.request(server)
            .delete('/api/replies/test2')
            .send({
              board: res.body[0].board,
              thread_id: res.body[0]._id,
              reply_id: response.body[0]._id,
              delete_password: '1234'
            })
            .end((error2, response2) => {
              assert.equal(response2.status, 200);
              assert.equal(response2.text, 'success');
              done();
            });
          });
        });
      });

    });
    
  });

});
