const express = require("express");
const app = express();
const path = require("path");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get("/", async (request, response) => {
  const overdueTodos = await Todo.getOverdue();
  const dueTodayTodos = await Todo.getDueToday();
  const dueLaterTodos = await Todo.getDueLater();
  if (request.accepts("html")) {
    response.render("index", {
      overdue: overdueTodos,
      dueToday: dueTodayTodos,
      dueLater: dueLaterTodos,
    });
  } else {
    response.json(overdueTodos, dueTodayTodos, dueLaterTodos);
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async function (_request, response) {
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    return response.status(442).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    await Todo.addTodo(request.body);
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  const item = await Todo.findByPk(request.params.id);
  if (!item) return response.send(false);
  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    return response.status(442).json(error);
  }
});

module.exports = app;
