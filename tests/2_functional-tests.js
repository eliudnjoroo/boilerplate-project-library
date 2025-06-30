/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let searchid

chai.use(chaiHttp);

chai.request(server)
  .post('/api/books')
  .send({ title: "testing" })
  .end((err, res) => { })

suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  //1
  test('#example Test GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        searchid = res.body[0]._id
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function () {

    suite('POST /api/books with title => create book object/expect book object', function () {
      //2
      test('Test POST /api/books with title', function (done) {
        chai.request(server)
          .post(`/api/books`)
          .send({ title: "test2" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body)
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, '_id', 'Book should contain _id');
            done();
          });
      });
      //3
      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .post(`/api/books`)
          .send({ title: "" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });
    });


    suite('GET /api/books => array of books', function () {
      //4
      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get("/api/books")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          })
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function () {
      //5
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai.request(server)
          .get(`/api/books/${searchid}kkk`)
          .end((err, res) => {
            // console.log("id not in db: " + JSON.stringify(res.body))
            assert.equal(res.status, 200);
            done();
          })
      });
      //6
      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .get(`/api/books/${searchid}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, '_id', 'Book should contain _id');
            done();
          })
      });
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function () {
      //7
      test('Test POST /api/books/[id] with comment', function (done) {
        chai.request(server)
          .post(`/api/books/${searchid}`)
          .send({ comment: "beautifull" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body, "response must be body");
            assert.property(res.body, '_id', 'Book should contain title');
            done();
          })
      });
      //8
      test('Test POST /api/books/[id] without comment field', function (done) {
        chai.request(server)
          .post(`/api/books/${searchid}`)
          .send({ comment: "" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          })
      });
      //9
      test('Test POST /api/books/[id] with comment, id not in db', function (done) {
        chai.request(server)
          .post(`/api/books/${searchid}hggh`)
          .send({ comment: "beautifull" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          })
      });

    });
    //10
    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .delete(`/api/books/${searchid}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body, "response must be body");
            done()
          })
      });
      //11
      test('Test DELETE /api/books/[id] with  id not in db', function (done) {
        chai.request(server)
          .delete(`/api/books/${searchid}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body, "response must be body");
            setTimeout(() => {
              chai.request(server)
                .delete("/api/books")
                .end((err, res) => { })
            }, 10000);
            done()
          })
      });
    });
  });
});