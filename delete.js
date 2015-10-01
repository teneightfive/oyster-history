var request = require('request');
var colors = require('colors');

for (var i = 0; i < 300; i++) {
  request({
    method: 'DELETE',
    uri: 'http://localhost:3000/api/Journeys/' + i
  }, function(error, response) {
    if (!error && response.statusCode == 204) {
      console.log('Journey deleted'.green);
    }
  });
};
