const express = require("express");
const { pool } = require("../config");

const likesRouter = express.Router({ mergeParams: true });

const addLikes = (req, res) => {
  console.log(req.params);
  console.log(req.session.user);
  const postId = req.params.postId;
  const userId = req.session.user.id;
  if (!postId || !userId) {
    res
      .status(400)
      .json({ status: "error", message: "Post ID/User ID cannot be empty." });
    return;
  }
  pool.query(
    "INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING *",
    [postId, userId],
    (error, results) => {
      if (error) {
        if (error.constraint !== null) {
          if (error.constraint === "likes_post_id_user_id_key") {
            res
              .status(409)
              .json({ status: "error", message: "Post is already liked" });
            return;
          }
        }
        res.status(500).json({ status: "error", message: error.message });
        return;
      }
      res.status(200).json({
        status: "Success",
        message: "Like added.",
        data: results.rows[0],
      });
    }
  );
};

const deleteLikes = (req, res) => {
  const postId = req.params.postId;
  const userId = req.session.user.id;
  if (!postId || !userId) {
    res
      .status(400)
      .json({ status: "error", message: "Post ID/User ID cannot be empty." });
    return;
  }
  pool.query(
    "DELETE FROM likes WHERE post_id = $1 AND user_id = $2",
    [postId, userId],
    (error, results) => {
      if (results.rowCount === 0) {
        res
          .status(404)
          .json({ status: "error", message: "Post/User does not exist." });
        return;
      }
      if (error) {
        res.status(500).json({ status: "error", message: error.message });
        return;
      }
      res.status(204).json({
        status: "Success",
        message: "Like deleted.",
      });
    }
  );
};

// likesRouter.get("/:postId", getLikes);
likesRouter.post("/", addLikes);
likesRouter.delete("/", deleteLikes);

module.exports = likesRouter;
