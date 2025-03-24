import express from "express";
import { db } from "../firebase.js";

const router = express.Router();
const projectsCollection = db.collection("projects");

router.post("/projects/:projectId/createbugreport", async (req, res) => {
  const { title, description, priority, user, status } = req.body;
  const { projectId } = req.params;

  if (!title || !description || !priority || !user || !status) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const projectDoc = await projectsCollection.doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const bugData = {
      title: title.toLowerCase(),
      description,
      priority: priority.toLowerCase(),
      iduser: user,
      status: status.toLowerCase(),
      created: new Date(),
    };

    const bugRef = await projectsCollection
      .doc(projectId)
      .collection("bugs")
      .add(bugData);
    res.status(201).json({ id: bugRef.id, ...bugData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating bug" });
  }
});

router.put("/projects/:projectId/bugs/:bugId", async (req, res) => {
  const { title, description, priority, status } = req.body;
  const { projectId, bugId } = req.params;

  try {
    const bugRef = projectsCollection.doc(projectId).collection("bugs").doc(bugId);
    const bugDoc = await bugRef.get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug not found" });
    }

    await bugRef.update({ title, description, priority, status });
    res.status(200).json({ message: "Bug updated successfully" });
  } catch (error) {
    console.error("Error updating bug:", error);
    res.status(500).json({ error: "Error updating bug" });
  }
});

router.delete("/projects/:projectId/bugs/:bugId", async (req, res) => {
  const { projectId, bugId } = req.params;

  try {
    const bugRef = projectsCollection.doc(projectId).collection("bugs").doc(bugId);
    const bugDoc = await bugRef.get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug not found" });
    }

    await bugRef.delete();
    res.status(200).json({ message: "Bug deleted successfully" });
  } catch (error) {
    console.error("Error deleting bug:", error);
    res.status(500).json({ error: "Error deleting bug" });
  }
});

router.get("/projects/:projectId/bugs", async (req, res) => {
  const { projectId } = req.params;

  try {
    const bugsSnapshot = await projectsCollection.doc(projectId).collection("bugs").get();
    const bugs = bugsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(bugs);
  } catch (error) {
    console.error("Error fetching bugs:", error);
    res.status(500).json({ error: "Error fetching bugs" });
  }
});

router.get("/projects/getallbugs", async (req, res) => {
  try {
    const projectsSnapshot = await projectsCollection.get();
    let allBugs = [];

    for (const projectDoc of projectsSnapshot.docs) {
      const bugsSnapshot = await projectDoc.ref.collection("bugs").get();
      const bugs = bugsSnapshot.docs.map((doc) => ({
        id: doc.id,
        projectId: projectDoc.id,
        ...doc.data(),
      }));
      allBugs = [...allBugs, ...bugs];
    }

    res.json(allBugs);
  } catch (error) {
    res.status(500).json({ error: "Error fetching all bugs" });
  }
});

router.get("/projects/:projectId/bugs/priority/:priority", async (req, res) => {
  const { projectId, priority } = req.params;

  try {
    const bugsSnapshot = await projectsCollection.doc(projectId).collection("bugs").where("priority", "==", priority.toLowerCase()).get();
    const bugs = bugsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(bugs);
  } catch (error) {
    console.error("Error fetching bugs by priority:", error);
    res.status(500).json({ error: "Error fetching bugs" });
  }
});

router.get("/projects/:projectId/bugs/status/:status", async (req, res) => {
  const { projectId, status } = req.params;

  try {
    const bugsSnapshot = await projectsCollection.doc(projectId).collection("bugs").where("status", "==", status.toLowerCase()).get();
    const bugs = bugsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(bugs);
  } catch (error) {
    console.error("Error fetching bugs by status:", error);
    res.status(500).json({ error: "Error fetching bugs" });
  }
});


router.get("/projects/:projectId/bugs/title/:title", async (req, res) => {
  const { projectId, title } = req.params;

  try {
    const bugsSnapshot = await projectsCollection.doc(projectId).collection("bugs").where("title", "==", title.toLowerCase()).get();
    const bugs = bugsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(bugs);
  } catch (error) {
    console.error("Error fetching bugs by title:", error);
    res.status(500).json({ error: "Error fetching bugs" });
  }
});

export default router;
