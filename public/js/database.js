const sqlite3 = require('sqlite3')
const path = require('path');
const dbPath = path.join(__dirname, '../../data/db_1200iRealSongs');
const db = new sqlite3.Database(dbPath);

function insertIntoWatchlist(title, id) {

    // create table for watchlist if not exists
    db.run('CREATE TABLE IF NOT EXISTS watchlist(title TEXT, id INTEGER)');
  
    // insert one row into the table 
    db.run(`INSERT INTO watchlist(title, id) VALUES(?, ?)`, [title, id], function(err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      console.log(`A row has been inserted with row-id ${this.lastID}`);
    });  
}

//when user presses register button
function registerButton(username, password, userRole) {

  // get username and passowrd andd  creaet the account
  console.log('Username:', username);
  console.log('Password:', password);

  db.run("INSERT INTO users (userid, password, role) VALUES (?, ?, ?)", [username, password, userRole], function(err) {
    if (err) {
      return console.log(err.message);
    }
    console.log('User registered successfully');
  });

}
  
// export the function and the database instance
module.exports = {
    insertIntoWatchlist,
    registerButton
};
  
