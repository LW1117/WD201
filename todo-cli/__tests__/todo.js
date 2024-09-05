const { describe, expect, test, beforeAll } = require("@jest/globals");
const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

const formattedDate = (d) => {
  return d.toISOString().split("T")[0];
};

var dateToday = new Date();
const today = formattedDate(dateToday);
const yesterday = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() - 1)),
);
const tomorrow = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() + 1)),
);

describe("Todolist Test Suite", () => {
  beforeAll(() => {
    add({
      title: "Test tod",
      completed: false,
      dueDate: today,
    });
  });
  test("Should add new todo", () => {
    let todoItemsCount = all.length;
    add({
      title: "Test tod",
      completed: false,
      dueDate: today,
    });
    expect(all.length).toBe(todoItemsCount + 1);
  });

  test("Should mark todo as complete", () => {
    for (let index = 0; index < all.length; index++) {
      if (!all[index].completed) {
        markAsComplete(index);
        expect(all[index].completed).toStrictEqual(true);
      }
    }
  });

  test("Should get overdue items", () => {
    add({
      title: "Test tod",
      completed: false,
      dueDate: yesterday,
    });
    expect(overdue()).toStrictEqual(
      all.filter((todoItem) => {
        if (todoItem.dueDate <= yesterday) return true;
        else return false;
      }),
    );
  });

  test("Should get dueToday items", () => {
    expect(dueToday()).toStrictEqual(
      all.filter((todoItem) => {
        if (todoItem.dueDate === today) return true;
        else return false;
      }),
    );
  });

  test("Should get dueLater items", () => {
    add({
      title: "Test tod",
      completed: false,
      dueDate: tomorrow,
    });
    expect(dueLater()).toStrictEqual(
      all.filter((todoItem) => {
        if (todoItem.dueDate >= tomorrow) return true;
        else return false;
      }),
    );
  });
});
