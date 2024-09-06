/* eslint-disable no-unused-vars */
const express = require("express");
const { request, response } = require("express");
const bodyParser = require("body-parser");

const { Todo } = require("./models");

const app = express();

app.use(bodyParser.json());

app.get("/todos", (request, response) => {
  console.log("Todo list");
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  //Todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(442).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  const { id } = request.params;
  console.log("Update a todo with id ", id);
  const todo = await Todo.findByPk(id);
  try {
    await todo.markAsCompleted();
    return response.json(todo);
  } catch (error) {
    return response.status(442).json(error);
  }
});

app.delete("/todos/:id", (request, response) => {
  console.log("Delete a todo with id ", request.params.id);
});

module.exports = app;
