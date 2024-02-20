const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')

const databasePath = path.join(__dirname, 'userData.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const validatePassword = password => {
  return password.length > 4
}

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const databaseUser = await database.get(selectUserQuery)

  if (databaseUser === undefined) {
    const createUserQuery = `
     INSERT INTO
      user (username, name, password, gender, location)
     VALUES
      (
       '${username}',
       '${name}',
       '${hashedPassword}',
       '${gender}',
       '${location}'  
      );`
    if (validatePassword(password)) {
      await database.run(createUserQuery)
      response.send('User created successfully')
    } else {
      const lengthofpass = length.password
      if(lengthofpass<5){
      response.status(400)
      response.send('Password is too short')
      }
    }
  } else {
    response.status(400)
    response.send('User already exists ')
  }
})
//api 2

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await database.get(selectUserQuery)

  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const ispasswordcorrect = await bcrypt.compare(password, dbUser.password)

    if (ispasswordcorrect === true) {
      response.status(200)
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

//api 3

app.put('/change-password', async (request, response) => {
  const {username, oldpassword, newpassword} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await database.get(selectUserQuery)

  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid current password')
  } else {
    const ispasscorrect = await bcrypt.compare(oldpassword, dbUser.password)
    const lengthofpass = newpassword.length
    if (lengthofpass < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const changedpass = await bcypt.hash(newpassword, 10)
      const updatepassquery = `update user set password = '${changedpass}'
                              where username = '${username}'
      `
      await db.run(updatepassquery)
      response.status(200)
      response.send('Password updated')
    }
  }
})
