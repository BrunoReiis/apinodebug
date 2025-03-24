import express from "express";
import { db } from "../firebase.js";

const usersCollection = db.collection("users");
const projectsCollection = db.collection("projects");
const teamsCollection = db.collection("teams");

const router = express.Router();

router.post("/createproject", async (req, res) => {
  const { title, description, priority, user, status, team } = req.body;

  if (!title || !description || !priority || !user || !status || !team) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const userDoc = await usersCollection.doc(user).get();
    const userData = userDoc.data();

    if (!userData) {
      return res.status(400).json({ error: "User not found" });
    }

    const userName = userData.name;

    const projectReport = {
      title: title.toLowerCase(),
      description,
      priority: priority.toLowerCase(),
      iduser: user,
      nameUser: userName.toLowerCase(),
      status: status.toLowerCase(),
      team: team,
      created: new Date(),
    };

    const projectReportRef = await projectsCollection.add(projectReport);
    res.status(201).json({ id: projectReportRef.id, ...projectReport });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating a project" });
  }
});

router.delete("/projects/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const projectRef = projectsCollection.doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const bugsSnapshot = await projectRef.collection("bugs").get();
    for (const bugDoc of bugsSnapshot.docs) {
      const commentsSnapshot = await bugDoc.ref.collection("comments").get();
      for (const commentDoc of commentsSnapshot.docs) {
        await commentDoc.ref.delete();
      }

      const historySnapshot = await bugDoc.ref
        .collection("historychange")
        .get();
      for (const historyDoc of historySnapshot.docs) {
        await historyDoc.ref.delete();
      }

      await bugDoc.ref.delete();
    }

    const projectHistorySnapshot = await projectRef
      .collection("historychange")
      .get();
    for (const historyDoc of projectHistorySnapshot.docs) {
      await historyDoc.ref.delete();
    }

    await projectRef.delete();

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Error deleting project" });
  }
});

router.get("/getprojects", async (req, res) => {
  try {
    const snapshot = await projectsCollection.get();
    const projects = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const projectData = doc.data();
        let teamInfo = null;

        if (projectData.team) {
          const teamDoc = await teamsCollection.doc(projectData.team).get();
          if (teamDoc.exists) {
            teamInfo = { id: teamDoc.id, name: teamDoc.data().name };
          }
        }

        return { id: doc.id, ...projectData, team: teamInfo};
      })
    );
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Error searching projects" });
  }
});

export default router;
