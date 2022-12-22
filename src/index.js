const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  
  const user = users.find(user => user.username.toLowerCase() === username.toLowerCase())

  if(!user) {
    return response.status(400).json({ error: "User not found!" })
  }

  request.user = user
  
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some(user => user.username.toLowerCase() == username.toLowerCase())

  const newUser = {
    id: uuidv4(),
      name,
      username,
      todos: []
  }

  if(!userAlreadyExists) {
    users.push(newUser)

    return response.status(201).json(newUser)
  }
    return response.status(400).json({ error: "User already exists!"})
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).send(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const findTodo = user.todos.find(todo => todo.id === id)

  if(!findTodo) {
    return response.status(404).send({error: "ToDo ID not found!"})
  }
  
  findTodo.title = title
  findTodo.deadline = new Date(deadline)  
   
  return response.json(findTodo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const findTodo = user.todos.find(todo => todo.id === id)

  if(!findTodo) {

    return response.status(404).json({error: "Todo ID not found!" })
  }

  findTodo.done = true

  return response.json(findTodo)
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const findTodoIndex = user.todos.findIndex(todo => todo.id === id)

  if (findTodoIndex === -1) {
    return response.status(404).json({ error: "Todo ID not found!" })
  }

  user.todos.splice(findTodoIndex, 1)
  
  return response.status(204).send()

});

module.exports = app;