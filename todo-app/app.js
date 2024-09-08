const express = require("express");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

const { Todo, User } = require("./models");

app.set("view engine", "ejs");

const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.use(flash());

app.use(
  session({
    secret: "my-super-secret-key-754682154983546718",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          if (!user) {
            return done(null, false, { message: "Email not found" });
          }
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        })
        .catch((error) => {
          return error;
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("serializing user", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.get("/signup", (request, response) => {
  response.render("signup", {
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async (request, response) => {
  const hashedPwd = await bcrypt.hashSync(request.body.password, saltRounds);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      request.flash("success", "Account created. Welcome!");
      response.redirect("/todos");
    });
  } catch (error) {
    request.flash("error", error.message);
    response.redirect("/signup");
  }
});

app.get("/login", (request, response) => {
  response.render("login", {
    csrfToken: request.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    request.flash("success", "Welcome!");
    response.redirect("/todos");
  },
);

app.get("/signout", (request, response) => {
  request.logout((err) => {
    if (err) {
      // eslint-disable-next-line no-undef
      return next(err);
    }
    response.redirect("/");
  });
});

app.get("/", async (request, response) => {
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const loggedInUser = request.user.id;
    const overdueTodos = await Todo.getOverdue(loggedInUser);
    const dueTodayTodos = await Todo.getDueToday(loggedInUser);
    const dueLaterTodos = await Todo.getDueLater(loggedInUser);
    const completedTodos = await Todo.getCompleted(loggedInUser);
    if (request.accepts("html")) {
      response.render("todos", {
        overdue: overdueTodos,
        dueToday: dueTodayTodos,
        dueLater: dueLaterTodos,
        completed: completedTodos,
        message: "",
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        overdue: overdueTodos,
        dueToday: dueTodayTodos,
        dueLater: dueLaterTodos,
        completed: completedTodos,
      });
    }
  },
);

app.get(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      return response.json(todo);
    } catch (error) {
      console.log(error);
      request.flash("error", error.message);
      return response.status(422).json(error);
    }
  },
);

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log(request.user);
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      request.flash("success", "Todo created!");
      return response.redirect("/todos");
    } catch (error) {
      request.flash("error", error.message);
      return response.redirect("/todos");
    }
  },
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const completed = request.body.completed;
    const todo = await Todo.findByPk(request.params.id);
    try {
      const updatedTodo = await todo.setCompletionStatus(completed);
      request.flash("success", "Todo updated!");
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      request.flash("error", error.message);
      return response.status(422).json(error);
    }
  },
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);
    const item = await Todo.findByPk(request.params.id);
    if (!item) {
      request.flash("error", "Todo not found!");
      return response.send(false);
    }
    try {
      await Todo.remove(request.params.id, request.user.id);
      request.flash("success", "Todo deleted!");
      return response.send(true);
    } catch (error) {
      request.flash("error", error.message);
      return response.status(442).json(error);
    }
  },
);

module.exports = app;
