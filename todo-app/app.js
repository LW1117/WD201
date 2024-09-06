/* eslint-disable no-unused-vars */
const express = require("express");
const { request, response } = require("express");
const bodyParser = require("body-parser");

const { Todo } = require("./models");
const { json } = require("sequelize");

const app = express();

app.use(bodyParser.json());

app.get("/todos", async (request, response) => {
  console.log("Todo list");
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    return response.status(442).json(error);
  }
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

app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo with id ", request.params.id);
  const item = await Todo.findByPk(request.params.id);
  if (!item) return response.json(false);
  try {
    await Todo.destroy({
      where: {
        id: request.params.id,
      },
    });
    return response.json(true);
  } catch (error) {
    return response.status(442).json(error);
  }
});

module.exports = app;
