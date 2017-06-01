const request = require('request');
const rp = require('request-promise-native');
const fs = require('fs');
const config = require('./config.json');


//check to see if initial start time has been added.
function checkinit() {
  let promise = new Promise((resolve, reject) => {
    fs.readFile('./config.json', 'utf-8', function(err,data) {
      if (!!err) {
        reject('error in loading config file.');
      }

      var data = JSON.parse(data);
      if (data.time == '') {
        data.time = JSON.stringify(Date.now());
        out = JSON.stringify(data, null, 2);
        fs.writeFile('./config.json', out, function(err) {
        if(err) {
          reject('error in writing to file: '+ err);
        }
        resolve('updated');
        });
      } else {
        resolve('');
      }

    });
  });
  return promise;
}

function getData(timestamp) {
  var options = {
    uri: 'https://api.typeform.com/v1/form/' + config.form,
    qs: {
      key: config.token,
      completed: true,
      //since: timestamp
    },
    json: true
  };

  rp(options)
      .then(function (parsedBody) {
          for(var i = 0; i < parsedBody.responses.length; ++i) {
            console.log(parsedBody.responses[i].answers);
          }
      })
      .catch(function (err) {
          console.log(err);
      });
}

checkinit().then((result) => {
  if (result == 'updated') {
    console.log('Initialisation complete. Please rerun when needed.');
    process.exit();
  }
  console.log('Config OK');
  lastTime = new Date(Number(config.time));
  console.log('Last run on '+lastTime);
});

timestamp = Date.now();
getData(config.time);
