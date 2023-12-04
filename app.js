const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'todoApplication.db')
const app = express()
app.use(express.json())

let db = null
const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

intializeDBAndServer()

//prctice POST
//Create a todo in the todo table
app.post('/todos/', async (request, response) => {
  const cr = request.body
  const query = `
    INSERT INTO
      todo (id, todo, priority, status)
    VALUES
      ('${cr.id}', '${cr.todo}', '${cr.priority}', '${cr.status}');`
  const dbResponse = await db.run(query)
  response.send('Todo Successfully Added')
})

//PRACTICE PUT
//Updates the details of a specific todo based on the todo ID
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const toupdate = request.body
  //const ar = Object.keys(toupdate)
  //const col = ar[0]
  const {status, priority, todo} = toupdate
  const query = `
    UPDATE
      todo
    SET
      '${Object.keys(toupdate)[0]}' =
        CASE
          WHEN (${status !== undefined}) THEN ('${status}')
          WHEN (${priority !== undefined}) THEN ('${priority}')
          WHEN (${todo !== undefined}) THEN ('${todo}')
        END
    WHERE
      id = ${todoId};`
  await db.run(query)
  if (status) {
    response.send('Status Updated')
  } else if (priority) {
    response.send('Priority Updated')
  } else if (todo) {
    response.send('Todo Updated')
  }
})

//Returns a list of all todos whose status is 'TO DO'
app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query
  const getQuery = `
    SELECT
        *
    FROM
      todo
    WHERE
      CASE
        WHEN (('${priority}' <> '${''}') AND ('${status}' <> '${''}')) THEN (todo LIKE '%${search_q}%' AND status = '${status}' AND priority = '${priority}')
        WHEN ('${priority}' <> '${''}') THEN (todo LIKE '%${search_q}%' AND priority = '${priority}')
        WHEN ('${status}' <> '${''}') THEN (todo LIKE '%${search_q}%' AND status = '${status}')
        ELSE (todo LIKE '%${search_q}%')
      END;`
  const resArr = await db.all(getQuery)
  response.send(resArr)
})

//Returns a specific todo based on the todo ID
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`
  res = await db.get(query)
  response.send(res)
})

//Create a todo in the todo table
/*app.post('/todos/', async (request, response) => {
  const cr = request.body
  const {id, todo, priority, status} = cr
  const query = `
    INSERT INTO
      todo (id, todo, priority, status)
    VALUES
      ('${id}', '${todo}', '${priority}', '${status}');`
  const dbResponse = await db.run(query)
  response.send('Todo Successfully Added')
})*/

//Updates the details of a specific todo based on the todo ID
/*app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const toupdate = request.body
  console.log(Object.keys(toupdate)[0])
  const {status, priority, todo} = toupdate
  let column = ''
  let responseStatement = ''
  switch (true) {
    case status !== undefined:
      column = 'status'
      responseStatement = 'Status Updated'
      break
    case priority !== undefined:
      column = 'priority'
      responseStatement = 'Priority Updated'
      break
    case todo !== undefined:
      column = 'todo'
      responseStatement = 'Todo Updated'
      break
  }
  const query = `
    UPDATE
      todo
    SET
      '${column}' = '${toupdate[column]}'
    WHERE
      id = ${todoId};`
  await db.run(query)
  response.send(responseStatement)
})*/

//Deletes a todo from the todo table based on the todo ID
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`
  await db.run(query)
  response.send('Todo Deleted')
})

//PRACTICE
app.get('/todos/', async (request, response) => {
  const query = `
    SELECT
      *
    FROM
      todo;`
  resArr = await db.all(query)
  response.send(resArr)
})

module.exports = app
