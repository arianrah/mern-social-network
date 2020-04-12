const express = require('express')
const connectDB = require('./config/db')

const app = express()
const PORT = process.env.PORT || 1337

//Connect to atlas
connectDB()

app.listen(PORT, () => console.log(`Connected to port ${PORT}`))

app.get('/', (req, res) => res.send('API is A-Okay!'))
