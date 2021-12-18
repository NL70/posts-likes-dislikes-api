const express = require("express");
const { pool } = require("../config");

const dislikesRouter = express.Router({ mergeParams: true });

const addDislikes = (req, res) => {
  const postId = req.params.postId;
  const userId = req.session.user.id;
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
        if (error.constraint !== null) {
          if (error.constraint === "dislikes_post_id_user_id_key") {
            res
              .status(409)
              .json({ status: "error", message: "Post is already disliked" });
            return;
          }
        }
        res.status(500).json({ status: "error", message: error.message });
        return;
      }

      res.status(200).json({
        status: "Success",
        message: "Dislike added.",
        data: results.rows[0],
      });
    }
  );
};

const deleteDislikes = (req, res) => {
  const postId = req.params.postId;
  const userId = req.session.user.id;
  console.log("userId");
  console.log(userId);
  console.log("postId");
  console.log(postId);
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
