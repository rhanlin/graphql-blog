const db = require('../database.js')

const getAllUsers = () => {
  const sql = `SELECT * FROM users`
  const param = []
  return new Promise((resolve, reject) => {
    db.all(sql, param, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

// const filterUsersByUserIds = userIds => USERS.filter(user => userIds.includes(user.id))
const filterUsersByUserIds = userIds => {
  // console.log(':>>>>'+ userIds)
  let param
  if(!userIds.length) {
    param = []
  } else {
    param = userIds.split(',')
  }
  // console.log(':>>>>'+ param)
  
  if (!param) {
    throw new Error('Need user id.')
  }
  
  const sql = `SELECT * FROM users WHERE id IN ( ${ param.map(() => { return '?'} ).join(',')} )`
  // console.log(sql)
  return new Promise((resolve, reject) => {
    db.all(sql, param, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

/*
 * 因為在 GraphQL 中我們使用 ID Scalar Type 的話他會預設轉為 String
 * 與我們在資料中存的 id 是 Integer 不相同，因此需要特別做 Number() 轉換。
 */
// const findUserByUserId = userId => USERS.find(user => user.id === Number(userId))
const findUserByUserId = userId => {
  const param = userId
  // console.log(':>>>>'+ param)
  const sql = `SELECT * FROM users WHERE id = ?`
  return new Promise((resolve, reject) => {
    db.get(sql, param, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

// const findUserByName = name => USERS.find(user => user.name === name)
const findUserByName = name => {
  const param = name
  // console.log(':>>>>'+ param)
  const sql = `SELECT * FROM users WHERE name = ?`
  return new Promise((resolve, reject) => {
    db.get(sql, param, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

// const updateUserInfo = (userId, data) => Object.assign(findUserByUserId(userId), data)
const updateUserInfo = async (userId, newUserInfo) => {
  const updatedUserInfo = Object.assign(await findUserByUserId(userId), newUserInfo)
  // console.log(updatedUserInfo)
  const param = [userId]
  const sql = `UPDATE users SET email = '${updatedUserInfo.email}', name = '${updatedUserInfo.name}', age = ${updatedUserInfo.age} WHERE id = ?`
  // console.log(sql)
  
  return new Promise((resolve, reject) => {
    db.run(sql, param, function(err){
      if (err) {
        reject(err)
      } else {
        // console.log('this '+this)
        // console.log('lastID '+this.lastID)
        // console.log('changes '+this.changes)
        resolve(
          {
            // lastId: this.lastID,
            status: "200",
            message: "success"
          }
        )
      }
    })
  })
  
}

// const addUser = ({ name, email, password, friendIds }) => (
//   USERS[USERS.length] = {
//     id: USERS[USERS.length - 1].id + 1,
//     name,
//     email,
//     password,
//     friendIds
//   }
// )
const addUser = ({ email, password, name, age, friendIds }) => {
  const params = [
    email,
    password,
    name,
    age,
    friendIds
  ]
  // console.log(params)

  const sql = `INSERT INTO users(
    email,
    password,
    name,
    age,
    friendIds
  ) VALUES (?,?,?,?,?)`

  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err){
      if (err) {
        reject(err)
      } else {
        // console.log(this)
        // console.log(this.lastID)
        // console.log(this.changes)
        resolve(
          {
            lastId: this.lastID,
            status: "200",
            message: "success"
          }
        )
      }
    })
  })
}

module.exports = {
  getAllUsers: getAllUsers,
  filterUsersByUserIds: filterUsersByUserIds,
  findUserByUserId: findUserByUserId,
  findUserByName: findUserByName,
  updateUserInfo: updateUserInfo,
  addUser: addUser,
}