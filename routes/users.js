import express from "express";
import {db, auth} from "../firebase.js";

const router = express.Router();
const usersCollection = db.collection("users");
const teamsCollection = db.collection("teams");

router.post("/createuser", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    const newUser = {
      uid: userRecord.uid,
      name: name.toLowerCase(),
      email: email.toLowerCase(),
    };

    await usersCollection.doc(userRecord.uid).set(newUser);

    res.status(201).json({ id: userRecord.uid, name, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const { uid, email } = decodedToken;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

    res.status(200).json({
      uid,
      email,
      name: userData.name,
      role: userData.role,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.get("/getusers", async (req, res) => {
  try {
    const snapshot = await usersCollection.get();
    const users = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const userData = doc.data();
        let teamInfo = null;
        
        if (userData.teamId) {
          const teamDoc = await teamsCollection.doc(userData.teamId).get();
          if (teamDoc.exists) {
            teamInfo = { id: teamDoc.id, name: teamDoc.data().name };
          }
        }

        return { id: doc.id, ...userData, team: teamInfo };
      })
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error searching users" });
  }
});

router.get("/getuser/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userDoc = await usersCollection.doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    let teamInfo = null;

    if (userData.teamId) {
      const teamDoc = await teamsCollection.doc(userData.teamId).get();
      if (teamDoc.exists) {
        teamInfo = { id: teamDoc.id, name: teamDoc.data().name };
      }
    }

    res.json({ id: userDoc.id, ...userData, team: teamInfo });
  } catch (error) {
    res.status(500).json({ error: "Error searching a user" });
  }
});


router.delete("/deleteuser/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userDoc = await usersCollection.doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await usersCollection.doc(userId).delete();
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting a user" });
  }
});

router.get("/getuserbyrole/:role", async (req, res) => {
  try {
    const role = req.params.role.toLowerCase();
    const snapshot = await usersCollection.where("role", "==", role).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error searching users" });
  }
});

router.get("/getuserbyname/:name", async (req, res) => {
  try {
    const name = req.params.name.toLowerCase();
    const snapshot = await usersCollection.where("name", "==", name).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error searching a user" });
  }
});

export default router;
