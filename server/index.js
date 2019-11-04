const http = require('http');
const processor = require('./processor.js');

http.createServer(function (request, response) {

  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');

  const url = request.url;

  if (url === '/make-order') {

    if (request.method === 'POST') {
      console.log('POST');
      let body = '';
      request.on('data', function(data) {
        body += data;
        console.log('Partial body: ' + body);
      });

      request.on('end', function() {
        console.log('Body: ' + body);
        response.end('post received')
      })
    }

    response.end();
  }
  else if (url ==='/buy-one-dollar') {

    processor.limitOrder(3000, 1, 'Limit', 'Buy');
    processor.limitOrder(12000, 1, 'Limit', 'Sell');

    response.end();

  } else {
    response.write('<h1>Access denied<h1>');
    response.end();
  }

}).listen(3000, function(){
  console.log("server start at port 3000");
});
