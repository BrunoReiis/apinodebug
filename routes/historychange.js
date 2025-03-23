import express from "express";
import { db } from "../firebase.js";

const router = express.Router();
const usersCollection = db.collection("users");
const bugsCollection = db.collection("bugs");

router.post("/commitchange", async (req, res) => {
  const { userChange, title, description, priority, iduser, status, bugid } =
    req.body;

  if (
    !userChange ||
    !title ||
    !description ||
    !priority ||
    !iduser ||
    !status ||
    !bugid
  ) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const bugDoc = await bugsCollection.doc(bugid).get();

    if (!bugDoc.exists) {
      return res.status(404).json({ error: "Bug not found" });
    }

    const bugData = bugDoc.data();
    let updates = {};
    let changes = [];

    if (bugData.title !== title) {
      updates.title = title;
      changes.push({
        field: "title",
        oldValue: bugData.title,
        newValue: title,
      });
    }
    if (bugData.description !== description) {
      updates.description = description;
      changes.push({
        field: "description",
        oldValue: bugData.description,
        newValue: description,
      });
    }
    if (bugData.priority !== priority) {
      updates.priority = priority;
      changes.push({
        field: "priority",
        oldValue: bugData.priority,
        newValue: priority,
      });
    }
    if (bugData.iduser !== iduser) {
      const userDoc = await usersCollection.doc(iduser).get();
      const userData = userDoc.data();
      updates.nameUser = userData.name
      updates.iduser = iduser;
      changes.push({ field: "iduser", oldValue: bugData.iduser, newValue: iduser });
      changes.push({ field: "nameUser", oldValue: bugData.nameUser, newValue: userData.name });
    }
    if (bugData.status !== status) {
      updates.status = status;
      changes.push({
        field: "status",
        oldValue: bugData.status,
        newValue: status,
      });
    }

    if (changes.length === 0) {
      return res.status(200).json({ message: "No changes detected" });
    }

    const userDoc = await usersCollection.doc(userChange).get();
    const userData = userDoc.data();
    const userRole = userData ? userData.role : "unknown";

    await bugsCollection.doc(bugid).update(updates);

    const historychangeRef = bugsCollection
      .doc(bugid)
      .collection("historychange")
      .doc();
    const historyData = {
      id: historychangeRef.id,
      userChange: userChange,
      userRole: userRole,
      userName: userData.name,
      changes,
      timestamp: new Date(),
    };

    await historychangeRef.set(historyData);

    res.status(200).json({
      message: "Bug updated and history saved",
      historyID: historychangeRef.id,
    });
  } catch (error) {
    console.error("Error updating bug:", error);
    res.status(500).json({ error: "Error updating bug" });
  }
});

export default router;
