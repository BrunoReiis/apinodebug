import express from "express";
import db from "../firebase.js";

const router = express.Router();
const usersCollection = db.collection("users");
const bugsCollection = db.collection("bugs");

router.post("/createbugreport", async (req, res) => {
  const { title, description, priority, user, status } = req.body;

  if (
    !title ||
    !description ||
    !priority ||
    !user ||
    !status
  ) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const userDoc = await usersCollection.doc(user).get();
    const userData = userDoc.data();

    if (!userData) {
      return res.status(400).json({ error: "User not found" });
    }

    const userName = userData.name;

    const bugReport = {
      title: title.toLowerCase(),
      description,
      priority: priority.toLowerCase(),
      iduser: user,
      nameUser: userName.toLowerCase(),
      status: status.toLowerCase(),
      created: new Date(),
    };

    const bugDocRef = await bugsCollection.add(bugReport);
    res.status(201).json({ id: bugDocRef.id, ...bugReport });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error saving a bug" });
  }
});

router.get("/getbugs", async (req, res) => {
  try {
    const snapshot = await bugsCollection.get();
    const bugs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (!bugs) {
      return res.status(404).json({ error: "Bug not found" });
    }

    res.json(bugs);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error searching for bugs" });
  }
});

router.get("/getbug/:id", async (req, res) => {
  try {
    const bugId = req.params.id;
    const bugDoc = await bugsCollection.doc(bugId).get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug not found" });
    }

    res.json({ id: bugDoc.id, ...bugDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Error when searching for a bug" });
  }
});

router.delete("/deletebug/:id", async (req, res) => {
  try {
    const bugId = req.params.id;
    const bugDoc = await bugsCollection.doc(bugId).get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug not found" });
    }

    await bugsCollection.doc(bugId).delete();
    res.json({ message: "Bug deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting a bug" });
  }
});

router.get('/getbugbypriority/:priority', async (req, res) => {
  try {
      const priority = req.params.priority.toLowerCase();
      const snapshot = await bugsCollection.where('priority', '==', priority).get();

      if (snapshot.empty) {
          return res.status(404).json({ error: 'Bug not found' });
      }

      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: 'Error searching for a bug (priority)' });
  }
});

router.get('/getbugbystatus/:status', async (req, res) => {
  try {
      const status = req.params.status.toLowerCase();
      const snapshot = await bugsCollection.where('status', '==', status).get();

      if (snapshot.empty) {
          return res.status(404).json({ error: 'Bug not found' });
      }

      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: 'Error searching for a bug (status)' });
  }
});

router.get('/getbugbytitle/:title', async (req, res) => {
  try {
      const title = req.params.title.toLowerCase();
      const snapshot = await bugsCollection.where('title', '==', title).get();

      if (snapshot.empty) {
          return res.status(404).json({ error: 'Bug not found' });
      }

      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: 'Error searching for a bug (title)' });
  }
});

export default router;
