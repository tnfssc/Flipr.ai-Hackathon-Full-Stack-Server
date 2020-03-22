'use strict'

Object.defineProperty(exports, '__esModule', {
	value: true,
})
exports.default = void 0

var _mysql = _interopRequireDefault(require('mysql'))

require('dotenv/config')
var _lodash = require('lodash')
var _crypto = _interopRequireDefault(require('crypto'))

var _nodemailer = _interopRequireDefault(require('nodemailer'))

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
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

var credentials = {
	DATABASE_URL: 'remotemysql.com',
	DATABASE_USERNAME: 'RoiPsAjBmd',
	DATABASE_NAME: 'RoiPsAjBmd',
	DATABASE_PASSWORD: 'JJ0A9R1AFK',
	DATABASE_PORT: '3306',

	EMAILVERIFIER_ADDRESS: 'noreply.tnfssc.flipr.ai.hackthon@gmail.com',
	EMAILVERIFIER_PASSWORD: '1234qwer!@#$QWER',
}

var transporter = _nodemailer.default.createTransport({
	service: 'gmail',
	auth: {
		user: credentials.EMAILVERIFIER_ADDRESS,
		pass: credentials.EMAILVERIFIER_PASSWORD,
	},
})

var pool = _mysql.default.createPool({
	connectionLimit: 5,
	password: credentials.DATABASE_PASSWORD,
	user: credentials.DATABASE_USERNAME,
	database: credentials.DATABASE_NAME,
	host: credentials.DATABASE_URL,
	port: credentials.DATABASE_PORT,
})

var dBfuncs = {}

