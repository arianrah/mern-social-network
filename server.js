const express = require('express')
const connectDB = require('./config/db')

const app = express()
const PORT = process.env.PORT || 1337

//Connect to atlas
connectDB()

//Def Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))
app.use('/api/auth', require('./routes/api/auth'))

app.listen(PORT, () => console.log(`Connected to port ${PORT}`))
app.get('/', (req, res) => res.send('API is A-Okay!'))
