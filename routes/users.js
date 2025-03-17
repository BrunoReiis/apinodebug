import express from 'express'
import db from '../firebase.js'

const router = express.Router()
const usersCollection = db.collection('users')

router.post('/createuser', async (req, res) => {
    const { name, email, role } = req.body

    const newUser = {
        name: name.toLowerCase(), 
        email: email.toLowerCase(), 
        role: role.toLowerCase()
    }

    try {
        const docRef = await usersCollection.add(newUser)
        res.status(201).json({ id: docRef.id, name, email, role })
    } catch (error) {
        res.status(500).json({ error: 'Error saving a user' })
    }
})

router.get('/getusers', async (req, res) => {

    try {
        const snapshot = await usersCollection.get()
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: 'Error searching users' })
    }
})

router.get('/getuser/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const userDoc = await usersCollection.doc(userId).get()

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({ id: userDoc.id, ...userDoc.data() })
    } catch (error) {
        res.status(500).json({ error: 'Error searching a user' })
    }
})

router.delete('/deleteuser/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const userDoc = await usersCollection.doc(userId).get()

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' })
        }

        await usersCollection.doc(userId).delete()
        res.json({ message: 'User deleted' })
    } catch (error) {
        res.status(500).json({ error: 'Error deleting a user' })
    }
})

router.get('/getuserbyrole/:role', async (req, res) => {
    try {
        const role = req.params.role.toLowerCase();
        const snapshot = await usersCollection.where('role', '==', role).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'User not found' });
        }

        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error searching users' });
    }
});

router.get('/getuserbyname/:name', async (req, res) => {
    try {
        const name = req.params.name.toLowerCase();
        const snapshot = await usersCollection.where('name', '==', name).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'User not found' });
        }

        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error searching a user' });
    }
});

export default router
