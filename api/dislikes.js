const express = require("express");
const { pool } = require("../config");

const dislikesRouter = express.Router();

const addDislikes = (req, res) => {
  const { postId, userId } = req.body;
  if (!postId || !userId) {
    res
      .status(400)
      .json({ status: "error", message: "Post ID/User ID cannot be empty." });
    return;
  }
  pool.query(
    "INSERT INTO dislikes (post_id, user_id) VALUES ($1, $2) RETURNING *",
    [postId, userId],
    (error, results) => {
      if (error) {
        res.status(500).json({ status: "error", message: error.message });
        return;
      }
      res.status(201).json({
        status: "Success",
        message: "Dislike added.",
        data: results.rows[0],
      });
    }
  );
};

const deleteDislikes = (req, res) => {
  const { postId, userId } = req.body;
  if (!postId || !userId) {
    res
      .status(400)
      .json({ status: "error", message: "Post ID/User ID cannot be empty." });
    return;
  }
  pool.query(
    "DELETE FROM dislikes WHERE post_id = $1 AND user_id = $2",
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
        message: "Dislike deleted.",
      });
    }
  );
};

// likesRouter.get("/:postId", getLikes);
dislikesRouter.post("/", addDislikes);
dislikesRouter.delete("/", deleteDislikes);

module.exports = dislikesRouter;
