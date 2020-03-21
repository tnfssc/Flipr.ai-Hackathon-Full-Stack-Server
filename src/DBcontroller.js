import mysql from 'mysql'
import 'dotenv/config'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAILVERIFIER_ADDRESS,
		pass: process.env.EMAILVERIFIER_PASSWORD,
	},
})

const pool = mysql.createPool({
	connectionLimit: 10,
	password: process.env.DATABASE_PASSWORD,
	user: process.env.DATABASE_USERNAME,
	database: process.env.DATABASE_NAME,
	host: process.env.DATABASE_URL,
	port: process.env.DATABASE_PORT,
})

const dBfuncs = {}

dBfuncs.addUser = (username, password, email) => {
	var emailVerifyId = crypto.randomBytes(40).toString('hex')
	const query =
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
	const EmailToBeSent = {
		from: process.env.EMAILVERIFIER_ADDRESS,
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
	return new Promise((resolve, reject) => {
		pool.query(query, (err, results) => {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.updatePassword = async (email, password) => {
	dBfuncs.findUser(undefined, email)
	const query =
		"UPDATE Users SET passwd = '" + password + "', new_passwd='', emailVerifyId = '' WHERE email = '" + email + "';"
	return new Promise((resolve, reject) => {
		pool.query(query, (err, results) => {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.newPassword = async (email, password) => {
	var emailVerifyId = crypto.randomBytes(40).toString('hex')
	const [userData] = await dBfuncs.findUser(undefined, email)
	if (userData === undefined) {
		console.log('User not found')
		return
	}
	const query =
		"UPDATE Users SET new_passwd = '" +
		password +
		"', emailVerifyId = '" +
		emailVerifyId +
		"' WHERE email = '" +
		email +
		"';"
	const EmailToBeSent = {
		from: process.env.EMAILVERIFIER_ADDRESS,
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

	return new Promise((resolve, reject) => {
		pool.query(query, (err, results) => {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.verifyUser = username => {
	const query = "UPDATE Users SET verified = '" + 1 + "', emailVerifyId = '' WHERE username = '" + username + "';"
	return new Promise((resolve, reject) => {
		pool.query(query, (err, results) => {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.findUser = (username, email) => {
	var query = "SELECT * FROM Users WHERE username='" + username + "';"
	if (email) query = "SELECT * FROM Users WHERE email='" + email + "';"
	return new Promise((resolve, reject) => {
		pool.query(query, (err, results) => {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

dBfuncs.deleteUser = (username, password) => {
	const query = "DELETE FROM Users WHERE username='" + username + "' AND password='" + password + "';"
	return new Promise((resolve, reject) => {
		pool.query(query, (err, results) => {
			if (err) return reject(err)
			return resolve(results)
		})
	})
}

export default dBfuncs
