const sqlite3 = require('sqlite3').verbose()
const DBSOURCE = 'db.sqlite'
// const DBSOURCE = ':memory:'
const db = new sqlite3.Database(DBSOURCE)
db.serialize(() => {
  //----------------------Users-------------------//
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    password TEXT,
    name TEXT,
    age INTEGER,
    friendIds BLOB
  )`, (err) => {
    if(err) {
      console.log('The table users is existed')
    } else {
      const insertUser = `INSERT INTO users(
        email,
        password,
        name,
        age,
        friendIds
      ) VALUES (?,?,?,?,?)`
      db.run(insertUser, ['fong@test.com', '$2b$04$wcwaquqi5ea1Ho0aKwkZ0e51/RUkg6SGxaumo8fxzILDmcrv4OBIO', 'Fong', 23, [2,3]])
      db.run(insertUser, ['kevin@test.com', '$2b$04$uy73IdY9HVZrIENuLwZ3k./0azDvlChLyY1ht/73N4YfEZntgChbe', 'Kevin', 40, [1]])
      db.run(insertUser, ['mary@test.com', '$2b$04$UmERaT7uP4hRqmlheiRHbOwGEhskNw05GHYucU73JRf8LgWaqWpTy', 'Mary', 18, [1,2]])
    }
  })
  //----------------------Posts-------------------//
  db.run(`CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    authorId INTEGER,
    title TEXT,
    body TEXT,
    likeGiverIds BLOB,
    createdAt TEXT
  )`, (err) => {
    if(err) {
      console.log('The table posts is existed')
    } else {
      const createdTime = new Date()
      const insertPost = `INSERT INTO posts(
        authorId,
        title,
        body,
        likeGiverIds,
        createdAt
      ) VALUES (?,?,?,?,?)`
      db.run(insertPost, [1, 'Hello World', 'This is my first post', [], createdTime.toString()])
    }
  })
})

module.exports = db
// db.close();