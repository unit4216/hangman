//init dependencies
var express = require('express');
var app = express();
var fs = require('fs');
var csv = require('csv-parse'); 

//declare static folder
app.use(express.static('static')); 

//assign html from index.html to variable
var index = fs.readFileSync('index.html');

//import CSV and convert to JSON
word_db=[]
fs.readFile('words.csv', function (err, fileData) {
    csv.parse(fileData, {columns: true, trim: true}, function(err, rows) {
        word_db.push(rows); //push csv data to word_db array
    })
})

/////////////////
//// ROUTING ////
/////////////////

app.listen(4000, () => {
    console.log('Server running on port 4000');
});

app.get('/', (req, res, next) => {
    res.end(index); //must use .end to send HTML without downloading it
});

app.get('/getWord', (request, response) => {
    wordDbLen=word_db[0].length; //gets length of word_db
    randomIndex=Math.floor(Math.random()*wordDbLen); //gets randomized index of word in db
    response.send(word_db[0][randomIndex]); //send random word as response
});