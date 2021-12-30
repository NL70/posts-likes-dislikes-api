const express = require("express");
const { pool } = require("../config");
const crypto = require("crypto");

const usersRouter = express.Router();

const getUser = (req, res) => {
  const userId = req.params.userId;
  // Handle 404
  pool.query("SELECT * FROM users WHERE id=$1", [userId], (error, results) => {
    if (error) {
      res.status(500).json({ status: "error", message: error.message });
      return;
    }

    res.status(200).json({ data: results.rows[0] });
  });
};

const addUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res
      .status(400)
      .json({ status: "error", message: "Username/Password cannot be empty." });
    return;
  }
  pool.query(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
    [username, getHashedPassword(password)],
    (error, results) => {
      if (error) {
        res.status(500).json({ status: "error", message: error.message });
        return;
      }
      delete results.rows[0]["password"];
      res.status(201).json({
        status: "Success",
        message: "User added.",
        data: results.rows[0],
      });
    }
  );
};

const getHashedPassword = (password) => {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(password).digest("base64");
  return hash;
};

usersRouter.get("/:userId", getUser);
usersRouter.post("/", addUser);

module.exports = usersRouter;
