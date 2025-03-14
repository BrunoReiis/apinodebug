import express from 'express'
import routes from './routes.js'

const app = express()

app.use(express.json())

Object.entries(routes).forEach(([path, router]) => {
    app.use(path, router);
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'))
