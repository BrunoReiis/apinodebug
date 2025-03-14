import express from 'express'
import db from '../firebase.js'

const router = express.Router()
const usersCollection = db.collection('users')

router.post('/createuser', async (req, res) => {
    const { name, email } = req.body

    try {
        const docRef = await usersCollection.add({ name, email })
        res.status(201).json({ id: docRef.id, name, email })
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

export default router
