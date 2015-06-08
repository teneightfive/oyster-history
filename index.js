var Oyster = require('oyster');
var request = require('request');
var $ = require('cheerio');
var tabletojson = require('./tabletojson');

Oyster.Oyster.prototype.history = function(callback) {
  var oyster = this;

  oyster.request({
    uri: 'https://oyster.tfl.gov.uk/oyster/journeyDetailsPrint.do',
    jar: oyster.jar
  }, function (err, res, body) {
    if (err) {
      return callback(err);
    }

    var journeyMatch = body.match(/Journey Statement/);

    if (journeyMatch) {
      toTable($('table.journeyhistory', body), callback);
    } else {
      return callback(new Error('Unknown Response: TFL have probably changed their website again'))
    }
  });
};

function toTable(html, callback) {
  if (/No pay as you go/.test(html)) {
    callback(null, []);
    return false;
  }

  var before = tabletojson.convert('<table>' + html.html() + '</table>')[0];
  var after = [];
  var currentDate;
  for (var i in before) {
    var trip = before[i];
    if (/daily/.test(trip['Journey / Action'])) {
      currentDate = trip['Date / Time'];
    }
    else {
      var formattedTrip = {};
      formattedTrip.date = currentDate + ' ' + trip['Date / Time'];
      formattedTrip.balance = trip.Balance;
      formattedTrip.charge = trip.Charge;
      formattedTrip.journey = trip['Journey / Action'];

      after.push(formattedTrip);
    }
  }

  callback(null, after);
}

module.exports = function(username, password, callback) {
  var oyster = Oyster(username, password, function(err) {
    if(err) throw err;

    oyster.history(callback);
  });
};
