const express = require("express");
const { pool } = require("../config");

const booksRouter = express.Router();

const getBooks = (req, res) => {
  pool.query("SELECT * FROM books", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json({ data: results.rows });
  });
};

const addBook = (req, res) => {
  const { author, title } = req.body;

  pool.query(
    "INSERT INTO books (author, title) VALUES ($1, $2)",
    [author, title],
    (error) => {
      if (error) {
        throw error;
      }
      res.status(201).json({ status: "success", message: "Book added." });
    }
  );
};

const deleteBook = (req, res) => {
  const bookId = req.params.bookId;
  pool.query("DELETE FROM books WHERE id = $1", [bookId], (error) => {
    if (error) {
      throw error;
    }
    res.status(204).json({ status: "success", message: "Book deleted." });
  });
};

booksRouter.get("/", getBooks);
booksRouter.post("/", addBook);
booksRouter.delete("/:bookId", deleteBook);

module.exports = booksRouter;
