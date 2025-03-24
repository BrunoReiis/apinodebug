import express from "express";
import { db } from "../firebase.js";

const router = express.Router();
const projectsCollection = db.collection("projects");

router.post("/projects/:projectId/bugs/:bugId/commitchange", async (req, res) => {
  const { userChange, title, description, priority, iduser, status } = req.body;
  const { projectId, bugId } = req.params;

  if (!userChange || !title || !description || !priority || !iduser || !status) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const bugRef = projectsCollection.doc(projectId).collection("bugs").doc(bugId);
    const bugDoc = await bugRef.get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug not found" });
    }

    const bugData = bugDoc.data();
    let changes = [];

    if (bugData.title !== title) {
      changes.push({ field: "title", oldValue: bugData.title, newValue: title });
    }
    if (bugData.description !== description) {
      changes.push({ field: "description", oldValue: bugData.description, newValue: description });
    }
    if (bugData.priority !== priority) {
      changes.push({ field: "priority", oldValue: bugData.priority, newValue: priority });
    }
    if (bugData.status !== status) {
      changes.push({ field: "status", oldValue: bugData.status, newValue: status });
    }
    
    if (changes.length === 0) {
      return res.status(200).json({ message: "No changes detected" });
    }

    await bugRef.update({ title, description, priority, status });

    const historyRef = await bugRef.collection("historychange").add({
      userChange,
      changes,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Bug change committed", historyId: historyRef.id });
  } catch (error) {
    console.error("Error updating bug:", error);
    res.status(500).json({ error: "Error updating bug" });
  }
});

router.get("/projects/:projectId/bugs/:bugId/history", async (req, res) => {
  const { projectId, bugId } = req.params;

  try {
    const historySnapshot = await projectsCollection
      .doc(projectId)
      .collection("bugs")
      .doc(bugId)
      .collection("historychange")
      .orderBy("timestamp", "desc")
      .get();

    const history = historySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching bug history:", error);
    res.status(500).json({ error: "Error fetching bug history" });
  }
});

router.post("/projects/:projectId/commitchange", async (req, res) => {
  const { userChange, title, description, priority, status } = req.body;
  const { projectId } = req.params;

  if (!userChange || !title || !description || !priority || !status) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const projectRef = projectsCollection.doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const projectData = projectDoc.data();
    let changes = [];

    if (projectData.title !== title) {
      changes.push({ field: "title", oldValue: projectData.title, newValue: title });
    }
    if (projectData.description !== description) {
      changes.push({ field: "description", oldValue: projectData.description, newValue: description });
    }
    if (projectData.priority !== priority) {
      changes.push({ field: "priority", oldValue: projectData.priority, newValue: priority });
    }
    if (projectData.status !== status) {
      changes.push({ field: "status", oldValue: projectData.status, newValue: status });
    }

    if (changes.length === 0) {
      return res.status(200).json({ message: "No changes detected" });
    }

    await projectRef.update({ title, description, priority, status });

    const historyRef = await projectRef.collection("historychange").add({
      userChange,
      changes,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Project change committed", historyId: historyRef.id });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Error updating project" });
  }
});

router.get("/projects/:projectId/history", async (req, res) => {
  const { projectId } = req.params;

  try {
    const historySnapshot = await projectsCollection
      .doc(projectId)
      .collection("historychange")
      .orderBy("timestamp", "desc")
      .get();

    const history = historySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching project history:", error);
    res.status(500).json({ error: "Error fetching project history" });
  }
});

export default router;
