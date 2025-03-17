import express from 'express'
import routes from './routes.js'

const app = express()
const port = 3000

app.use(express.json())

Object.entries(routes).forEach(([path, router]) => {
    app.use(path, router);
});

app.listen(port, () => console.log(`Api on port ${port}`));