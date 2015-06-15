var nock        = require('nock'),
    should      = require('should'),
    FB          = require('../..');

describe('Get data more than 50', function () {

    beforeEach(function (done) {

        var fakeData = [];
        var DATA_NUMBER = 125;

        for(var i = 0; i < DATA_NUMBER; i++) {
            fakeData.push(Math.floor((Math.random() * 10) + 1));
        }

        nock('https://graph.facebook.com:443')
        .get('/data')
        .reply(200, function(uri, requestBody) {
            var response = {
                data: fakeData.slice(0,50),
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

        // .filteringPath(/after=[\d]+/g, 'after=XXX')
        .get('/data?after=50')
        .reply(200, function(uri, requestBody) {
            var number = parseInt(uri.replace("/data?after=", ""));
            var data, after, next;

            if(DATA_NUMBER - number > 50) {
                data = fakeData.slice(number, number + 50);
                after = number + 50;
                next = "https://graph.facebook.com:443/data?after=" + after;
            } else {
                data = fakeData.slice(number);
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
        })

        .get('/data?after=100')
        .reply(200, function(uri, requestBody) {
            var number = parseInt(uri.replace("/data?after=", ""));
            var data, after, next;

            if(DATA_NUMBER - number > 50) {
                data = fakeData.slice(number, number + 50);
                after = number + 50;
                next = "https://graph.facebook.com:443/data?after=" + after;
            } else {
                data = fakeData.slice(number);
                after = DATA_NUMBER;
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

    afterEach(function(done) {
        nock.cleanAll();
        done();
        return;
    });

    describe("GET ALL PAGED: data more than 50", function() {

        it('query "data" should have 125 pieces of data', function (done) {
            FB.paged('data', function (result) {
                console.log("spec", "first callback result", result);
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(50);
                result.paging.should.have.properties("cursors", "next");
                result.paging.cursors.should.have.properties("before", "after");
            }, function(result) {
                console.log("spec", "second callback result", result);
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
