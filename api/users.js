const express = require("express");
const { pool } = require("../config");

const usersRouter = express.Router();

// Add user < Done!

// Add likes < Done!
// Delete likes < Done!
// Same for dislikes ^ < Done!

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
    [username, password],
    (error, results) => {
      if (error) {
        res.status(500).json({ status: "error", message: error.message });
        return;
      }
      res.status(201).json({
        status: "Success",
        message: "User added.",
        data: results.rows[0],
      });
    }
  );
};

// const deletePosts = (req, res) => {
//   const postsId = req.params.postId;
//   pool.query("DELETE FROM posts WHERE id = $1", [postsId], (error, results) => {
//     if (results.rowCount === 0) {
//       res
//         .status(404)
//         .json({ status: "error", message: "Post does not exist." });
//       return;
//     }
//     if (error) {
//       res.status(500).json({ status: "error", message: error.message });
//       return;
//     }
//     res.status(204);
//   });
// };

usersRouter.get("/:userId", getUser);
usersRouter.post("/", addUser);

module.exports = usersRouter;
