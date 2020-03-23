'use strict'

require('dotenv/config')

var _express = _interopRequireDefault(require('express'))

var _DBcontroller = _interopRequireDefault(require('./DBcontroller'))

var _crypto = _interopRequireDefault(require('crypto'))

function _interopRequireDefault(obj) {
	return obj && obj.__esModule
		? obj
		: {
				default: obj,
		  }
}

function _slicedToArray(arr, i) {
	return (
		_arrayWithHoles(arr) ||
		_iterableToArrayLimit(arr, i) ||
		_unsupportedIterableToArray(arr, i) ||
		_nonIterableRest()
	)
}

function _nonIterableRest() {
	throw new TypeError(
		'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
	)
}

function _unsupportedIterableToArray(o, minLen) {
	if (!o) return
	if (typeof o === 'string') return _arrayLikeToArray(o, minLen)
	var n = Object.prototype.toString.call(o).slice(8, -1)
	if (n === 'Object' && o.constructor) n = o.constructor.name
	if (n === 'Map' || n === 'Set') return Array.from(n)
	if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen)
}

function _arrayLikeToArray(arr, len) {
	if (len == null || len > arr.length) len = arr.length

	for (var i = 0, arr2 = new Array(len); i < len; i++) {
		arr2[i] = arr[i]
	}

	return arr2
}

function _iterableToArrayLimit(arr, i) {
	if (typeof Symbol === 'undefined' || !(Symbol.iterator in Object(arr))) return
	var _arr = []
	var _n = true
	var _d = false
	var _e = undefined

	try {
		for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
			_arr.push(_s.value)

			if (i && _arr.length === i) break
		}
	} catch (err) {
		_d = true
		_e = err
	} finally {
		try {
			if (!_n && _i['return'] != null) _i['return']()
		} finally {
			if (_d) throw _e
		}
	}

	return _arr
}

function _arrayWithHoles(arr) {
	if (Array.isArray(arr)) return arr
}

var app = (0, _express.default)()
app.use(_express.default.json())
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	next()
})

var checkExistingUser = async function checkExistingUser(username, email) {
	var _await$dBfuncs$findUs = await _DBcontroller.default.findUser(username, email),
		_await$dBfuncs$findUs2 = _slicedToArray(_await$dBfuncs$findUs, 1),
		userData = _await$dBfuncs$findUs2[0]

	if (userData === undefined) return false
	else if (userData.username === username) return true
	else if (userData.email === email) return true
	else return false
}

var getUserDetails = async function getUserDetails(username) {
	var _await$dBfuncs$findUs = await _DBcontroller.default.findUser(username),
		_await$dBfuncs$findUs2 = _slicedToArray(_await$dBfuncs$findUs, 1),
		userData = _await$dBfuncs$findUs2[0]

	return userData
}

var validateRegister = function validateRegister(username, password, email) {
	if (!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) return false
	else if (username.length < 4 || password.length < 8) return false
	else return true
}

