//similar to get movie but we search a movie up by its ID number, that way it is specific to one movie only  
function getMovieByID() {

    //get movie id entered
    let movieId = document.getElementById('id').value
    if(movieId === '') {
        return alert('Please enter a movie ID')
    }

    let movieDiv = document.getElementById('movieID')
    movieDiv.innerHTML = ''

    //getting the movie data based on its id
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText)
            console.log(response);
        
            movieDiv.innerHTML = movieDiv.innerHTML + `
			    <h1>Movie ID Search Result for "${movieId}" </h1>
                `
                var movieURL = "https://image.tmdb.org/t/p/w200/" + response.poster_path;
                movieDiv.innerHTML = movieDiv.innerHTML + `
                <img src = ${movieURL}>
                <ul>
                <li>Title: ${response.title}</li>
                <li>Overview: ${response.overview}</li>
                <li>Release Date: ${response.release_date}</li>
                </ul>
                `
        }
    }
    xhr.open('POST', `/movieId?id=${movieId}`, true)
    xhr.send()
}

const ENTER=13

function handleKeyUp(event) {
event.preventDefault()
   if (event.keyCode === ENTER) {
      document.getElementById("submit_movieById_button").click()
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('submit_movieById_button').addEventListener('click', getMovieByID)

  //add key handler for the document as a whole, not separate elements.
  document.addEventListener('keyup', handleKeyUp)

})

