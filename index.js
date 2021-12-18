const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const { pool } = require("./config");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

if (process.env.NODE_ENV !== "production") {
  const livereload = require("livereload");
  const connectLivereload = require("connect-livereload");
  // Reload browser when saving frontend code
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(__dirname + "/public");

  // Reload the page when the server has started
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });

  app.use(connectLivereload());
}

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "secret",
  })
);

// Static files
app.use(express.static("public", { index: false }));

function redirectOnLogin(req, res, next) {
  console.log(req.session.user);
  if (req.session.user) {
    console.log("redirect index");
    res.redirect("/index.html");
  } else {
    console.log("redirect login");
    res.redirect("/login.html");
  }
  next();
}

app.get("/", redirectOnLogin);

app.get("/login", redirectOnLogin);

const postsRouter = require("./api/posts");
app.use("/posts", postsRouter);

const usersRouter = require("./api/users");
app.use("/users", usersRouter);

const getHashedPassword = (password) => {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(password).digest("base64");
  return hash;
};

app.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.body);

  // Check if user with the same username is also registered
  pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username],
    (error, results) => {
      if (error) {
        throw error;
      }
      const user = results.rows[0];
      const hashedPassword = getHashedPassword(password);

      if (user) {
        if (user.password === hashedPassword) {
          req.session.regenerate(() => {
            req.session.user = user;
            res.status(201).send({ data: user });
          });
          return;
        } else {
          res.status(400).json({
            status: "error",
            message: "The username or password is invalid.",
          });
          return;
        }
      }

      // Store user into the database
      pool.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [username, hashedPassword],
        (error) => {
          if (error) {
            throw error;
          }
          const user = results.rows[0];
          req.session.regenerate(() => {
            req.session.user = user;
            res.status(201).send({ data: user });
          });
          return;
        }
      );
    }
  );
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
