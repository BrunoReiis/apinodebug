import express from 'express'
import db from '../firebase.js'

const router = express.Router()
const usersCollection = db.collection('users')

router.post('/createuser', async (req, res) => {
    const { name, email, cargo } = req.body

    const newUser = {
        name: name.toLowerCase(), 
        email: email.toLowerCase(), 
        cargo: cargo.toLowerCase()
    }

    try {
        const docRef = await usersCollection.add(newUser)
        res.status(201).json({ id: docRef.id, name, email, cargo })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar usuário' })
    }
})

router.get('/getusers', async (req, res) => {

    try {
        const snapshot = await usersCollection.get()
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' })
    }
})

router.get('/getuser/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const userDoc = await usersCollection.doc(userId).get()

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        res.json({ id: userDoc.id, ...userDoc.data() })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário' })
    }
})

router.delete('/deleteuser/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const userDoc = await usersCollection.doc(userId).get()

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        await usersCollection.doc(userId).delete()
        res.json({ message: 'Usuário deletado com sucesso' })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário' })
    }
})

router.get('/getuserbycargo/:cargo', async (req, res) => {
    try {
        const cargo = req.params.cargo.toLowerCase();
        const snapshot = await usersCollection.where('cargo', '==', cargo).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

router.get('/getuserbyname/:name', async (req, res) => {
    try {
        const name = req.params.name.toLowerCase();
        const snapshot = await usersCollection.where('name', '==', name).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

export default router
