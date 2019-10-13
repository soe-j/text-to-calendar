var JAPANESE_CHAR_REGEX = new RegExp(/^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]$/);
var DATETIME_ROW_REGEX = new RegExp(/^[①-⑳㉑-㊿].*$/);
var DATETIME_PART_REGEX = new RegExp(/^[①-⑳㉑-㊿](\d{1,2})月(\d{1,2})日\(.{1,3}\)(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);

function doGet (e) {
  var inputText = e.parameter.text;
  var rows = inputText.split('\n').map(function (row) {
    return row.replace(/ /g, '');
  }).filter(function (row) {
    return row;
  });

  var events = [];
  var eventName = '';
  rows.forEach(function (row, index) {
    debugger;

    if (DATETIME_ROW_REGEX.test(row)) {

      var datetimes = getDatetimes(row);
      if (!datetimes) return; // ex. ⑱削除

      var place = rows[index + 1];

      events.push({
        title: eventName + '/' + place,
        start: datetimes.start,
        end:   datetimes.end
      });
    } else {
      debugger;

      if (index - 1 >= 0) {
        if (DATETIME_ROW_REGEX.test(rows[index - 1])) return; // place
      }

      eventName = row.split('').filter(function (c) {
        return JAPANESE_CHAR_REGEX.test(c);
      }).join('');
    }
  });

  Logger.log(events);
}

function getDatetimes (row) {
  var match = row.match(DATETIME_PART_REGEX);
  if (!match) return;

  var now = Moment.moment();

  var year = now.year();
  var mon = padWithZero(match[1]);
  var day = padWithZero(match[2]);

  var startHour = padWithZero(match[3]);
  var startMin = padWithZero(match[4]);

  var endHour = padWithZero(match[5]);
  var endMin = padWithZero(match[6]);

  var start = Moment.moment([year, mon, day].join('-') + 'T' + [startHour, startMin].join(':'));
  var end   = Moment.moment([year, mon, day].join('-') + 'T' + [endHour, endMin].join(':'));

  if (start.isBefore(now)) {
    start.add(1, 'year');
    end.add(1, 'year');
  }

  return {
    start: start,
    end: end
  }
}

function padWithZero (numStr) {
  return ('0' + numStr).slice(-2);
}

// on NO GAS
if (typeof process !== 'undefined') {
  // adjust for GAS ver
  var Logger = {
    log: console.log
  };
  var Moment = {
    moment: require ('moment'),
  };

  exports.doGet = doGet;
}