app.post('/forgotpassword', function(req, res) {
	if (req.body.email && req.body.password && req.body.confirmpassword) {
		if (req.body.password === req.body.confirmpassword) {
			checkExistingUser(undefined, req.body.email).then(function(exists) {
				if (exists) {
					_DBcontroller.default.newPassword(req.body.email, req.body.password)

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

async function verifyToken(username, token) {
	if (username && token) {
		var _await$dBfuncs$findUs = await _DBcontroller.default.findUser(username),
			_await$dBfuncs$findUs2 = _slicedToArray(_await$dBfuncs$findUs, 1),
			userData = _await$dBfuncs$findUs2[0]

		if (userData) {
			if (userData.loginToken === token) {
				return true
			} else return false
		} else return false
	} else false
}

app.post('/loginwithtoken', function(req, res) {
	verifyToken(req.body.username, req.body.token).then(function(valid) {
		if (valid) {
			res.send('Session Valid')
		} else res.send('Session invalid')
	})
})
app.post('/personalboards', async function(req, res) {
	verifyToken(req.body.username, req.body.token).then(async function(valid) {
		if (valid) {
			if (req.body.func === 'none') {
			} else if (req.body.func === 'new') {
				var _userData = await getUserDetails(req.body.username)

				await _DBcontroller.default.addNewPersonalBoard(req.body.boardName, _userData.id)
			} else if (req.body.func === 'delete') {
				await _DBcontroller.default.deleteBoard(req.body.boardId)
			} else {
				console.log('invalid function')
			}

			var userData = await getUserDetails(req.body.username)
			var response = await _DBcontroller.default.getPersonalBoards(userData.id)
			res.send(response)
		} else res.send('No')
	})
})
app.post('/createteam', async function(req, res) {
	verifyToken(req.body.username, req.body.token).then(async function(valid) {
		if (valid) {
			var response = await _DBcontroller.default.createTeam(req.body.teamName, req.body.username)
			if (response === 'Error matching existing team name') res.send('Error matching existing team name')
			else res.send('Success')
		} else res.send('No')
	})
})
app.post('/teams', async function(req, res) {
	verifyToken(req.body.username, req.body.token).then(async function(valid) {
		if (valid) {
			var response = await _DBcontroller.default.getTeams(req.body.username)
			res.send(response)
		} else res.send('No')
	})
})
app.post('/lists', async function(req, res) {
	verifyToken(req.body.username, req.body.token).then(async function(valid) {
		if (valid) {
			if (req.body.func === 'none') {
			} else if (req.body.func === 'new') {
				await _DBcontroller.default.addNewList(req.body.listName, req.body.boardId)
			} else if (req.body.func === 'delete') {
				//console.log(req.body)
				await _DBcontroller.default.deleteAList(req.body.listId)
			} else {
				console.log('invalid function')
			}

			setTimeout(async function() {
				var response = await _DBcontroller.default.getLists(req.body.boardId)
				res.send(response)
			}, 1000)
		} else res.send('No')
	})
})
app.post('/cards', async function(req, res) {
	verifyToken(req.body.username, req.body.token).then(async function(valid) {
		if (valid) {
			if (req.body.func === 'none') {
			} else if (req.body.func === 'new') {
				await _DBcontroller.default.addCard(req.body.cardName, req.body.listId, req.body.dueDate)
			} else if (req.body.func === 'delete') {
				await _DBcontroller.default.deleteCard(req.body.cardId)
			} else if (req.body.func === 'update') {
				await _DBcontroller.default.updateCard(
					req.body.cardId,
					req.body.cardName,
					null,
					req.body.dueDate,
					req.body.state
				)
			} else {
				console.log('invalid function')
			}

			var response = await _DBcontroller.default.getCards(req.body.listId)
			res.send(response)
		} else res.send('No')
	})
})
app.post('/logout', function(req, res) {
	verifyToken(req.body.username, req.body.token).then(function(valid) {
		if (valid) {
			_DBcontroller.default.logoutUser(req.body.username)

			res.send('Logout success')
		} else res.send('No')
	})
})
app.post('/login', async function(req, res) {
	if (req.body.username && req.body.password) {
		var _await$dBfuncs$findUs3 = await _DBcontroller.default.findUser(req.body.username),
			_await$dBfuncs$findUs4 = _slicedToArray(_await$dBfuncs$findUs3, 1),
			userData = _await$dBfuncs$findUs4[0]

		if (userData) {
			if (userData.username == req.body.username && userData.passwd == req.body.password) {
				if (userData.verified) {
					var loginToken = _crypto.default.randomBytes(40).toString('hex')

					_DBcontroller.default.loginUser(req.body.username, loginToken)

					res.send({
						username: req.body.username,
						token: loginToken,
					})
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
app.get('/verifyemail', async function(req, res) {
	if (req.query.token && req.query.username) {
		var _await$dBfuncs$findUs5 = await _DBcontroller.default.findUser(req.query.username),
			_await$dBfuncs$findUs6 = _slicedToArray(_await$dBfuncs$findUs5, 1),
			userData = _await$dBfuncs$findUs6[0]

		if (userData) {
			if (userData.verified === 0) {
				if (req.query.token === userData.emailVerifyId) {
					_DBcontroller.default.verifyUser(req.query.username)

					res.send('Verified successfully, now you can login')
				} else res.send('Do not try random combos')
			} else res.send('This user already verified')
		} else res.send('(-__-)')
	} else res.send('(-_-)')
})
app.get('/resetpassword', async function(req, res) {
	if (req.query.token && req.query.email) {
		var _await$dBfuncs$findUs7 = await _DBcontroller.default.findUser(undefined, req.query.email),
			_await$dBfuncs$findUs8 = _slicedToArray(_await$dBfuncs$findUs7, 1),
			userData = _await$dBfuncs$findUs8[0]

		if (userData) {
			if (req.query.token === userData.emailVerifyId) {
				_DBcontroller.default.updatePassword(req.query.email, userData.new_passwd)

				res.send('Reset successful, now you can login. Your username is: ' + userData.username)
			} else res.send('Do not try random combos')
		} else res.send('(-__-)')
	} else res.send('(-_-)')
})
app.post('/register', function(req, res) {
	if (req.body.username && req.body.password && req.body.confirmpassword) {
		if (req.body.password === req.body.confirmpassword) {
			checkExistingUser(req.body.username, req.body.email).then(function(exists) {
				if (exists) res.send('User with this username/email already exists')
				else {
					if (validateRegister(req.body.username, req.body.password, req.body.email)) {
						_DBcontroller.default.addUser(req.body.username, req.body.password, req.body.email)

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
app.listen(process.env.PORT || 3600, function() {
	console.log('Listening on port ' + process.env.PORT || 3600)
})
