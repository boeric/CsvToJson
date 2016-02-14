// csvToJson.js
// the script creates a json file from a csv or tsv file
// auto detects row end character(s), auto detects column separator (comma or tab)
// author: Bo Ericsson, bo@boe.net, 2016, public domain
// uses code by Curran Kelleher (see attrib below)
'use strict';

// dependencies
var fs = require("fs");
var util = require("util");

// check arguments
if (process.argv.length < 4) {
  console.log("usage: node csvToJson input-csv-or-tsv-file output-json-file");
  console.log("example: node csvToJson input.txt output.json\n");
  return;
}

// get file names
var inputFile = process.argv[2];
var outputFile = process.argv[3];

// read the input file
var input;
try {
  input = fs.readFileSync(inputFile, 'utf8');
}
catch(e) {
  console.log("could not open input file " + inputFile);
  return;
}

// row delimiter
var rowDelim = /\r\n/.test(input) ? "\r\n" : /\r/.test(input) ? "\r" : "\n";
console.log("result", rowDelim.split(""));

// column delimiter
var delim = /\t/.test(input) ? "\t" : ",";
console.log(delim.split(""))

// set parse function
var parse = delim == "," ? csvParse : tsvParse;

// split the input into rows
var rows = input.split(rowDelim);

// extract column names from the first row
var props = parse(rows.shift());
//console.log("props", props)

// parse the body of the csv/tsv
var data = rows.map(parse);

// create output 
var output = [];
data.forEach(function(rowEntries) {
  var obj = {};
  props.forEach(function(prop, i) {
    obj[prop] = rowEntries[i];
  })
  output.push(obj);
})
var outStr = JSON.stringify(output, null, 1);

try {
  fs.writeFileSync(outputFile, outStr);
  console.log("\nGenerated " + outputFile);
}
catch(e) {
  console.log("Error: could not write output file, reason: ", e)
}

// parse a CSV row, accounting for commas inside quotes
// by Curran Kelleher, http://jsfiddle.net/3jLE2/2/ 
// http://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript?lq=1               
function csvParse(row){
  var insideQuote = false,                                             
      entries = [],                                                    
      entry = [];
  row.split('').forEach(function (character) {                         
    if(character === '"') {
      insideQuote = !insideQuote;                                      
    } else {
      if(character == "," && !insideQuote) {                           
        entries.push(entry.join(''));                                  
        entry = [];                                                    
      } else {
        entry.push(character);                                         
      }                                                                
    }                                                                  
  });
  entries.push(entry.join(''));                                        
  return entries;                                                      
}

// parse a tsv row, while removing double quotes that Excel sometimes throws in
function tsvParse(row) {
  var entries = row.split("\t");
  entries.forEach(function(d, i, a) { 
    a[i] = d.replace(/"/g, ""); 
  })
  return entries;
}
