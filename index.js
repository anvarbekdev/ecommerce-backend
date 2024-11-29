const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const useUser = require("./routes/userRoutes.js");
const usePublic = require("./routes/publicRoutes.js");
require("dotenv").config();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

//MIDDILWARES
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
	cors({
		origin: ["http://localhost:3000", "https://shop-2fgr.onrender.com"],
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

// ROUTES
app.use("/api/user", useUser);
app.use("/api", usePublic);

// serving the frontend
app.use(express.static(path.join(__dirname, "/dist")));

app.get("*", function (_, res) {
	res.sendFile(path.join(__dirname, "dist/index.html"), function (err) {
		res.status(500).send(err);
	});
});

app.use((req, res, next) => {
	const error = new Error("INVALID ROUTE NOT WORKING");
	error.status = 404;
	next(error);
});

//Error handler function
app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message,
		},
	});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function check(error) {
	if (error) {
		console.log(`Error connection port ${PORT}`);
	} else {
		console.log(`Started connection port ${PORT}`);
	}
});
