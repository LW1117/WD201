// models/todo.js
"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      const overdueItems = await this.overdue();
      const overdueStrings = overdueItems
        .map((item) => item.displayableString())
        .join("\n");
      console.log(overdueStrings);
      console.log("\n");

      console.log("Due Today");
      const dueTodayItems = await this.dueToday();
      const dueTodayStrings = dueTodayItems
        .map((item) => item.displayableString())
        .join("\n");
      console.log(dueTodayStrings);
      console.log("\n");

      console.log("Due Later");
      const dueLaterItems = await this.dueLater();
      const dueLaterStrings = dueLaterItems
        .map((item) => item.displayableString())
        .join("\n");
      console.log(dueLaterStrings);
    }

    static async overdue() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const overdueItems = await Todo.findAll({
          where: {
            dueDate: {
              [Op.lt]: today,
            },
          },
        });
        return overdueItems;
      } catch (error) {
        console.error("Error retrieving overdue items:", error);
        return "Error retrieving overdue items.";
      }
    }

    static async dueToday() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const dueTodayItems = await Todo.findAll({
          where: {
            dueDate: {
              [Op.eq]: today,
            },
          },
        });
        return dueTodayItems;
      } catch (error) {
        console.error("Error retrieving dueToday items:", error);
        return "Error retrieving dueToday items.";
      }
    }

    static async dueLater() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const dueLaterItems = await Todo.findAll({
          where: {
            dueDate: {
              [Op.gt]: today,
            },
          },
        });
        return dueLaterItems;
      } catch (error) {
        console.error("Error retrieving dueLater items:", error);
        return "Error retrieving dueLater items.";
      }
    }

    static async markAsComplete(id) {
      try {
        await Todo.update(
          { completed: true },
          {
            where: {
              id: id,
            },
          },
        );
      } catch (error) {
        console.error("Error marking item as complete:", error);
      }
    }

    displayableString() {
      const today = new Date().toISOString().split("T")[0];
      let checkbox = this.completed ? "[x]" : "[ ]";
      let dueDateString =
        this.dueDate && this.dueDate !== today ? this.dueDate : "";
      return `${this.id}. ${checkbox} ${this.title} ${dueDateString}`.trim();
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
      tableName: "Todos",
    },
  );
  return Todo;
};
