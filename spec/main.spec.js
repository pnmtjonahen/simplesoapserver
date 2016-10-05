/*
 * Copyright (C) 2014 Philippe Tjon-A-Hen philippe@tjonahen.nl
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global expect */

var request = require("request");

require("../main");

var base_url = "http://localhost:8181/";

describe("simplesoapserver", function () {
   describe("GET / (no resource found at root)", function () {
      it("returns status code 404", function (done) {
         request.get(base_url, function (error, response, body) {
            expect(response.statusCode).toBe(404);
            done();
         });
      });
   });

   describe("GET /unknown.resource", function () {
      it("returns status code 404", function (done) {
         request.get(base_url + "unknown.resource", function (error, response, body) {
            expect(response.statusCode).toBe(404);
            done();
         });
      });
   });

   describe("/api/endpoint Errors", function () {
      it("returns status code 415", function (done) {
         request.get(base_url + "api/endpoint", function (error, response, body) {
            expect(response.statusCode).toBe(415);
            done();
         });
      });
      it("returns status code 405", function (done) {
         var options = {
            uri: base_url + "api/endpoint",
            method: 'GET',
            headers: { 'Content-Type': 'text/xml' }
         };
         request(options, function (error, response, body) {
            expect(response.statusCode).toBe(405);
            done();
         });
      });
      it("returns status code 500", function (done) {
         var options = {
            uri: base_url + "api/endpoint",
            method: 'POST',
            body:"<sample>sample</sample>",
            headers: { 'Content-Type': 'text/xml' }
         };
         request(options, function (error, response, body) {
            expect(response.statusCode).toBe(500);
            done();
         });
      });
   });
   describe("/api/data errors", function () {
      it("returns status code 415", function (done) {
         request.get(base_url + "api/data", function (error, response, body) {
            expect(response.statusCode).toBe(415);
            done();
         });
      });
      it("returns status code 405", function (done) {
         var options = {
            uri: base_url + "api/data",
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            json:true
         };
         request(options, function (error, response, body) {
            expect(response.statusCode).toBe(405);
            done();
         });
      });
      it("returns status code 400", function (done) {
         var options = {
            uri: base_url + "api/data",
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: "{}"
         };
         request(options, function (error, response, body) {
            expect(response.statusCode).toBe(400);
            done();
         });
      });
      it("returns status code 400", function (done) {
         var options = {
            uri: base_url + "api/data",
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: "{}"
         };
         request(options, function (error, response, body) {
            expect(response.statusCode).toBe(400);
            done();
         });
      });
   });
   describe("POST /api/data", function () {
      it("returns status code 202", function (done) {
         var options = {
            uri: base_url + "api/data",
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {'match':'power', 'data':'<sample/>'},
            json:true
         };
         request(options, function (error, response, body) {
            expect(response.statusCode).toBe(202);
            done();
         });
      });
   });
   describe("Simple SOAP server", function () {
      it("returns status code 202", function (done) {
         var options = {
            uri: base_url + "api/data",
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: {'match':'sample', 'data':'<sample/>'},
            json:true
         };
         request(options, function (error, response, body) {
            expect(response.statusCode).toBe(202);
            done();
         });
      });
      it("returns status code 200", function (done) {
         var options = {
            uri: base_url + "api/endpoint",
            method: 'POST',
            body:"<sample>sample</sample>",
            headers: { 'Content-Type': 'text/xml' }
         };
         request(options, function (error, response, body) {
            expect(response.statusCode).toBe(200);
            done();
         });
      });
      it("returns status code 500", function (done) {
         var options = {
            uri: base_url + "api/endpoint",
            method: 'POST',
            body:"<test>test</test>",
            headers: { 'Content-Type': 'text/xml' }
         };
         request(options, function (error, response, body) {
            expect(response.statusCode).toBe(500);
            done();
         });
      });
   });


});

