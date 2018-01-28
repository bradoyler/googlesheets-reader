## Deprecation Notice: this uses v3 of the google spreadsheets API  
New development @ https://github.com/bradoyler/googlesheet-to-json

# googlesheets-reader

Node.js library to read rows from a Google Spreadsheet and convert to JSON documents.

ie.
```js
[
 { Section:'Sports', Date:'8/6/2015'},
 { Section:'Business', Date:''}
]

```

### This is a early work in-progress.

## Install
```
npm install googlesheets-reader --save
```

## Example

see 'test' folder

 or run:
 ```
 $ node test
 ```

## Todos:
- Add Mocha tests
- Support for paging through large sheets
- Support for accessing private sheets
