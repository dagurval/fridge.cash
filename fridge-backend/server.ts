import express from 'express'
import cors from 'cors'

const PORT = process.env.PORT ?? 8080

const app = express()
app.use(cors())

app.get('/', (req, res, next) => {
    res.send('Hello from API')
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))