import 'dotenv/config'
import express from 'express'
import dBfuncs from './DBcontroller'
import crypto from 'crypto'

const app = express()

app.use(express.json())

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	next()
})

const checkExistingUser = async (username, email) => {
	const [userData] = await dBfuncs.findUser(username, email)
	if (userData === undefined) return false
	else if (userData.username === username) return true
	else if (userData.email === email) return true
	else return false
}

const validateRegister = (username, password, email) => {
	if (!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) return false
	else if (username.length < 4 || password.length < 8) return false
	else return true
}

app.post('/forgotpassword', (req, res) => {
	if (req.body.email && req.body.password && req.body.confirmpassword) {
		if (req.body.password === req.body.confirmpassword) {
			checkExistingUser(undefined, req.body.email).then(exists => {
				if (exists) {
					dBfuncs.newPassword(req.body.email, req.body.password)
					res.send('Check your email')
				} else {
					res.send('User does not exist')
				}
			})
		} else {
			res.send('No')
		}
	} else {
		res.send('No')
	}
})

app.post('/login', async (req, res) => {
	if (req.body.username && req.body.password) {
		const [userData] = await dBfuncs.findUser(req.body.username)
		if (userData) {
			if (userData.username == req.body.username && userData.passwd == req.body.password) {
				if (userData.verified) {
					const loginToken = crypto.randomBytes(40).toString('hex')
					dBfuncs.loginUser(req.body.username, loginToken)
					res.send({ username: req.body.username, token: loginToken })
				} else {
					res.send('Email is not verified')
				}
			} else {
				res.send('Username or Password incorrect')
			}
		} else {
			res.send('Username or Password incorrect')
		}
	} else {
		res.sendStatus(406)
	}
})

app.get('/verifyemail', async (req, res) => {
	if (req.query.token && req.query.username) {
		const [userData] = await dBfuncs.findUser(req.query.username)
		if (userData) {
			if (userData.verified === 0) {
				if (req.query.token === userData.emailVerifyId) {
					dBfuncs.verifyUser(req.query.username)
					res.send('Verified successfully, now you can login')
				} else res.send('Do not try random combos')
			} else res.send('This user already verified')
		} else res.send('(-__-)')
	} else res.send('(-_-)')
})

app.get('/resetpassword', async (req, res) => {
	if (req.query.token && req.query.email) {
		const [userData] = await dBfuncs.findUser(undefined, req.query.email)
		if (userData) {
			if (req.query.token === userData.emailVerifyId) {
				dBfuncs.updatePassword(req.query.email, userData.new_passwd)
				res.send('Reset successful, now you can login. Your username is: ' + userData.username)
			} else res.send('Do not try random combos')
		} else res.send('(-__-)')
	} else res.send('(-_-)')
})

app.post('/register', (req, res) => {
	if (req.body.username && req.body.password && req.body.confirmpassword) {
		if (req.body.password === req.body.confirmpassword) {
			checkExistingUser(req.body.username, req.body.email).then(exists => {
				if (exists) res.send('User with this username/email already exists')
				else {
					if (validateRegister(req.body.username, req.body.password, req.body.email)) {
						dBfuncs.addUser(req.body.username, req.body.password, req.body.email)
						res.send('Registered')
					} else {
						res.send('Please enter valid username and/or password')
					}
				}
			})
		} else {
			res.sendStatus(406)
		}
	} else {
		res.sendStatus(406)
	}
})

app.listen(process.env.PORT || 3600, () => {
	console.log('Listening on port ' + process.env.PORT || 3600)
})
