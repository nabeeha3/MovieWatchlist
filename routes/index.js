const url = require('url')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose() //verbose provides more detailed stack trace
const db = new sqlite3.Database('data/db_1200iRealSongs')

//notice navigation to parent directory:
const headerFilePath = __dirname + '/../views/header.pug'
const footerFilePath = __dirname + '/../views/footer.pug'
const watchPugPath = __dirname + '/../views/watchlist.pug'

const moviesNameLink = 'http://localhost:3000/moviesName';
const movieIdLink = 'http://localhost:3000/movieID';
const watchlistLink = 'http://localhost:3000/watchlist';
const usersLink = 'http://localhost:3000/users';
const registerLink = 'http://localhost:3000/register';
const indexLink = 'http://localhost:3000/index.html';



const pug = require('pug');
const path = require('path');

const watchlistTemplatePath = path.join(watchPugPath);


exports.authenticate = function(request, response, next) {
  /*
	Middleware to do BASIC http 401 authentication
	*/
  let auth = request.headers.authorization

  // auth is a base64 representation of (username:password)
  //so we will need to decode the base64
  if (!auth) {
    //note here the setHeader must be before the writeHead
    response.setHeader('WWW-Authenticate', 'Basic realm="need to login"')
    response.writeHead(401, {
      'Content-Type': 'text/html'
    })
    console.log('No authorization found, send 401.')
    response.end();
  } else {
    console.log("Authorization Header: " + auth)
    //decode authorization header
    // Split on a space, the original auth
    //looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
    var tmp = auth.split(' ')

    // create a buffer and tell it the data coming in is base64
    var buf = Buffer.from(tmp[1], 'base64');

    // read it back out as a string
    //should look like 'ldnel:secret'
    var plain_auth = buf.toString()
    console.log("Decoded Authorization ", plain_auth)

    //extract the userid and password as separate strings
    var credentials = plain_auth.split(':') // split on a ':'
    var username = credentials[0]
    var password = credentials[1]
    console.log("User: ", username)
    console.log("Password: ", password)

    var authorized = false
    var userRole;

    //check database users table for user
    db.all("SELECT userid, password, role FROM users", function(err, rows) {
      console.log("Rows from the database:", rows); 
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].userid == username & rows[i].password == password){
          authorized = true
          userRole = rows[i].role;
          console.log("ID: ", userRole)
        } 
      } 
      if (authorized == false) {
        //get user to create account
        response.setHeader('Content-Type', 'text/html');
        response.write("You do not have an account, please create one:");
        response.write(`<p><a href="${registerLink}">Register</a></p>`);
        
        response.end()
      } else {
        request.user_role = userRole;
        next();
      }
    })
  }
  //notice no call to next()
}

function handleError(response, err) {
  //report file reading error to console and client
  console.log('ERROR: ' + JSON.stringify(err))
  //respond with not found 404 to client
  response.writeHead(404)
  response.end(JSON.stringify(err))
}

function send_users(request, response, rows, authentication) {
  //INSERT DATA
  if (authentication == 1){
    for (let row of rows) {
      console.log(row)
      response.write(`
      <div style="display: flex; justify-content: space-between;">
      <p style="text-align: left;">user: ${row.userid}</p>
      <p style="text-align: right;">password: ${row.password}</p>
      </div>
      `);
  }
  }
  else {
    response.write(`You are not authorized to see other users`)
  }
  response.end()

}

//main page, have links to other pages
exports.index = function(request, response) {

  fs.readFile(headerFilePath, 'utf-8', function(err, headerData) {
    if (err) {
      handleError(response, err);
      return;
    }

    const compiledHeader = pug.compile(headerData);
    const headerHTML = compiledHeader();

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(headerHTML);

    //INSERT DATA - add hyperlinks to change tab
    response.write(`<p><a href="${moviesNameLink}">Search Movies By Name</a></p>`);
    response.write(`<p><a href="${movieIdLink}">Add Movies to Watchlist with ID's</a></p>`);
    response.write(`<p><a href="${watchlistLink}">Go to Watchlist</a></p>`);
    response.write(`<p><a href="${usersLink}">See Other Friends</a></p>`);


    fs.readFile(footerFilePath, 'utf-8', function(err, footerData) {
      if (err) {
        handleError(response, err);
        return;
      }

      const compiledFooter = pug.compile(footerData);
      const footerHTML = compiledFooter();

      response.write(footerHTML);
      response.end();
    });
  });
};

function parseURL(request, response) {
  const PARSE_QUERY = true //parseQueryStringIfTrue
  const SLASH_HOST = true //slashDenoteHostIfTrue
  let urlObj = url.parse(request.url, PARSE_QUERY, SLASH_HOST)
  console.log('path:')
  console.log(urlObj.path)
  console.log('query:')
  console.log(urlObj.query)
  return urlObj

}

exports.users = function(request, response) {
  // /send_users
  console.log('USER ROLE: ' + request.user_role);
  response.write(`<p><a href="${indexLink}">Back to Main Page</a></p>`);

  //from data base, send users if you're the admin 
  db.all("SELECT userid, password FROM users", function(err, rows) {
    response.write(`<h1>Movie Friends:</h1>`);
    if (request.user_role === 'admin') {
      authorization = 1;
      send_users(request, response, rows, authorization);
    } else {
      authorization = 0;
      send_users(request, response, rows, authorization);
    }
  });
};

//get the list of all the movies that have been added to the watch lsit tht are stored in a watchlist db
function send_watchlist(request, response, rows) {
  const template = pug.compileFile(watchlistTemplatePath);

  const renderedHtml = template({ rows });

  response.writeHead(200, {
    'Content-Type': 'text/html'
  });

  response.write(renderedHtml);
  response.end();
}

//send watchlist to user
exports.watchlist = function(request, response) {

  db.all("SELECT title, id FROM watchlist", function(err, rows) {
    send_watchlist(request, response, rows);
  });
};

