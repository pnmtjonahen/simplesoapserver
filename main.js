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
var http = require("http"),
     url = require("url"),
     path = require("path"),
     port = process.argv[2] || 8181;

var responseMessage = [];

function endsWith(str, suffix) {
   return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
;
function unsupportedMediaType(response) {
   sendHtppResponse(response, 415, "415 Unsupported Media Type\n");
}
;
function methodNotAllowed(response) {
   sendHtppResponse(response, 405, "405: Methode not allowed\n");
}
;
function sendHtppResponse(response, code, message) {
   response.writeHead(code, {"Content-Type": "text/plain"});
   response.write(message);
   response.end();
}

function processSoap(request, response) {
   if (request.method === 'POST') {
      var body = '';

      request.on('data', function (data) {
         body += data;
         if (body.length > 1e6) {
            request.connection.destroy();
         }
      });

      request.on('end', function () {
         for (i = 0; i < responseMessage.length; i++) {
            if (responseMessage[i].match.test(body)) {
               response.writeHead(200, {"Content-Type": "text/xml"});
               response.write(responseMessage[i].data);
               response.end();
               return;
            }
         }
         response.writeHead(500, {"Content-Type": "text/xml"});
         response.write("<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Body><S:Fault xmlns:ns4=\"http://www.w3.org/2003/05/soap-envelope\"><faultcode>S:Client</faultcode><faultstring>Cannot Consume Message</faultstring></S:Fault></S:Body></S:Envelope>");
         response.end();
      });
   } else {
      methodNotAllowed(response);
   }
}
;

function processResponseMessage(request, response) {
   var body = '';
   request.on('data', function (data) {
      body += data;
      if (body.length > 1e6) {
         request.connection.destroy();
      }
   });

   request.on('end', function () {
      newMessageResponse = JSON.parse(body);
      if (newMessageResponse.match !== undefined) {
         newMessageResponse.match = new RegExp(newMessageResponse.match, "m");
         responseMessage.push(newMessageResponse);
         sendHtppResponse(response, 202, "202: accepted\n");
      } else {
         sendHtppResponse(response, 400, "400 Bad Request\n");
      }
   });
};

function processSetResponseMessage(request, response) {
   if (request.method === 'POST') {
      processResponseMessage(request, response);
   } else if (request.method === 'PUT') {
      responseMessage = [];
      processResponseMessage(request, response);
   } else {
      methodNotAllowed(response);
   }
};

http.createServer(function (request, response) {
   var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), decodeURI(uri));
   var headers = request.headers;
   if (endsWith(filename, 'api/endpoint')) {
      if (headers['Content-Type'] === 'text/xml' || headers['content-type'] === 'text/xml') {
         processSoap(request, response);
      } else {
         unsupportedMediaType(response);
      }
   } else if (endsWith(filename, 'api/data')) {
      if (headers['Content-Type'] === 'application/json' || headers['content-type'] === 'application/json') {
         processSetResponseMessage(request, response);
      } else {
         unsupportedMediaType(response);
      }
   } else {
      sendHtppResponse(response, 404, "404 Not Found\n");
   }
}).listen(parseInt(port, 10));

console.log("SOAP Stub endpoint running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");