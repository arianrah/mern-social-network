const express = require('express')
const connectDB = require('./config/db')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 1337

//Connect to atlas
connectDB()

//Init middleware
app.use(express.json({ extended: false }))

//Def Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))
app.use('/api/auth', require('./routes/api/auth'))

//serve static assets for productions
if (process.env.NODE_ENV === 'production') {
	// set staic folder
	app.use(express.static('client/build'))

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
	})
}

app.listen(PORT, () => console.log(`Connected to port ${PORT}`))
