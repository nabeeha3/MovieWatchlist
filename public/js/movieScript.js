//using public content API for movies to search movies up by their name and then displaying for user
function getMovie() {

    //get movie name from text box
    let movieName = document.getElementById('movie').value
    if(movieName === '') {
        return alert('Please enter a movie')
    }

    let movieDiv = document.getElementById('movieName')
    movieDiv.innerHTML = ''


    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText)
            movieDiv.innerHTML = movieDiv.innerHTML + `
			    <h1>Movie Search Results for "${movieName}" </h1>
                `
                //get specified elements of movie from api
            for(var i = 0; i < response.results.length; i++){
                var movieURL = "https://image.tmdb.org/t/p/w200/" + response.results[i].poster_path;
                movieDiv.innerHTML = movieDiv.innerHTML + `
                <img src = ${movieURL}>
                <ul>
                <li>Title: ${response.results[i].title}</li>
                <li>Movie ID: ${response.results[i].id}</li>
                <li>Overview: ${response.results[i].overview}</li>
                <li>Release Date: ${response.results[i].release_date}</li>
                </ul>
                `
            }
        }
    }
    xhr.open('POST', `/moviesName?movie=${movieName}`, true)
    xhr.send()
}

const ENTER=13

function handleKeyUp(event) {
event.preventDefault()
   if (event.keyCode === ENTER) {
      document.getElementById("submit_movie_button").click()
  }
}

//event listener for getting movies
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('submit_movie_button').addEventListener('click', getMovie)

  //add key handler for the document as a whole, not separate elements.
  document.addEventListener('keyup', handleKeyUp)

})
