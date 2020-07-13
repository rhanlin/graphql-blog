const USERS = [
  {
    id: 1,
    email: 'fong@test.com',
    password: '$2b$04$wcwaquqi5ea1Ho0aKwkZ0e51/RUkg6SGxaumo8fxzILDmcrv4OBIO', // 123456
    name: 'Fong',
    age: 23,
    friendIds: [2, 3]
  },
  {
    id: 2,
    email: 'kevin@test.com',
    passwrod: '$2b$04$uy73IdY9HVZrIENuLwZ3k./0azDvlChLyY1ht/73N4YfEZntgChbe', // 123456
    name: 'Kevin',
    age: 40,
    friendIds: [1]
  },
  {
    id: 3,
    email: 'mary@test.com',
    password: '$2b$04$UmERaT7uP4hRqmlheiRHbOwGEhskNw05GHYucU73JRf8LgWaqWpTy', // 123456
    name: 'Mary',
    age: 18,
    friendIds: [1]
  }
]

// helper functions
const getAllUsers = () => USERS

const filterUsersByUserIds = userIds => USERS.filter(user => userIds.includes(user.id))

/*
 * 因為在 GraphQL 中我們使用 ID Scalar Type 的話他會預設轉為 String
 * 與我們在資料中存的 id 是 Integer 不相同，因此需要特別做 Number() 轉換。
 */
const findUserByUserId = userId => USERS.find(user => user.id === Number(userId))

const findUserByName = name => USERS.find(user => user.name === name)

const updateUserInfo = (userId, data) => Object.assign(findUserByUserId(userId), data)

const addUser = ({ name, email, password, friendIds }) => (
  USERS[USERS.length] = {
    id: USERS[USERS.length - 1].id + 1,
    name,
    email,
    password,
    friendIds
  }
)
module.exports = {
  getAllUsers: getAllUsers,
  filterUsersByUserIds: filterUsersByUserIds,
  findUserByUserId: findUserByUserId,
  findUserByName: findUserByName,
  updateUserInfo: updateUserInfo,
  addUser: addUser,
}