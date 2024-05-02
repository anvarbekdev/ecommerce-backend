let multer = require("multer");
const path = require("path");

module.exports = multer({
	storage: multer.diskStorage({}),
	fileFilter: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		// if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== "blob") {
		// 	cb(new Error("File type is not supported"), false);
		// 	return;
		// }
		cb(null, true);
	},
});

// //Specify the storage engine
// let upload = multer({
// 	storage: multer.memoryStorage(),
// 	limits: {
// 		fileSize: 1024 * 1024 * 5,
// 	},
// 	fileFilter: function (req, file, done) {
// 		console.log(file);
// 		if (
// 			file.mimetype === "image/jpeg" ||
// 			file.mimetype === "image/png" ||
// 			file.mimetype === "image/jpg"
// 		) {
// 			done(null, true);
// 		} else {
// 			//prevent the upload
// 			var newError = new Error("File type is incorrect");
// 			newError.name = "MulterError";
// 			done(newError, false);
// 		}
// 	},
// });

// module.exports = upload;
