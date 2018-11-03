require('dotenv').config({path: __dirname + '/../.env'})
const cheerio = require('cheerio');
var fs = require('fs');
var path = require( 'path' );
var mysql = require('mysql');
var dataDir = "./data";

//object that will be used for inserting to data table
const arrayData = [];
//function to read through dir, get score, and add to database
//fs.readdir reads the contents of a directory and returns an array of file names
fs.readdir( dataDir, function( err, files ) {
  if( err ) {
    console.error( "Could not list the directory.", err );
    process.exit( 1 );
  }


  files.forEach( function( file, index ) {
    // Make one pass and make the file complete
    var fromPath = path.join( dataDir, file );


    var fileNameSplit = file.split(".");
    //get the file name without the .html file ending
    var fileName = fileNameSplit[0];

    function getCurrentDate () {
      currentDate = new Date();
      year = "" + currentDate.getFullYear();
      month = "" + (currentDate.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
      day = "" + currentDate.getDate(); if (day.length == 1) { day = "0" + day; }
      hour = "" + currentDate.getHours(); if (hour.length == 1) { hour = "0" + hour; }
      minute = "" + currentDate.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
      second = "" + currentDate.getSeconds(); if (second.length == 1) { second = "0" + second; }
      return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    };


    //put each path into cheerio and find final score for it
    //the load function needs only the html within the files
    //the readFile will go through and get all the data(html code) and then injects that into load
    //reads the file and returns the contents
    const $ = cheerio.load(fs.readFileSync(fromPath));

    //record the name and score and date into variable to be used for sql query
    var dataEntry = [fileName, getFinalScore($), getCurrentDate()];
    //enter the data entry into the array
    arrayData.push(dataEntry);
  } );
  console.log(arrayData);

  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "scoringProject"
  });
  //insert all of the scores for data dir to the database
  //values clause is just looking for the values instead of the nam=val pairs
  //used a bulk insert (array)
  var sql = "INSERT INTO data (name, score, date) VALUES ?";
  con.query(sql, [arrayData], function(err) {
      if (err) throw err;
      con.end();
  });

  //this will allow the user to choose which methods or information they want to view
  var prompt = require('prompt');
  prompt.start();

  let question = {
    properties: {
      answer: {
        message: '\nPlease enter in a 1 if you want: Retrieve scores for a file name '
          +  '\n'
          +  'Please enter in a 2 if you want: Retrieve all scores run in the system for a custom data range'
          +  '\n'
          +  'Please enter in a 3 if you want: Retrieve highest scored file name'
          +  '\n'
          +  'Please enter in a 4 if you want: Retrieve lowest scored file name'
          +  '\n'
          +  'Please enter in a 5 if you want: Retrieve average scores'
          +  '\n'
          +  'Please enter in a 6 if you want: None of the listed options'
      }
    }
  };

  //prompts to allow for user interaction
  prompt.get(question, function (err, result) {
    if(result.answer == 1) {
      question = {
        properties: {
          fileName: {
            message: 'Enter in the file name to retrieve their scores'
          }
        }
      }
      prompt.get(question, function (err, result) {
        getfileNameScores(result.fileName);

      });
    } else if(result.answer == 2) {
      question = {
        properties: {
          beginDate: {
            message: 'Enter begin date in form of YYYY-MM-DD HH:MM:SS '
          },
          endDate: {
            message: 'Enter end date in form of YYYY-MM-DD HH:MM:SS'
          }
        }
      }
      prompt.get(question, function (err, result) {
        getScoresDataRange(result.beginDate, result.endDate);

      });
    } else if(result.answer == 3) {
      getHighestScoredfileName();
    } else if(result.answer == 4) {
      getLowestScoredfileName();
    } else if(result.answer == 5) {
      findAverageScore();
    } else {
      console.log('Run npm start to run the program again!')
    }
  });

} );

//function to get the final score for data directory files
function getFinalScore($) {
  let finalScore=0;
  $('div').each(function (index, element) {
    finalScore+=3;
  });
  $('p').each(function (index, element) {
    finalScore+=1;
  });
  $('h1').each(function (index, element) {
    finalScore+=3;
  });
  $('h2').each(function (index, element) {
    finalScore+=2;
  });
  $('html').each(function (index, element) {
    finalScore+=5;
  });
  $('body').each(function (index, element) {
    finalScore+=5;
  });
  $('header').each(function (index, element) {
    finalScore+=10;
  });
  $('footer').each(function (index, element) {
    finalScore+=10;
  });
  $('font').each(function (index, element) {
    finalScore-=1;
  });
  $('center').each(function (index, element) {
    finalScore-=2;
  });
  $('big').each(function (index, element) {
    finalScore-=2;
  });
  $('strike').each(function (index, element) {
    finalScore-=1;
  });
  $('tt').each(function (index, element) {
    finalScore-=1;
  });
  $('frameset').each(function (index, element) {
    finalScore-=5;
  });
  $('frame').each(function (index, element) {
    finalScore-=5;
  });
  return finalScore;
};



//method to retrieve scores for a specific file name
function getfileNameScores(fileName) {
  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "scoringProject"
  });

  con.connect(function(err) {
    if (err) throw err;
    //use myself.format to allow for insertion points
    var sql = mysql.format("SELECT score FROM data WHERE name=?", [fileName]);
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      console.log("The list of scores for ", fileName, " are: ");
      result.forEach(function (obj, index) {
        console.log(obj.score);
      } );

      con.end();
    });
  });
};

//method to retrieve all scores run in the system for a custom data range
function getScoresDataRange(beginDate, endDate) {
  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "scoringProject"
  });

  con.connect(function(err) {
    if (err) throw err;
    //use myself.format to allow for insertion points
    var sql = mysql.format("SELECT * FROM data WHERE date(date) between date(?) and date(?) ORDER BY date", [beginDate, endDate]);


    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      console.log("\n Data for ", beginDate, " to ", endDate, " : \n");
      let i = 0
      result.forEach(function(obj) {
        console.log(JSON.stringify(obj), "\n");
      });


      con.end();
    });
  });
};

//method to retrieve highest scored file name
function getHighestScoredfileName() {
  console.log('The highest scored file name is: ');
  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "scoringProject"
  });



  con.connect(function(err) {
    if (err) throw err;
    var sql= "SELECT fileName, MAX(Score) FROM (SELECT name AS fileName, SUM(score) AS Score FROM data GROUP BY fileName) AS table2 GROUP BY fileName ORDER BY Score DESC LIMIT 1";
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      console.log(JSON.stringify(result[0]));
      con.end();
    });
  });
};

//method to retrieve lowest scored file name
function getLowestScoredfileName() {
  console.log('The lowest scored file name is: ');

  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "scoringProject"
  });



con.connect(function(err) {
  if (err) throw err;
  var sql= "SELECT fileName, MIN(Score) FROM (SELECT name AS fileName, SUM(score) AS Score FROM data GROUP BY fileName) AS table2 GROUP BY fileName ORDER BY Score ASC LIMIT 1";
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(JSON.stringify(result[0]));
    con.end();
  });
});
};

//query to find average score across each key
function findAverageScore() {
  console.log('The average scores are:');

  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "scoringProject"
  });

  con.connect(function(err) {
    if (err) throw err;
    var sql = "SELECT name, AVG(score) FROM data GROUP BY name";
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      console.log("Average Scores: \n", result);
      con.end();
    });
  });
};
