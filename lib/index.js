const request = require('request')
const querystring = require('querystring')
const FEED_URL = 'https://spreadsheets.google.com/feeds/'

let Spreadsheets

const getFeed = function (params, query, cb) {
  var requestOptions = {
    followRedirect: false
  }

  query = query || {}
  query.v = '3.0'
  query.alt = 'json'

  params.push('public', 'values')
  requestOptions.url = FEED_URL + params.join('/')
  requestOptions.url += '?' + querystring.stringify(query)

  const requestCallback = function (err, response) {
    if (err) {
      if (err.message.indexOf('CORS request rejected') === 0) {
        return cb(new Error('No access to that spreadsheet, check your auth.'))
      }
      return cb(err)
    }
    if (!response) {
      cb(new Error('Missing response.'))
      return
    }

    if (response.statusCode >= 400) {
      return cb(new Error('HTTP error ' + response.statusCode))
    }
    let json
    try {
      json = JSON.parse(response.body)
    } catch (ex) {
      console.log('JSON.parse()', response.statusCode, ex)
      return
    }
    cb(null, json.feed)
  }

    // GData-Version: 3.0
  request.get(requestOptions, requestCallback)
}

const Worksheet = function (spreadsheet, data) {
    // based on Google's URL scheme...
  var id = data.id.$t
  this.id = id.substring(id.lastIndexOf('/') + 1)
  this.spreadsheet = spreadsheet
  this.rowCount = data.gs$rowCount.$t
  this.colCount = data.gs$colCount.$t
  this.title = data.title.$t
}

function prepareOptions (worksheet, options) {
  options = options || {}
  options.key = worksheet.spreadsheet.key
  options.worksheet = worksheet.id
  return options
}

Worksheet.prototype.cells = function (options, cb) {
  Spreadsheets.cells(prepareOptions(this, options), cb)
}

Worksheet.prototype.rows = function (options, cb) {
  Spreadsheets.rows(prepareOptions(this, options), cb)
}

var toArray = function (val) {
  if (Array.isArray(val)) {
    return val
  }
  return [val]
}

var Spreadsheet = function (key, data) {
  this.key = key
  this.title = data.title.$t
  this.updated = data.updated.$t
  this.author = {
    name: data.author[0].name.$t,
    email: data.author[0].email.$t
  }

  this.worksheets = []
  var worksheets = toArray(data.entry)

  worksheets.forEach(function (worksheetData) {
    this.worksheets.push(new Worksheet(this, worksheetData))
  }, this)
}

var Cells = function (data) {
  this.cells = {}

  var entries = toArray(data.entry)
  var cell, row, col
  entries.forEach(function (entry) {
    cell = entry.gs$cell
    row = cell.row
    col = cell.col

    if (!this.cells[row]) {
      this.cells[row] = {}
    }

    this.cells[row][col] = {
      row: row,
      col: col,
      value: cell.$t || ''
    }
  }, this)
}

Spreadsheets = module.exports = function (options, cb) {
  if (!options) {
    throw new Error('Invalid arguments.')
  }
  if (!options.key) {
    throw new Error('Spreadsheet key not provided.')
  }

  getFeed(['worksheets', options.key], null, function (err, data) {
    if (err) {
      return cb(err)
    }

    var spreadSheet = null
    try {
      spreadSheet = new Spreadsheet(options.key, data)
    } catch (ex) {
      cb(ex, null)
      return
    }
    cb(null, spreadSheet)
  })
}

Spreadsheets.cells = function (options, cb) {
  var query = {}
  var rowOffset = 0
  if (options.excludeHeader) {
    rowOffset = 1
  }
  if (options.limit && options.limit > 0) {
    query['max-row'] = options.limit + rowOffset
  }
    // if (options.offset) {
    //    query["min-row"] = options.offset; // not working as expected
    // }
  if (!options) {
    throw new Error('Invalid arguments.')
  }
  if (!options.key) {
    throw new Error('Spreadsheet key not provided.')
  }
  if (!options.worksheet) {
    throw new Error('Worksheet not specified.')
  }

  getFeed(['cells', options.key, options.worksheet], query, function (err, data) {
    if (err) {
      return cb(err)
    }

    if (typeof data.entry !== 'undefined' && data.entry !== null) {
      return cb(null, new Cells(data))
    } else {
      return cb(null, { cells: {} })
    }
  })
}

Spreadsheets.rows = function (options, callback) {
  Spreadsheets.cells(options, function (err, result) {
    if (err) {
      return callback(err)
    }
    var cells = result.cells
    var columns = []
    var data = []

    for (var column in cells[1]) {
      columns.push(cells[1][column])
    }

    for (var row in cells) {
      var startRow = 0
      if (options.excludeHeader) {
        startRow = 1
      }
      if (row > startRow) {
        var rowData = {}
        for (var i = 0; i < columns.length; i++) {
          var cellValue = ''
          var columnKey = columns[i].value
          if (cells[row][i + 1]) {
            cellValue = cells[row][i + 1].value
          }
          rowData[columnKey] = cellValue
        }
        data.push(rowData)
      }
    }
    return callback(null, data)
  })
}