dBfuncs.addUser = function(username, password, email) {
	var emailVerifyId = _crypto.default.randomBytes(40).toString('hex')

	var query =
		"INSERT INTO Users (username, verified, email, passwd, emailVerifyId) VALUES ('" +
		username +
		"', '" +
		0 +
		"', '" +
		email +
		"', '" +
		password +
		"', '" +
		emailVerifyId +
		"');"
	var EmailToBeSent = {
		from: credentials.EMAILVERIFIER_ADDRESS,
		to: email,
		subject: 'Please click the link to verify email',
		text: 'http://localhost:4000/verifyemail?token=' + emailVerifyId + '&username=' + username,
	}
	transporter.sendMail(EmailToBeSent, function(error, info) {
		if (error) {
			console.log(error)
		} else {
			//console.log('Email sent: ' + info.response)
		}
	})
	return new Promise(function(resolve, reject) {
		pool.query(query, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.loginUser = function(username, loginToken) {
	var query = "UPDATE Users SET loginToken = '" + loginToken + "' WHERE username = '" + username + "';"
	return new Promise(function(resolve, reject) {
		pool.query(query, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.updatePersonalBoards = function(username, boards) {
	const personalBoards = JSON.stringify(boards)
	var query = "UPDATE Users SET personalBoards = '" + personalBoards + "' WHERE username = '" + username + "';"
	return new Promise(function(resolve, reject) {
		pool.query(query, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.logoutUser = function(username) {
	var query = "UPDATE Users SET loginToken = '' WHERE username = '" + username + "';"
	return new Promise(function(resolve, reject) {
		pool.query(query, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.updatePassword = async function(email, password) {
	dBfuncs.findUser(undefined, email)
	var query =
		"UPDATE Users SET passwd = '" + password + "', new_passwd='', emailVerifyId = '' WHERE email = '" + email + "';"
	return new Promise(function(resolve, reject) {
		pool.query(query, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.newPassword = async function(email, password) {
	var emailVerifyId = _crypto.default.randomBytes(40).toString('hex')

	var _await$dBfuncs$findUs = await dBfuncs.findUser(undefined, email),
		_await$dBfuncs$findUs2 = _slicedToArray(_await$dBfuncs$findUs, 1),
		userData = _await$dBfuncs$findUs2[0]

	if (userData === undefined) {
		console.log('User not found')
		return
	}

	var query =
		"UPDATE Users SET new_passwd = '" +
		password +
		"', emailVerifyId = '" +
		emailVerifyId +
		"' WHERE email = '" +
		email +
		"';"
	var EmailToBeSent = {
		from: credentials.EMAILVERIFIER_ADDRESS,
		to: email,
		subject: 'Please click the link to confirm reset password',
		text: 'http://localhost:4000/resetpassword?token=' + emailVerifyId + '&email=' + email,
	}
	transporter.sendMail(EmailToBeSent, function(error, info) {
		if (error) {
			console.log(error)
		} else {
			//console.log('Email sent: ' + info.response)
		}
	})
	return new Promise(function(resolve, reject) {
		pool.query(query, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.verifyUser = function(username) {
	var query = "UPDATE Users SET verified = '" + 1 + "', emailVerifyId = '' WHERE username = '" + username + "';"
	return new Promise(function(resolve, reject) {
		pool.query(query, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.getPersonalBoards = function(userId) {
	var query =
		'SELECT Boards.boardId, Boards.title FROM PersonalBoards, Boards where PersonalBoards.userId=? AND Boards.boardId=PersonalBoards.boardId;'
	var rows = [userId]
	return new Promise(function(resolve, reject) {
		pool.query(query, rows, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

var handleSqlError = function(query, rows, reject) {
	var error = {
		message: 'Failed to execute query: ' + query + ' rows: ' + rows,
	}
	// TODO: remove log
	console.error(error)
	return reject(error)
}

dBfuncs.addNewPersonalBoard = function(title, userId) {
	var query = 'INSERT INTO Boards(title) VALUES(?)'
	var rows = [title]

	return new Promise(function(resolve, reject) {
		pool.query(query, rows, function(err, results) {
			if (err) {
				console.error(err)
				return reject(err)
			}
			if (_lodash.isNull(results.insertId)) {
				return handleSqlError(query, rows, reject)
			} else {
				var updatePersonalBoardQuery = 'INSERT INTO PersonalBoards(boardId, userId) VALUES(?, ?)'
				var rows2 = [results.insertId, userId]
				pool.query(updatePersonalBoardQuery, rows2, function(err2, results2) {
					if (err2) {
						console.error(err2.sqlMessage)
						return reject(err2)
					} else if (_lodash.isNull(results2.insertId)) {
						return handleSqlError(updatePersonalBoardQuery, rows2, reject)
					} else {
						return resolve(results2)
					}
				})
			}
		})
	})
}

dBfuncs.deleteAPersonalBoard = function(boardId) {
	//
}

dBfuncs.addTeamBoard = function(title, teamId) {
	//
}

dBfuncs.deleteTeamBoard = function(boardId) {
	//
}

dBfuncs.createTeam = function(teamName, userId) {
	//
}

dBfuncs.addTeamMember = function(teamId, userId) {
	//
}

dBfuncs.deleteTeam = function(teamId) {
	//
}

dBfuncs.removeTeamMember = function(teamId, userId) {
	//
}

dBfuncs.addNewList = function(listName, boardId) {
	var query = 'INSERT INTO Lists(title, boardId) VALUES(?, ?)'
	var rows = [listName, boardId]

	return new Promise(function(resolve, reject) {
		pool.query(query, rows, function(err, results) {
			if (err) {
				console.error(err)
				return reject(err)
			}
			if (_lodash.isNull(results.insertId)) {
				return handleSqlError(query, rows, reject)
			}
			return resolve(results)
		})
	})
}

dBfuncs.deleteAList = function(listId) {
	//
}

dBfuncs.getLists = function(boardId) {
	var query = 'SELECT * from Lists WHERE boardId=?;'
	var rows = [boardId]
	return new Promise(function(resolve, reject) {
		pool.query(query, rows, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.getCards = function(listId) {
	//
}

dBfuncs.addCard = function(cardName, listId) {
	//
}

dBfuncs.updateCard = function(cardId) {
	//
}

dBfuncs.deleteCard = function(cardId) {
	//
}

dBfuncs.getCard = function(cardId) {
	//
}

dBfuncs.findUser = function(username, email) {
	var query = "SELECT * FROM Users WHERE username='" + username + "';"
	if (email) query = "SELECT * FROM Users WHERE email='" + email + "';"
	return new Promise(function(resolve, reject) {
		pool.query(query, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.deleteUser = function(username, password) {
	var query = "DELETE FROM Users WHERE username='" + username + "' AND password='" + password + "';"
	return new Promise(function(resolve, reject) {
		pool.query(query, function(err, results) {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

var _default = dBfuncs
exports.default = _default
