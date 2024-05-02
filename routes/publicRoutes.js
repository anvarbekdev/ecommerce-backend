const express = require("express");
const {
	getCategoriy,
	getProducts,
	getSameProducts,
	getSearch,
} = require("../controller/publicController");
const router = express.Router();

router.get("/categories", getCategoriy);
router.get("/products", getProducts);
router.get("/productsItem", getSameProducts);
router.get("/search", getSearch);

module.exports = router;
