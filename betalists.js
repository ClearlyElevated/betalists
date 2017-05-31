const request = require('request');

const config = require('./config.json');

const BASE_URL = "https://api.typeform.com/v1/form/" + config.form + "?key=" + config.token;

console.log(BASE_URL);

var response;
request(BASE_URL, function (error, response, body) {
  if (response.statusCode == '200') {
    console.log('data recieved');
    //console.log(body);
    var t = JSON.parse(body);
    console.log(t);
  }
});
