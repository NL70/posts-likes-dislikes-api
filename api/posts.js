const express = require("express");
const { pool } = require("../config");

const postsRouter = express.Router();

const getPosts = (req, res) => {
  pool.query(
    `SELECT posts.id, title, content, username,
    (SELECT COUNT(*) as like_count FROM likes WHERE post_id=posts.id),
    (SELECT COUNT(*) as dislike_count FROM dislikes WHERE post_id=posts.id)
    FROM posts 
    JOIN users
    ON posts.user_id = users.id
    WHERE posts.id = posts.id;
    `,
    (error, results) => {
      if (error) {
        res.status(500).json({ status: "error", message: error.message });
        return;
      }
      res.status(200).json({ data: results.rows });
    }
  );
};

const addPosts = (req, res) => {
  const { title, content, userId } = req.body;
  if (!title || !content) {
    res
      .status(400)
      .json({ status: "error", message: "Title/Content cannot be empty." });
    return;
  }
  pool.query(
    "INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
    [title, content, userId],
    (error, results) => {
      if (error) {
        if (
          error.constraint !== null &&
          error.constraint === "posts_user_id_fkey"
        ) {
          res
            .status(400)
            .json({ status: "error", message: "User does not exist" });
          return;
        }
        res.status(500).json({ status: "error", message: error.message });
        return;
      }
      res.status(201).json({
        status: "Success",
        message: "Post added.",
        data: results.rows[0],
      });
    }
  );
};

const deletePosts = (req, res) => {
  const postsId = req.params.postId;
  pool.query("DELETE FROM posts WHERE id = $1", [postsId], (error, results) => {
    if (results.rowCount === 0) {
      res
        .status(404)
        .json({ status: "error", message: "Post does not exist." });
      return;
    }
    if (error) {
      res.status(500).json({ status: "error", message: error.message });
      return;
    }
    res.status(204);
  });
};

postsRouter.get("/", getPosts);
postsRouter.post("/", addPosts);
postsRouter.delete("/:postId", deletePosts);

module.exports = postsRouter;
