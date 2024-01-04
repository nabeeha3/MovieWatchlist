/*
(c) 2022 Louis D. Nel
*/

const http = require('http')
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const fs = require('fs')
//read routes modules
const routes = require('./routes/index')
const database = require('./public/js/database')

const  app = express() //create express middleware dispatcher
const bodyParser = require('body-parser');

const pug = require('pug');
const moviesTemplatePath = path.join(__dirname + '/views/movie.pug')
const moviesIdTemplatePath = path.join(__dirname + '/views/id.pug')
const registerPath = path.join(__dirname + '/views/register.pug')
const indexLink = 'http://localhost:3000/index.html';

const PORT = process.env.PORT || 3000
let API_KEY_MOVIE = 'c404f10264db886b562df1327093a641';


app.locals.pretty = true //to generate pretty view-source code in browser

//some logger middleware functions
function methodLogger(request, response, next){
		   console.log("METHOD LOGGER")
		   console.log("================================")
		   console.log("METHOD: " + request.method)
		   console.log("URL:" + request.url)
		   next(); //call next middleware registered
}
function headerLogger(request, response, next){
		   console.log("HEADER LOGGER:")
		   console.log("Headers:")
           for(k in request.headers) console.log(k)
		   next() //call next middleware registered
}

//get for register, show register.pug file to get info from users
app.get('/register', (request, response) => {
  const registerPug = pug.compileFile(registerPath);
  const renderedRegisterHTML = registerPug();

  response.send(renderedRegisterHTML);
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

//register path to create an account anf add to db
app.post('/register', (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  const userRole = 'guest'; // set the default role for new users

  //check if the username or password is missing
  if (!username || !password) {
    response.status(400).send('Username and password are required.');
    return;
  }

  database.registerButton(username, password, userRole);

  response.setHeader('Content-Type', 'text/html');
  response.write("You have been registered succesfully, close and reload the tab to sign in and gain access")
  
  // response.write(`<p><a href="${indexLink}">Go to Main Page (once registered)</a></p>`)
  response.end();
});


//register middleware with dispatcher
//ORDER MATTERS HERE
//middleware
app.use(express.static(__dirname + '/public')) //static server
app.use(routes.authenticate); //authenticate user
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
// app.use(methodLogger)
//routes
app.get('/index.html', routes.index)
app.get('/users', routes.users)
app.get('/', routes.index)
app.get('/watchlist', routes.watchlist)

//if want to search movies up 
app.get('/moviesName', (request, response) => {
  const moviesPug = pug.compileFile(moviesTemplatePath);
  const renderedMoviesHTML = moviesPug();

  response.send(renderedMoviesHTML);
});

//use movieScript and API to query and get data
app.post('/moviesName', (request, response) => {
  let movie = request.query.movie

  if(!movie) {
    //send json response to client using response.json() feature
    //of express
    response.json({message: 'Please enter a movie name'})
    return
  }

  let optionsName = {
    host: 'api.themoviedb.org',
    path: '/3/search/movie?query=' + movie +
      '&api_key=' + API_KEY_MOVIE
  }

  //create the actual http request and set up
  //its handlers
  http.request(optionsName, function(apiResponse) {
    let movieData = ''
    apiResponse.on('data', function(chunk) {
      movieData += chunk
    })
    apiResponse.on('end', function() {
      response.contentType('application/json').json(JSON.parse(movieData))
    })
  }).end() //important to end the request
           //to actually send the message

})

//if entering a movie ID
app.get('/movieId', (request, response) => {
  const idPug = pug.compileFile(moviesIdTemplatePath);
  const renderedIdHTML = idPug();

  response.send(renderedIdHTML);
});

//use watchlistScript and API to query and get data and then add the id to our watchlist db
app.post('/movieId', (request, response) => {
  let id = request.query.id
 
  if(!id) {
    //send json response to client using response.json() feature
    //of express
    response.json({message: 'Please enter a movie id'})
    return
  }

  let optionsId = {
    host: 'api.themoviedb.org',
    path: '/3/movie/' + id +
      '?api_key=' + API_KEY_MOVIE
  }

  //create the actual http request and set up its handlers
  http.request(optionsId, function(apiResponse) {
    let movieIdData = ''
    apiResponse.on('data', function(chunk) {
      movieIdData += chunk
    })
    apiResponse.on('end', function() {
      //parse the JSON data
      const jsonData = JSON.parse(movieIdData);
      //extract the movie title
      const movieName = jsonData.title;
      const movieId = jsonData.id;

      //add to watchlist
      database.insertIntoWatchlist(movieName, movieId);

      response.contentType('application/json').json(jsonData)

    })
  }).end() //important to end the request
           //to actually send the message

})

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
		console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)
		console.log(`To Test:`)
		console.log('user: ldnel password: secret')
    console.log('user: petunia password: p123')
		console.log('http://localhost:3000/index.html')
		console.log('http://localhost:3000/users')
		console.log('http://localhost:3000/movieID')
		console.log('http://localhost:3000/moviesName')
    console.log('http://localhost:3000/watchlist')
	}
})
