import express from "express";
import db from "../firebase.js";

const router = express.Router();
const bugsCollection = db.collection("bugs");

router.post("/createcomment", async (req, res) => {
  const { comment, userid, bugid } = req.body;

  if (!comment || !userid || !bugid) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    console.log("Recebendo comentário:", req.body);

    const bugDoc = await bugsCollection.doc(bugid).get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug não encontrado" });
    }

    const commentRef = bugsCollection.doc(bugid).collection("comments").doc();
    const commentData = {
      id: commentRef.id,
      userid,
      comment,
      timestamp: new Date(),
    };

    await commentRef.set(commentData);

    console.log("Comentário salvo com sucesso:", commentData);
    res.status(201).json({
      message: "Comentário salvo com sucesso",
      commentId: commentRef.id,
    });
  } catch (error) {
    console.error("Erro ao salvar comentário:", error);
    res.status(500).json({ error: "Erro ao salvar comentário" });
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
    res.status(500).json({ error: "Erro ao buscar comentários" });
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
      return res.status(404).json({ error: "Comentário não encontrado" });
    }

    res.json({ id: commentDoc.id, ...commentDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar comentário" });
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
      return res.status(404).json({ error: "Comentário não encontrado" });
    }

    await commentRef.delete();
    res.json({ message: "Comentário deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar comentário" });
  }
});

export default router;
