var SheetReader = require('../index');

SheetReader({
    key: '1INGc-QFBfCS0raSZgprennLRvJ8YWJHCV4YmuEkYoP4'
}, function(err, spreadsheet) {

    spreadsheet.worksheets[0].rows({limit:5, excludeHeader:true
    }, function(err, sheet1rows) {

        console.log('Sheet1:', sheet1rows);

        spreadsheet.worksheets[1].rows({}, function(err, sheet2rows) {
            console.log('Sheet2:', sheet2rows);
        });
    });

});
