const request = require('request');
const rp = require('request-promise-native');
const fs = require('fs');
const config = require('./config.json');

const timestamp = Date.now()/1000;
//check to see if initial start time has been added.
function checkinit() {
  let promise = new Promise((resolve, reject) => {
    fs.readFile('./config.json', 'utf-8', function(err,data) {
      if (!!err) {
        reject(Error(err));
      }

      var data = JSON.parse(data);
      if (data.time == '') {
        data.time = JSON.stringify(timestamp);
        out = JSON.stringify(data, null, 2);
        fs.writeFile('./config.json', out, function(err) {
        if(err) {
          reject(Error(err));
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
  let promise = new Promise((resolve, reject) => {
    var options = {
      uri: 'https://api.typeform.com/v1/form/' + config.form,
      qs: {
        key: config.token,
        completed: true,
        since: timestamp
      },
      json: true
    };

    rp(options).then(function (parsedBody) {
      if (parsedBody.responses.length > 0) {
        console.log('New responses found!');
        if (parsedBody.http_status == "200") {
          sortLists(parsedBody.responses).then((result) => {
            resolve('');
          });
        }
      }
    }).catch(function (err) {
      reject(err);
    });
  });
  return promise;
}

function sortLists(data) {
  let promise = new Promise((resolve, reject) => {
    let android = [];
    let ios = [];
    //sort emails into correct arrays
    for (i = 0; i < data.length; ++i) {
      if (data[i].answers.hasOwnProperty(config.fields.android_email)) {
        android.push(data[i].answers[config.fields.android_email]);
      }
      if (data[i].answers.hasOwnProperty(config.fields.ios_email)) {
        let line = [data[i].answers[config.fields.username], "", data[i].answers[config.fields.ios_email]];
        ios.push(line);
      }
    }

    //create files
    if (android.length > 0) {updateAndroid(android);}
    if (ios.length > 0) {updateiOS(ios);}
    resolve('');
  });
  return promise;
}

function updateAndroid(data) {
  var writer = fs.createWriteStream('./lists/android/Android Alpha List '+timestamp+'.txt',  {
    flags: 'wx'
  }).on('open', function() {
    for (i =0; i < data.length; ++i) {
      writer.write(data[i] + ', ');
    }
  }).on('end', function() {
    writer.end();
  });
}

function updateiOS(data) {
  var writer = fs.createWriteStream('./lists/ios/iOS Testflight List '+timestamp+'.csv',  {
    flags: 'wx'
  }).on('open', function() {
    for (i =0; i < data.length; ++i) {
      writer.write(data[i] + '\n');
    }
  }).on('end', function() {
    writer.end();
  });
}

checkinit().then((result) => {
  if (result == 'updated') {
    console.log('Initialisation complete. Please rerun when needed.');
    process.exit();
  }
  console.log('Config OK');
  let lastTime = new Date(Number(config.time)*1000);
  console.log('Last run on '+lastTime);
});

getData(config.time).then((result) => {
  if (result == '') {
    fs.readFile('./config.json', 'utf-8', function(err,data) {
      if (!!err) {
        console.log("could not open config file");
      }
      var file = JSON.parse(data);
      file.time = JSON.stringify(timestamp);
      out = JSON.stringify(file, null, 2);
      fs.writeFile('./config.json', out, function(err) {
        if(!!err) {
          console.log("could not update timestamp;")
        }
      });
    });
  }
});
