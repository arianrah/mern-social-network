const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route     GET api/profile/me
// @desc      Profile of current user
// @access    private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id
		}).populate('user', ['name', 'avatar'])

		if (!profile) {
			return res.status(400).json({ message: 'No profile for user' })
		}

		res.json(profile)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

// @route   POST api/profile
// @desc    Create or update user profile
// @access  private
router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required')
				.not()
				.isEmpty(),
			check('skills', 'Skills is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubuser,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin
		} = req.body

		//build profile object + check
		const profileFields = {}
		profileFields.user = req.user.id
		if (company) profileFields.company = company
		if (website) profileFields.website = website
		if (location) profileFields.location = location
		if (bio) profileFields.bio = bio
		if (status) profileFields.status = status
		if (githubuser) profileFields.githubuser = githubuser
		if (skills) {
			profileFields.skills = skills.split(',').map(skill => skill.trim())
		}
		// console.log(profileFields.skills)
		// res.send('Hit')

		//build social object
		profileFields.social = {}
		if (youtube) profileFields.social.youtube = youtube
		if (facebook) profileFields.social.facebook = facebook
		if (twitter) profileFields.social.twitter = twitter
		if (instagram) profileFields.social.instagram = instagram
		if (linkedin) profileFields.social.linkedin = linkedin
	}
)

module.exports = router
