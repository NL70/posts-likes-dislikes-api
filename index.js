const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { pool } = require("./config");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

const getBooks = (request, response) => {
  pool.query("SELECT * FROM books", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json({ data: results.rows });
  });
};

const addBook = (request, response) => {
  const { author, title } = request.body;

  pool.query(
    "INSERT INTO books (author, title) VALUES ($1, $2)",
    [author, title],
    (error) => {
      if (error) {
        throw error;
      }
      response.status(201).json({ status: "success", message: "Book added." });
    }
  );
};

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

app
  .route("/books")
  // GET endpoint
  .get(getBooks)
  // POST endpoint
  .post(addBook);

const publicPath = path.join(__dirname, "public");

app.use("/mybooks", (req, res) => {
  res.sendFile(publicPath + "/mybooks.html");
});

app.route("/google_books").get(searchBooks);

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening at port ${process.env.PORT || 3002}`);
});
