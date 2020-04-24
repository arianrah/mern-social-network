const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const request = require('request')
const config = require('config')

const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')

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

		try {
			let profile = await Profile.findOne({ user: req.user.id })
			if (profile) {
				// update
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				)
				return res.json(profile)
			}
			// create
			profile = new Profile(profileFields)
			await profile.save()
			res.json(profile)
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
	}
)

// @route   GET api/profile
// @desc    Get all profiles
// @access  public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar'])
		res.json(profiles)
	} catch (err) {
		console.error(err.message)
		res.status(500)
	}
})

// @route   GET api/profile
// @desc    Get all profiles
// @access  public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar'])
		res.json(profiles)
	} catch (err) {
		console.error(err.message)
		res.status(500)
	}
})

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id
		}).populate('user', ['name', 'avatar'])

		if (!profile) {
			return res.status(400).json({ message: 'Profile not found' })
		}
		res.json(profile)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

// @route   DELETE api/profile
// @desc    Delete profile, user, posts(eventually)
// @access  private
router.delete('/', auth, async (req, res) => {
	try {
		//remove posts
		await Post.deleteMany({ user: req.user.id })

		//remove profile
		await Profile.findOneAndRemove({ user: req.user.id })

		//remove user
		await User.findOneAndRemove({ _id: req.user.id })

		res.json({ message: 'User deleted' })
	} catch (err) {
		console.error(err.message)
		res.status(500)
	}
})

// @route     PUT api/profile/experience
// @desc      add profile experience
// @access    private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required')
				.not()
				.isEmpty(),
			check('company', 'Company is required')
				.not()
				.isEmpty(),
			check('from', 'From date is required and needs to be from the past')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { title, company, location, from, to, current, desc } = req.body

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			desc
		}

		try {
			const profile = await Profile.findOne({ user: req.user.id })

			profile.experience.unshift(newExp)

			await profile.save()

			res.json(profile)
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
	}
)

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience
// @access  private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id })

		//get remove index
		const removeIndex = profile.experience
			.map(item => item.id)
			.indexOf(req.params.exp_id)

		profile.experience.splice(removeIndex, 1)
		await profile.save()
		res.json(profile)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is required')
				.not()
				.isEmpty(),
			check('degree', 'Degree is required')
				.not()
				.isEmpty(),
			check('fieldofstudy', 'Field of study is required')
				.not()
				.isEmpty(),
			check('from', 'From date is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		const { school, degree, fieldofstudy, from, to, current, desc } = req.body
		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			desc
		}
		try {
			const profile = await Profile.findOne({ user: req.user.id })
			profile.education.unshift(newEdu)
			await profile.save()
			res.json(profile)
		} catch (err) {
			console.error(err.message)
			res.status(500).send('Server Error')
		}
	}
)

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education
// @access  private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id })

		//get remove index
		const removeIndex = profile.education
			.map(item => item.id)
			.indexOf(req.params.edu_id)

		profile.education.splice(removeIndex, 1)
		await profile.save()
		res.json(profile)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

// @route   GET api/profile/github/:username
// @desc    get users github repo
// @access  public
router.get('/github/:username', (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created: asc&client_id=${config.get(
				'githubClientId'
			)}&client_secret=${config.get('githubSecret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node-js' }
		}

		request(options, (error, response, body) => {
			if (error) console.error(error)

			if (response.statusCode !== 200) {
				return res.status(404).json({ message: 'No github profile found' })
			}
			res.json(JSON.parse(body))
		})
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

module.exports = router
