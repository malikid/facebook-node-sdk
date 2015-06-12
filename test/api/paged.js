var nock        = require('nock'),
    should      = require('should'),
    FB          = require('../..');

// before(function () {
//     FB = require('../..');
// });

// afterEach(function () {
//    nock.cleanAll();
// });

describe('Get data more than 50', function () {

    before(function (done) {

        var data = [];
        var DATA_NUMBER = 125;

        for(var i = 0; i < DATA_NUMBER; i++) {
          data.push(Math.floor((Math.random() * 10) + 1));
        }

        nock('https://graph.facebook.com:443')
        .get('/data')
        .reply(200, function(uri, requestBody) {
          console.log("uri", uri);
          var response = {
            data: data.slice(0,50),
            paging: {
              cursors: {
                before: "0",
                after: "50"
              },
              next: "https://graph.facebook.com:443/data?after=50"
            }
          };
          return response;
        })

        .filteringPath(/after=[\d]+/g, 'after=XXX')
        .get('/data?after=XXX')
        .reply(200, function(uri, requestBody) {

          console.log("uri", uri);
          var number = parseInt(uri.replace("/data?after=", ""));
          var after, next;

          if(DATA_NUMBER - number > 50) {
            data = data.slice(number, number + 50);
            after = number + 50;
            next = "https://graph.facebook.com:443/data?after=" + after;
          } else {
            data = data.slice(number);
            after = DATA_NUMBER
          }

          var response = {
            data: data,
            paging: {
              cursors: {
                before: "" + number,
                after: "" + after
              }
            }
          };

          if(next) {
            response.paging.next = next;
          }

          return response;
        });

        done();
        return;
    });

    after(function(done) {
      nock.cleanAll();
      done();
      return;
    });

    describe('GET: data more than 50', function () {

        // describe("FB.api('data', cb)", function () {

        it('query "data" should have 50 pieces of data', function (done) {
            FB.api('data', function (result) {
                console.log("result", result);
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(50);
                result.paging.should.have.properties("cursors", "next");
                result.paging.cursors.should.have.properties("before", "after");
                done();
            });
            // }, function() {
            //     result.should.be.Object;
            //     result.should.be
            // };
        });

        it('query "data?after=50" should also have 50 pieces of data', function (done) {
            FB.api('data?after=50', function (result) {
                console.log("result", result);
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(50);
                result.paging.should.have.properties("cursors", "next");
                result.paging.cursors.should.have.properties("before", "after");
                done();
            });
        });

        it('query "data?after=100" should have 25 pieces of data', function (done) {
            FB.api('data?after=100', function (result) {
                console.log("result", result);
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(25);
                result.paging.should.have.property("cursors");
                result.paging.cursors.should.have.properties("before", "after");
                done();
            });
        });

        // it('should have 789', function (done) {
        //     FB.api('data', function (result) {
        //         console.log("result", result);
        //         result.should.be.Object;
        //         result.should.have.properties("data", "paging");
        //         result.data.length.should.equal(50);
        //         result.paging.should.have.properties("cursors", "next");
        //         result.paging.cursors.should.have.properties("before", "after");
        //         done();
        //     });
        //     // }, function() {
        //     //     result.should.be.Object;
        //     //     result.should.be
        //     // };
        // });

        // });

        // describe("FB.api('/4', cb)", function () {
        //     it('should have id 4', function (done) {
        //         nock('https://graph.facebook.com:443')
        //             .get('/4')
        //             .reply(200, "{\"id\":\"4\",\"name\":\"Mark Zuckerberg\",\"first_name\":\"Mark\",\"last_name\":\"Zuckerberg\",\"link\":\"http:\\/\\/www.facebook.com\\/zuck\",\"username\":\"zuck\",\"gender\":\"male\",\"locale\":\"en_US\"}", { 'access-control-allow-origin': '*',
        //                 'content-type': 'text/javascript; charset=UTF-8',
        //                 'content-length': '172' });

        //         FB.api('/4', function (result) {
        //             result.should.have.property('id', '4');
        //             done();
        //         });
        //     });
        // });

        // describe.skip("FB.api(4, cb)", function () {
        //     // this is the default behavior of client side js sdk
        //     it('should throw synchronously: Expression is of type number, not object', function (done) {
        //         // TODO
        //         FB.api(4, function (result) {
        //         });
        //     });
        // });

        // describe("FB.api('4', { fields: 'id' }), cb)", function () {
        //     it("should return { id: '4' } object", function (done) {
        //         nock('https://graph.facebook.com:443')
        //             .get('/4?fields=id')
        //             .reply(200, "{\"id\":\"4\"}", {
        //                 'content-type': 'text/javascript; charset=UTF-8',
        //                 'content-length': '10' });

        //         FB.api('4', { fields: 'id'}, function (result) {
        //             result.should.include({id: '4'});
        //             done();
        //         });
        //     });
        // });

        // describe("FB.api('4?fields=name', cb)", function () {
        //     it("should return { id: '4' } object", function (done) {
        //         nock('https://graph.facebook.com:443')
        //             .get('/4?fields=name')
        //             .reply(200, "{\"name\":\"Mark Zuckerberg\",\"id\":\"4\"}", {
        //                 'content-type': 'text/javascript; charset=UTF-8',
        //                 'content-length': '10' });

        //         FB.api('4?fields=name', function (result) {
        //             result.should.include({id: '4', name: 'Mark Zuckerberg'});
        //             done();
        //         });
        //     });
        // });

        // describe("FB.api('/4?fields=name', cb)", function () {
        //     it("should return { id: '4', name: 'Mark Zuckerberg' } object", function (done) {
        //         nock('https://graph.facebook.com:443')
        //             .get('/4?fields=name')
        //             .reply(200, "{\"name\":\"Mark Zuckerberg\",\"id\":\"4\"}", {
        //                 'content-type': 'text/javascript; charset=UTF-8',
        //                 'content-length': '10' });

        //         FB.api('4?fields=name', function (result) {
        //             result.should.include({id: '4', name: 'Mark Zuckerberg'});
        //             done();
        //         });
        //     });
        // });

        // describe.skip("FB.api('/4?fields=name', { fields: 'id,first_name' }, cb)", function () {
        //     it("should return { id: '4', name: 'Mark Zuckerberg' } object", function (done) {
        //         FB.api('4?fields=name', { fields: 'id,first_name' }, function (result) {
        //             result.should.include({id: '4', name: 'Mark Zuckerberg'});
        //             done();
        //         });
        //     });
        // });

    });

    describe("GET ALL PAGED: data more than 50", function() {

        it('query "data" should have 125 pieces of data', function (done) {
            FB.paged('data', function (result) {
                console.log("result", result);
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(50);
                result.paging.should.have.properties("cursors", "next");
                result.paging.cursors.should.have.properties("before", "after");
                // done();
            // });
            }, function(result) {
                console.log("result", result);
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(75);
                result.paging.should.have.property("cursors");
                result.paging.cursors.should.have.properties("before", "after");
                done();
            });
        });
    })
});
