const { describe, expect, test } = require("@jest/globals");

const todoList = require("../todo");

let todos = todoList();

const formattedDate = (d) => {
  return d.toISOString().split("T")[0];
};

let dateToday = new Date();
const today = formattedDate(dateToday);
const yesterday = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() - 1)),
);
const tomorrow = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() + 1)),
);

describe("Todolist Test Suite", () => {
  let newtodo = {};

  test("Should add new todo", () => {
    const todoItemsCount = todos.all.length;
    newtodo = {
      title: "Test todo 1",
      completed: true,
      dueDate: tomorrow,
    };
    todos.add(newtodo);
    expect(todos.all.length).toBe(todoItemsCount + 1);
  });

  test("Should mark todo as complete", () => {
    newtodo = {
      title: "Test todo 2",
      completed: false,
      dueDate: today,
    };
    todos.add(newtodo);
    expect(todos.all[todos.all.length - 1].completed).toStrictEqual(false);
    todos.markAsComplete(todos.all.length - 1);
    expect(todos.all[todos.all.length - 1].completed).toStrictEqual(true);
  });

  test("Should get overdue items", () => {
    newtodo = {
      title: "Test tod",
      completed: false,
      dueDate: yesterday,
    };
    todos.add(newtodo);
    expect(todos.overdue()).toStrictEqual(
      todos.all.filter((todoItem) => {
        if (todoItem.dueDate <= newtodo.dueDate) return true;
        else return false;
      }),
    );
  });

  test("Should get dueToday items", () => {
    newtodo = {
      title: "Test tod",
      completed: false,
      dueDate: today,
    };
    todos.add(newtodo);
    expect(todos.dueToday()).toStrictEqual(
      todos.all.filter((todoItem) => {
        if (todoItem.dueDate === newtodo.dueDate) return true;
        else return false;
      }),
    );
  });

  test("Should get dueLater items", () => {
    newtodo = {
      title: "Test tod",
      completed: false,
      dueDate: tomorrow,
    };
    todos.add(newtodo);
    expect(todos.dueLater()).toStrictEqual(
      todos.all.filter((todoItem) => {
        if (todoItem.dueDate >= newtodo.dueDate) return true;
        else return false;
      }),
    );
  });
});
