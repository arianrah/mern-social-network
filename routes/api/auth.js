const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

const User = require('../../models/User')

// @route     GET api/auth
// @desc      Authentication route
// @access    Public
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password')
		res.json(user)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})



// @route     POST api/auth
// @desv      Authenticate user & get token
// @access    Public
router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is require').exists()
	],
	async (req, res) => {
		// console.log(req.body)
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { email, password } = req.body

		try {
			//check if user exists
			let user = await User.findOne({ email })

			if (!user) {
				return res.status(400).json({ errors: [{ message: 'Invalid Login' }] })
			}

			const isMatch = await bcrypt.compare(password, user.password)

			if (!isMatch) {
				return res.status(400).json({ errors: [{ message: 'Invalid Login' }] })
			}

			const payload = {
				user: {
					id: user.id
				}
			}

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err
					res.json({ token })
				}
			)
			// res.send('User Registered')
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error (Registration)')
		}

		// res.send('Users route')
	}
)

module.exports = router
