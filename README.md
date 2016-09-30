# simplesoapserver

A very simple SOAP (Stub) server.

First post a json `response` to the server, and then call the SOAP endpoint to get te response.

### Response setup
#### POST json response data to api/data
```json
{
  match:'sample',
  data :'<sampleResponse>OK</sampleResponse>'
}
```
Where match is a regexp to match a request for wich the data is send as a response.

Multiple POST calls allow for different responses. To start all over call the api/data with a PUT method


### Calling the SOAP endpoint
#### POST SOAP message (or any XML) to api/endpoint
```XML
<sample>sample</sample>
```
When the request is matched by the match of the test data the data is returned.
