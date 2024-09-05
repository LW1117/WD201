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
    const todoItemsCount = all.length;
    add({
      title: "Test tod",
      completed: false,
      dueDate: today,
    });
    expect(all.length).toBe(todoItemsCount + 1);
  });

  test("Should mark todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
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
