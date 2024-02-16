const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'userData.db')
let db = null
const bcrypt = require('bcrypt')
app.use(express.json())

const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initialiseDbAndServer()

//api 1

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectuser = `
  SELECT * FROM user WHERE username =  '${username}';`
  const dbUser = await db.get(selectuser)
  if (dbUser === undefined) {
    const createUser = `
    INSERT INTO
            user (username,name,password,gender,location)
            VALUES (
                '${username}',
                '${name}',
                '${hashedPassword}',
                '${gender}',
                '${location}'
            );`
    if (password.length < 5) {
      response.status(400)
      response.send('password is too short')
    } else {
      response.send('User created successfully')
      response.status(200)
    }
  } else {
    response.status(200)
    response.send('user already exits')
  }
})
