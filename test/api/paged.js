var nock        = require('nock'),
    should      = require('should'),
    FB          = require('../..');

describe('Get by paged, ', function () {

    afterEach(function(done) {
        nock.cleanAll();
        done();
        return;
    });

    describe("data less than 50 (=> 25).", function(done) {

        before(function (done) {

            var fakeData = [];
            var DATA_NUMBER = 25;

            for(var i = 0; i < DATA_NUMBER; i++) {
                fakeData.push(Math.floor((Math.random() * 10) + 1));
            }

            nock('https://graph.facebook.com:443')
            .get('/data')
            .reply(200, function(uri, requestBody) {
                var response = {
                    data: fakeData,
                    paging: {
                        cursors: {
                            before: "0",
                            after: "25"
                        }
                    }
                };
                return response;
            });

            done();
            return;
        });

        it('query "data" should have 25 + null pieces of data', function (done) {
            FB.paged('data', function (result) {
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(25);
                result.paging.cursors.should.have.properties("before", "after");
            }, function(result) {
                (result === null).should.be.true;
                done();
                return;
            });
        });
    });

    describe("data more than 50 (=> 125).", function(done) {

        before(function (done) {

            var fakeData = [];
            var DATA_NUMBER = 125;

            for(var i = 0; i < DATA_NUMBER; i++) {
                fakeData.push(Math.floor((Math.random() * 10) + 1));
            }

            nock('https://graph.facebook.com:443')
            .get('/data')
            .reply(200, function(uri, requestBody) {

                var response = {
                    data: fakeData.slice(0, 50),
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

            .get('/data?after=50')
            .reply(200, function(uri, requestBody) {

                var response = {
                    data: fakeData.slice(50, 100),
                    paging: {
                        cursors: {
                            before: "50",
                            after: "100"
                        },
                        next: "https://graph.facebook.com:443/data?after=100"
                    }
                };

                return response;
            })

            .get('/data?after=100')
            .reply(200, function(uri, requestBody) {

                var response = {
                    data: fakeData.slice(100),
                    paging: {
                        cursors: {
                            before: "100",
                            after: "125"
                        }
                    }
                };

                return response;
            });

            done();
            return;
        });

        it('query "data" should have 50 + 75 pieces of data', function (done) {
            FB.paged('data', function (result) {
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(50);
                result.paging.should.have.properties("cursors", "next");
                result.paging.cursors.should.have.properties("before", "after");
            }, function(result) {
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(75);
                result.paging.should.have.property("cursors");
                result.paging.cursors.should.have.properties("before", "after");
                done();
                return;
            });
        });
    });

    describe("data more than 50 (=> 75) without last callback.", function(done) {

        before(function (done) {

            var fakeData = [];
            var DATA_NUMBER = 75;

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

            .get('/data?after=50')
            .reply(200, function(uri, requestBody) {

                var response = {
                    data: fakeData.slice(50),
                    paging: {
                        cursors: {
                            before: "50",
                            after: DATA_NUMBER
                        }
                    }
                };

                return response;
            });

            done();
            return;
        });

        it('query "data" should have 50 + 75 pieces of data', function (done) {
            FB.paged('data', function (result) {
                result.should.be.Object;
                result.should.have.properties("data", "paging");
                result.data.length.should.equal(50);
                result.paging.should.have.properties("cursors", "next");
                result.paging.cursors.should.have.properties("before", "after");
                done();
                return;
            });
        });
    });

    describe("response with error", function(done) {
        before(function (done) {

            nock('https://graph.facebook.com:443')
            .get('/data')
            .reply(200, function(uri, requestBody) {
                var response = {
                    error: {
                        message: 'Unsupported get request. Please read the Graph API documentation at https://developers.facebook.com/docs/graph-api',
                        type: 'GraphMethodException',
                        code: 100
                    }
                };
                return response;
            });

            done();
            return;
        });

        it('query "data" should have error', function (done) {
            FB.paged('data', function (result) {
                result.should.be.Object;
                result.should.have.property("error");
                result.error.should.have.properties("message", "type", "code");
            }, function(result) {
                (result === null).should.be.true;
                done();
                return;
            });
        });
    });
});
