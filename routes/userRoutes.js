const express = require("express");
require("dotenv").config();
const { compareSync } = require("bcryptjs");
const { dbs } = require("../db/connect");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const adminRouters = require("./adminRoutes");
const categoriyRoutes = require("./categoriyRoutes");
const productRoutes = require("./productRoutes");
const axios = require("axios");
var FormData = require("form-data");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

const {
	getProduct,
	getProductItem,
} = require("../controller/productController");

//========= Categoriy =======
router.post("/register", async (req, res, next) => {
	try {
		const userName = req.body.userName;
		const email = req.body.email;
		let password = req.body.password;
		const apiKey = process.env.HUNTER_SECRET;
		const response = await axios.get(
			`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${apiKey}`
		);
		const data = response.data.data;
		// console.log(data);
		if (data?.status === "valid") {
			if (!userName || !email || !password) {
				return res.sendStatus(400);
			}

			const salt = genSaltSync(10);
			password = hashSync(password, salt);

			const user = await dbs.insertUser(userName, email, password);

			if (user === "ok") {
				res.status(200).json({ message: "Mufaqqiyatli ro'yxatdan o'tdingiz!" });
			} else {
				res.status(404).json({ message: "Xatolik" });
			}
		} else {
			res.status(404).json({ message: "Bunday email mavjud emas!" });
		}
	} catch (e) {
		console.log(e);
		res.status(400).json(e);
	}
});

router.post("/login", async (req, res, next) => {
	try {
		const email = req.body.email;
		const password = req.body.password;
		user = await dbs.getUserByEmail(email);
		// console.log(user);
		if (!user) {
			return res.status(404).json({
				message: "Elektron pochta yoki parol xato!",
			});
		}

		const isValidPassword = compareSync(password, user.password);
		if (isValidPassword) {
			user.password = undefined;
			const jsontoken = jsonwebtoken.sign(
				{ user: user },
				process.env.SECRET_KEY,
				{ expiresIn: "30m" }
			);
			res.cookie("token", jsontoken, {
				secure: "false",
				// httpOnly: true,
				maxAge: 30 * 60 * 1000,
				sameSite: "strict",
			});

			res.json({ token: jsontoken });
		} else {
			return res.status(404).json({
				message: "Elektron pochta yoki parol xato!",
			});
		}
	} catch (e) {
		console.log(e);
	}
});

router.post("/authlogin", async (req, res, next) => {
	var data = new FormData();
	data.append("email", process.env.ESKIZ_EMAIL);
	data.append("password", process.env.ESKIZ_SECRET);

	var config = {
		method: "post",
		maxBodyLength: Infinity,
		url: "https://notify.eskiz.uz/api/auth/login",
		headers: {
			...data.getHeaders(),
		},
		data: data,
	};

	axios(config)
		.then(function (response) {
			const token = response.data.data.token;
			// Set the request headers
			const headers = {
				Authorization: "Bearer " + token,
				Accept: "*/*",
				Connection: "keep-alive",
			};

			function generateOTP() {
				var digits = "0123456789";
				let OTP = "";
				for (let i = 0; i < 6; i++) {
					OTP += digits[Math.floor(Math.random() * 10)];
				}
				return OTP;
			}
			const OTP = generateOTP();

			localStorage.setItem("OTP", OTP);
			const helper = async () => {
				localStorage.setItem("OTP", "");
			};
			setTimeout(function () {
				helper();
			}, 180000);

			var data = new FormData();
			data.append("mobile_phone", req.body.mobile_phone);
			data.append("message", OTP);
			data.append("from", "4546");
			data.append("callback_url", "http://0000.uz/test.php");

			var config = {
				method: "post",
				maxBodyLength: Infinity,
				url: "https://notify.eskiz.uz/api/message/sms/send",
				headers: headers,
				data: data,
			};

			axios(config)
				.then(function (response) {
					// console.log(JSON.stringify(response.data));
					res.status(200).json({ message: "success" });
					console.log("okkkk");
				})
				.catch(function (error) {
					console.log(error.message);
					res.status(404).json(error.message);
				});
		})
		.catch(function (error) {
			console.log(error);
		});
});

router.post("/submitotp", async (req, res, next) => {
	try {
		const otp = req.body.otp;
		const isOtp = localStorage.getItem("OTP");
		if (otp === isOtp) {
			res.status(200).json({ status: true, message: "successfully" });
		} else {
			res.status(404).json({ status: false, message: "Sms raqam nato'g'ri!" });
		}
	} catch (e) {
		console.log(e);
	}
});

router.get("/get", getProduct);
router.get("/:id", getProductItem);

//  Verify Token
async function verifyToken(req, res, next) {
	const token = req.headers.cookie && req.headers.cookie.slice(6);
	console.log(token);
	if (token === undefined) {
		return res.json({
			message: "Access Denied! Unauthorized User",
		});
	} else {
		jsonwebtoken.verify(token, process.env.SECRET_KEY, (err, authData) => {
			if (err) {
				res.json({
					message: "Invalid Token...",
				});
			} else {
				// console.log(authData.user.role);
				const role = authData.user.role;
				if (role === "admin") {
					next();
				} else {
					return res.json({
						message: "Access Denied! you are not an Admin",
					});
				}
			}
		});
	}
}

router.use("/users", verifyToken, adminRouters);
router.use("/categoriy", verifyToken, categoriyRoutes);
router.use("/product", verifyToken, productRoutes);

module.exports = router;
