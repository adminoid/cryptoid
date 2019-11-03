module.exports = {
  limitOrder: function (price, quantity, type, side) {
    const request = require('request');
    const crypto = require('crypto');

    const apiKey = "W2Z3rYqP95dtnmAQ6YAQKHIY";
    const apiSecret = "Bh7Z_SLNBVkvez8ZH-fRRnWVUeui8X9X4D8NqPPGJ7DC7Jyo";

    const verb = 'POST',
      path = '/api/v1/order',
      expires = Math.round(new Date().getTime() / 1000) + 60, // 1 min in the future
      data = {symbol:"XBTUSD",orderQty:quantity,price:price,ordType:type,side:side};

    // Pre-compute the postBody so we can be sure that we're using *exactly* the same body in the request
    // and in the signature. If you don't do this, you might get differently-sorted keys and blow the signature.
    const postBody = JSON.stringify(data);

    const signature = crypto.createHmac('sha256', apiSecret).update(verb + path + expires + postBody).digest('hex');

    const headers = {
      'content-type' : 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      // This example uses the 'expires' scheme. You can also use the 'nonce' scheme. See
      // https://www.bitmex.com/app/apiKeysUsage for more details.
      'api-expires': expires,
      'api-key': apiKey,
      'api-signature': signature
    };

    const requestOptions = {
      headers: headers,
      url:'https://www.bitmex.com'+path,
      method: verb,
      body: postBody
    };

    request(requestOptions, function(error, response, body) {
      if (error) { console.log(error); }
      console.log(body);
    });
  }
};
