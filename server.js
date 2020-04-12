const express = require('express')

const app = express()

const PORT = process.env.PORT || 1337

app.listen(PORT, () => console.log(`Connected to port ${PORT}`))

app.get('/', (req, res) => res.send('API is A-Okay!'))
