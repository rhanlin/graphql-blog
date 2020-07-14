var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(':memory:')
 
db.serialize(function() {
  db.run(`CREATE TABLE USERS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT
    password TEXT
    name TEXT
    age INTEGER
    friendIds TEXT
  )`)
  let insertUser = `INSERT INTO USERS(
    email,
    password,
    name,
    age,
    friendIds
  ) VALUES (?,?,?)`
  db.run(insertUser, ['fong@test.com', '$2b$04$wcwaquqi5ea1Ho0aKwkZ0e51/RUkg6SGxaumo8fxzILDmcrv4OBIO', 'Fong', 40, '2,3'])
  // stmt.finalize()

})
 
db.close();