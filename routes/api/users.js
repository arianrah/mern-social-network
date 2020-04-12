const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')

//@route    POST api/users
//@desc     Registers user
//@access   Public

router.post(
	'/',
	[
		check('name', 'Name is required')
			.not()
			.isEmpty(),
		check('email', 'Please include a valid email')
			.not()
			.isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more charecters'
		).isLength({ min: 6 })
	],
	(req, res) => {
		// console.log(req.body)
		const error = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
    }
    


    
		res.send('Users route')
	}
)

module.exports = router
