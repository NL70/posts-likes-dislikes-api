const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const path = require("path");
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

const authTokens = {};

app.use((req, res, next) => {
  // Get auth token from the cookies
  const authToken = req.cookies["AuthToken"];
  console.log(authToken);
  // Inject the user to the request
  req.user = authTokens[authToken];
  next();
});

const searchBooks = async (request, response) => {
  const searchTerm = request.query.q;
  const booksResponse = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
  );
  const booksResponseJson = await booksResponse.json();
  response.status(200).json(booksResponseJson);
};

// Static files
app.use(express.static("public"));

const booksRouter = require("./api/books");
app.use("/books", booksRouter);

const publicPath = path.join(__dirname, "public");

const getHashedPassword = (password) => {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(password).digest("base64");
  return hash;
};

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

app.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if user with the same email is also registered
  pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    (error, results) => {
      if (error) {
        throw error;
      }
      const user = results.rows[0];
      const hashedPassword = getHashedPassword(password);

      if (user) {
        if (user.password === hashedPassword) {
          const authToken = generateAuthToken();
          // Store authentication token
          authTokens[authToken] = user;
          // Setting the auth token in cookies
          res.cookie("AuthToken", authToken);
          res.redirect("mybooks");
          // Temporary, comment out after adding redirection
          // res
          //   .status(200)
          //   .json({ status: "success", message: "Login success." });
          return;
        } else {
          res.status(400).json({
            status: "error",
            message: "The email or password is invalid.",
          });
          return;
        }
      }

      // Store user into the database
      pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, hashedPassword],
        (error) => {
          if (error) {
            throw error;
          }
          res
            .status(200)
            .json({ status: "success", message: "Signup success." });
          next();
          return;
        }
      );
    }
  );
});

app.use("/mybooks", (req, res) => {
  if (req.user) {
    res.sendFile(publicPath + "/mybooks.html");
  } else {
    res.sendFile(publicPath + "/login.html");
  }
});

app.route("/google_books").get(searchBooks);

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening at port ${process.env.PORT || 3002}`);
});
