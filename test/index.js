const SheetReader = require('../index')

// public: 1INGc-QFBfCS0raSZgprennLRvJ8YWJHCV4YmuEkYoP4

SheetReader({
  key: '1INGc-QFBfCS0raSZgprennLRvJ8YWJHCV4YmuEkYoP4'
}, function (err, spreadsheet) {
  if (err) {
    console.log(err)
    return
  }
  spreadsheet.worksheets[0].rows({limit: 5, excludeHeader: true
  }, function (err, sheet1rows) {
    if (err) {
      console.log(err)
      return
    }
    console.log('Sheet1:', sheet1rows)
    spreadsheet.worksheets[1].rows({}, function (err, sheet2rows) {
      if (err) {
        console.log(err)
        return
      }
      console.log('Sheet2:', sheet2rows)
    })
  })
})
