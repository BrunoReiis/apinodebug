import express from "express";
import db from "../firebase.js";

const router = express.Router();
const usersCollection = db.collection("users");
const bugsCollection = db.collection("bugs");

router.post("/createbugreport", async (req, res) => {
  const { titulo, descricao, prioridade, responsavel, status } = req.body;

  try {
    const userDoc = await usersCollection.doc(responsavel).get();
    const userData = userDoc.data();

    if (!userData) {
      return res.status(400).json({ error: "Responsável não encontrado" });
    }

    const userName = userData.name;

    const bugReport = {
      titulo,
      descricao,
      prioridade,
      idresponsavel: responsavel,
      nomeresponsavel: userName,
      status,
      criadoEm: new Date(),
    };

    const bugDocRef = await bugsCollection.add(bugReport);
    res.status(201).json({ id: bugDocRef.id, ...bugReport });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao salvar usuário" });
  }
});

router.get("/getbugs", async (req, res) => {
  try {
    const snapshot = await bugsCollection.get();
    const bugs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar bugs" });
  }
});

router.get("/getbug/:id", async (req, res) => {
  try {
    const bugId = req.params.id;
    const bugDoc = await bugsCollection.doc(bugId).get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug não encontrado" });
    }

    res.json({ id: bugDoc.id, ...bugDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar bug" });
  }
});

router.delete("/deletebug/:id", async (req, res) => {
  try {
    const bugId = req.params.id;
    const bugDoc = await bugsCollection.doc(bugId).get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug não encontrado" });
    }

    await bugsCollection.doc(bugId).delete();
    res.json({ message: "Bug deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar Bug" });
  }
});

export default router;
