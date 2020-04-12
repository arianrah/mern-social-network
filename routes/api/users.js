const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')

const User = require('../../models/User')

//@route    POST api/users
//@desc     Registers user
//@access   Public

router.post(
	'/',
	[
		check('name', 'Name is required')
			.not()
			.isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more charecters'
		).isLength({ min: 6 })
	],
	async (req, res) => {
		// console.log(req.body)
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { name, email, password } = req.body

		try {
			//check if user exists
			let user = await User.findOne({ email })

			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] })
			}

			//get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			})

			user = new User({
				name,
				email,
				avatar,
				password
			})

			//bcrypt
			const salt = await bcrypt.genSalt(10)
			user.password = await bcrypt.hash(password, salt)

			//registration sends
			await user.save()

			//return jwt
			res.send('User Registered')
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error (Registration)')
		}

		res.send('Users route')
	}
)

module.exports = router
