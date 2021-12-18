const express = require("express");
const { pool } = require("../config");

const postsRouter = express.Router();

const getPosts = (req, res) => {
  const userId = req.session || req.session.user || req.session.user.id;
  pool.query(
    `SELECT posts.id, title, content, username,
    (SELECT COUNT(*) as like_count FROM likes WHERE post_id=posts.id),
    (SELECT COUNT(*) as dislike_count FROM dislikes WHERE post_id=posts.id),
    (SELECT (CASE WHEN likes.user_id IS NULL THEN FALSE ELSE TRUE END) as is_liked FROM likes WHERE post_id=posts.id AND user_id=$1),
    (SELECT (CASE WHEN dislikes.user_id IS NULL THEN FALSE ELSE TRUE END) as is_disliked FROM dislikes WHERE post_id=posts.id AND user_id=$1)
    FROM posts 
    JOIN users
    ON posts.user_id = users.id
    WHERE posts.id = posts.id;
    `,
    [userId || null],
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
  const { title, content } = req.body;
  const userId = req.session.user.id;
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

const deletePosts = async (req, res) => {
  const postsId = req.params.postId;
  // user validation
  // userID = req.user.id

  try {
    await pool.query("BEGIN");
    const deleteLikesResults = await pool.query(
      "DELETE FROM likes WHERE post_id = $1;",
      [postsId]
    );

    const deleteDislikesResults = await pool.query(
      "DELETE FROM dislikes WHERE post_id = $1;",
      [postsId]
    );

    const deletePostsResults = await pool.query(
      "DELETE FROM posts WHERE id = $1;",
      [postsId]
    );
    await pool.query("COMMIT");
    res.status(204).json();
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};

postsRouter.get("/", getPosts);
postsRouter.post("/", addPosts);
postsRouter.delete("/:postId", deletePosts);

const likesRouter = require("./likes");
postsRouter.use("/:postId/likes", likesRouter);

const dislikesRouter = require("./dislikes");
postsRouter.use("/:postId/dislikes", dislikesRouter);

module.exports = postsRouter;
