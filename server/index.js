const http = require('http');
const processor = require('./processor.js');

http.createServer(function (req, res) {

  res.writeHead(200, {'Content-Type': 'text/html'}); // http header

  const url = req.url;

  if(url ==='/buy-one-dollar') {

    processor.limitOrder(3000, 1, 'Limit', 'Buy');
    processor.limitOrder(12000, 1, 'Limit', 'Sell');

    res.end();

  }else{
    res.write('<h1>Access denied<h1>');
    res.end();
  }

}).listen(3000, function(){
  console.log("server start at port 3000");
});
