import express from "express";
import { db } from "../firebase.js";

const router = express.Router();
const teamsCollection = db.collection("teams");
const usersCollection = db.collection("users");

router.post("/createteam", async (req, res) => {
  const { name, description, powerLevel } = req.body;

  if (!name || !description || !powerLevel) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const teamData = {
      name: name.toLowerCase(),
      description,
      powerLevel,
      created: new Date(),
    };

    const teamRef = await teamsCollection.add(teamData);
    res.status(201).json({ id: teamRef.id, ...teamData });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Error creating team" });
  }
});

router.post("/assignteam", async (req, res) => {
  const { userId, teamId } = req.body;

  if (!userId || !teamId) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const userRef = usersCollection.doc(userId);
    await userRef.update({ teamId });
    res.status(200).json({ message: "Team assigned to user" });
  } catch (error) {
    console.error("Error assigning team:", error);
    res.status(500).json({ error: "Error assigning team" });
  }
});

router.put("/editteam/:teamId", async (req, res) => {
  const { teamId } = req.params;
  const { name, description, powerLevel } = req.body;

  try {
    const teamRef = teamsCollection.doc(teamId);
    await teamRef.update({ name, description, powerLevel });
    res.status(200).json({ message: "Team updated successfully" });
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Error updating team" });
  }
});

router.delete("/deleteteam/:teamId", async (req, res) => {
  const { teamId } = req.params;

  try {
    const teamRef = teamsCollection.doc(teamId);
    await teamRef.delete();
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ error: "Error deleting team" });
  }
});

router.get("/getTeams", async (req, res) => {
    try {
      const teamsSnapshot = await db.collection("teams").get(); // Busca times no Firestore
      const teams = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

export default router;
