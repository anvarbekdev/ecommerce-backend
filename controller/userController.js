// Database
const { hashSync, genSaltSync, compareSync } = require("bcryptjs");
const { dbs } = require("../db/connect");
// Validation
const Categoriy = require("../validation/categoriy");

module.exports = {
	postUser: async (req, res, next) => {
		try {
			const userName = req.body.userName;
			const email = req.body.email;
			let password = req.body.password;

			if (!userName || !email || !password) {
				return res.status(400).json("Maydon bo'sh qolgan!");
			}

			const salt = genSaltSync(10);
			password = hashSync(password, salt);

			const user = await dbs.insertUser(userName, email, password);
			if (!user) {
				res.status(400).json({ message: user });
			} else {
				res.json({ message: user });
			}
		} catch (e) {
			console.log(e);
			res.sendStatus(400);
		}
	},
	getUser: async (req, res, next) => {
		try {
			const users = await dbs.allUser();
			res.json({ users: users });
		} catch (e) {
			console.log(e);
		}
	},
	putUser: async (req, res, next) => {
		try {
			const userName = req.body.updates.map((i) => i.user_name);
			const role = req.body.updates.map((i) => i.role);
			const email = req.body.updates.map((i) => i.email);
			const userId = req.body.updates.map((i) => i.id);

			if (!userName || !role || !email) {
				return res.sendStatus(400);
			}

			// const salt = genSaltSync(10);
			// password = hashSync(password, salt);

			const user = await dbs.updateUser(userName, role, email, userId);
			res.json({ message: "user updated" });
		} catch (e) {
			console.log(e);
			res.sendStatus(400);
		}
	},
	delUser: async (req, res, next) => {
		try {
			const userId = req.body.id;
			const user = await dbs.deleteUser(userId);
			if (user) {
				res.status(200).json(user);
			}
		} catch (e) {
			console.log(e);
			res.sendStatus(400);
		}
	},
};
