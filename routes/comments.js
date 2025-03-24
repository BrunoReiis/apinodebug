import express from "express";
import { db } from "../firebase.js";

const router = express.Router();
const projectsCollection = db.collection("projects");

router.post("/projects/:projectId/bugs/:bugId/createcomment", async (req, res) => {
  const { comment, userid } = req.body;
  const { projectId, bugId } = req.params;

  if (!comment || !userid) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const commentData = {
      userid,
      comment,
      timestamp: new Date(),
    };

    const commentRef = await projectsCollection
      .doc(projectId)
      .collection("bugs")
      .doc(bugId)
      .collection("comments")
      .add(commentData);

    res.status(201).json({ id: commentRef.id, ...commentData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error adding comment" });
  }
});

router.get("/projects/:projectId/bugs/:bugId/comments", async (req, res) => {
  const { projectId, bugId } = req.params;

  try {
    const commentsSnapshot = await projectsCollection
      .doc(projectId)
      .collection("bugs")
      .doc(bugId)
      .collection("comments")
      .orderBy("timestamp", "asc")
      .get();

    const comments = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching comments" });
  }
});

router.delete("/projects/:projectId/bugs/:bugId/comments/:commentId", async (req, res) => {
  const { projectId, bugId, commentId } = req.params;

  try {
    const commentRef = projectsCollection
      .doc(projectId)
      .collection("bugs")
      .doc(bugId)
      .collection("comments")
      .doc(commentId);

    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await commentRef.delete();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting comment" });
  }
});

export default router;
