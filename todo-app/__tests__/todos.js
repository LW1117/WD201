const {
  describe,
  expect,
  test,
  beforeAll,
  afterAll,
} = require("@jest/globals");

const cheerio = require("cheerio");
const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.error(error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks a todo with the given ID as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy play station",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodyCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodyCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });
    const parsedUpdatedResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(true);
  });

  test("Marks a todo with the given ID as incomplete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy pc",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodyCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodyCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: false,
      });
    const parsedUpdatedResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdatedResponse.completed).toBe(false);
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy steam deck",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodyCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodyCount - 1];
    const todoID = latestTodo.id;

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    let deleteResponse = await agent.delete(`/todos/${todoID}`).send({
      _csrf: csrfToken,
    });
    deleteResponse = JSON.parse(deleteResponse.text);
    expect(deleteResponse).toBe(true);

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    deleteResponse = await agent.delete(`/todos/${todoID}`).send({
      _csrf: csrfToken,
    });
    deleteResponse = JSON.parse(deleteResponse.text);
    expect(deleteResponse).toBe(false);
  });
});
