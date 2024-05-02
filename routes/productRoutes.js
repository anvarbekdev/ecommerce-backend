const express = require("express");
const {
	postProduct,
	putProductItem,
	delProductItem,
	postImage,
	postImageId,
} = require("../controller/productController");
const upload = require("../utils/multer");

const router = express.Router();

//========= Categoriy =======
router.post("", postProduct);
router.post("/image", upload.single("image"), postImage);
router.post("/image/id", postImageId);

router.put("/:id", putProductItem);
router.delete("/del", delProductItem);

module.exports = router;
