const minimist = require("minimist");
const args = minimist(process.argv.slice(2), {
  default: {
    num1: 1,
    num2: 1,
    operation: "add",
  },
});

const operation = args.operation;
const num1 = parseInt(args.num1);
const num2 = parseInt(args.num2);

switch (operation) {
  case "add":
    console.log(`The result is ${num1 + num2}`);
    break;
  case "subtract":
    console.log(`The result is ${num1 - num2}`);
    break;
  case "multiply":
    console.log(`The result is ${num1 * num2}`);
    break;
  case "divide":
    console.log(`The result is ${num1 / num2}`);
    break;
  default:
    console.log("Unknown operation");
    break;
}
