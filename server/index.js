// https://nodejs.org/es/docs/guides/anatomy-of-an-http-transaction/
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
        // console.log('Partial body: ' + body);
      });

      request.on('end', function() {
        let parsed = JSON.parse(body);

        if (parsed.side === 'Buy') {

          let profitPrice = parsed.price + parsed.profit;
          let lostPrice = parsed.price - parsed.risk;

          // let profitPrice = 9400;
          // let lostPrice = 9200;

          // console.log(profitPrice, lostPrice);

          // processor.limitOrder(profitPrice, parsed.qty, 'StopLimit', 'Sell', profitPrice);
          processor.limitOrder(parsed.price, parsed.qty, 'Market', 'Buy');
          // processor.limitOrder(lostPrice, parsed.qty, 'StopLimit', 'Sell', lostPrice);

        } else {

          let profitPrice = parsed.price - parsed.profit;
          let lostPrice = parsed.price + parsed.risk;

          // let profitPrice = 9200;
          // let lostPrice = 9400;

          // processor.limitOrder(profitPrice, parsed.qty, 'StopLimit', 'Buy', profitPrice);
          processor.limitOrder(parsed.price, parsed.qty, 'Market', 'Sell');
          // processor.limitOrder(lostPrice, parsed.qty, 'StopLimit', 'Buy', lostPrice);

        }

        response.end('post received')
      })
    }

    response.end('successfully');

  } else {
    response.write('<h1>Access denied<h1>');
    response.end();
  }

}).listen(3000, function(){
  console.log("server start at port 3000");
});
