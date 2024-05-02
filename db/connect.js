const mysql = require("mysql");
require("dotenv").config();

// Database connection pool
const pool = mysql.createPool({
	connectionLimit: 10, // adjust this to suit your needs
	host: process.env.HOST_URL,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
	port: 3306,
});

// Get a connection from the pool
pool.getConnection((err, connection) => {
	if (err) {
		console.error("Error connecting to database: ", err);
	} else {
		console.log("Connected to database!");
	}
});

let dbs = {};

// Requests to the User table ***

dbs.allUser = () => {
	return new Promise((resolve, reject) => {
		pool.query("SELECT * FROM User ", (error, users) => {
			if (error) {
				return reject(error);
			}
			return resolve(users);
		});
	});
};

dbs.getUserByEmail = (email) => {
	return new Promise((resolve, reject) => {
		pool.query(
			"SELECT * FROM user WHERE email = ?",
			[email],
			(error, users) => {
				if (error) {
					return reject(error);
				}
				return resolve(users[0]);
			}
		);
	});
};

dbs.insertUser = (userName, email, password) => {
	return new Promise((resolve, reject) => {
		pool.query(
			"INSERT INTO User (user_name, email, password) VALUES (?,  ?, ?)",
			[userName, email, password],
			(error, result) => {
				if (error) {
					return reject("Bunday email mavjud!!");
				}

				return resolve("ok");
			}
		);
	});
};

dbs.updateUser = (userName, role, email, id) => {
	return new Promise((resolve, reject) => {
		pool.query(
			"UPDATE User SET user_name = ?, role= ?, email= ? WHERE id = ?",
			[userName, role, email, id],
			(error) => {
				if (error) {
					return reject(error);
				}

				return resolve("Foydalanuvchi ma'lumoti yangiladi!");
			}
		);
	});
};

dbs.deleteUser = (id) => {
	return new Promise((resolve, reject) => {
		pool.query("DELETE FROM User WHERE id = ?", [id], (error) => {
			if (error) {
				return reject(error);
			}
			return resolve("User deleted");
		});
	});
};

module.exports = { dbs, pool };
