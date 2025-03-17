import express from "express";
import db from "../firebase.js";

const router = express.Router();
const bugsCollection = db.collection("bugs");
const usersCollection = db.collection("users");

router.post("/createcomment", async (req, res) => {
  const { comment, userid, bugid } = req.body;

  if (!comment || !userid || !bugid) {
    return res.status(400).json({ error: "incomplete data" });
  }

  const userDoc = await usersCollection.doc(userid).get();
  const userData = userDoc.data();

  if (!userData) {
    return res.status(400).json({ error: "User not found" });
  }

  try {
    const bugDoc = await bugsCollection.doc(bugid).get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug not found" });
    }

    const commentRef = bugsCollection.doc(bugid).collection("comments").doc();
    const commentData = {
      id: commentRef.id,
      userid,
      comment,
      timestamp: new Date(),
    };

    await commentRef.set(commentData);
    res.status(201).json({
      message: "Comment saved",
      commentId: commentRef.id,
    });
  } catch (error) {
    res.status(500).json({ error: "Error saving a comment" });
  }
});

router.get("/getcomments/:bugid", async (req, res) => {
  const { bugid } = req.params;

  try {
    const commentsSnapshot = await bugsCollection
      .doc(bugid)
      .collection("comments")
      .get();
    const comments = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Error searching comments" });
  }
});

router.get("/getcomment/:bugid/:commentid", async (req, res) => {
  const { bugid, commentid } = req.params;

  try {
    const commentDoc = await bugsCollection
      .doc(bugid)
      .collection("comments")
      .doc(commentid)
      .get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ id: commentDoc.id, ...commentDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Error searching a comment" });
  }
});

router.delete("/deletecomment/:bugid/:commentid", async (req, res) => {
  const { bugid, commentid } = req.params;

  try {
    const commentRef = bugsCollection
      .doc(bugid)
      .collection("comments")
      .doc(commentid);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await commentRef.delete();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment" });
  }
});

export default router;
