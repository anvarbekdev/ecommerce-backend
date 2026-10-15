const express = require("express");
const router = express.Router();

const {
	getUser,
	postUser,
	putUser,
	delUser,
} = require("../controller/userController");

router.get("/getuser", getUser);
router.post("/post", postUser);
router.put("/put", putUser);
router.delete("/del", delUser);

module.exports = router;
