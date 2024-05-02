const express = require("express");

const {
	postCategoriy,
	getCategoriy,
	getCategoriyItem,
	putCategoriyItem,
	delCategoriyItem,
	postSection,
	getSection,
	getSectionItem,
	putSectionItem,
	delSectionItem,
	postOption,
	getOption,
	getOptionItem,
	putOptionItem,
	delOptionItem,
	postSectionAdmin,
	postOptionAdmin,
} = require("../controller/categoriyController");

const router = express.Router();

//========= Categoriy =======
router.post("/post", postCategoriy);
router.post("/get", getCategoriy);
router.get("/item", getCategoriyItem);
router.put("/put", putCategoriyItem);
router.delete("/del", delCategoriyItem);

//========= Section =========
router.post("/postsection", postSection);
router.get("/getsection", getSection);
router.get("/getsectionitm/:id", getSectionItem);
router.put("/putsection", putSectionItem);
router.delete("/delsection", delSectionItem);

//========= ADMIN =========
router.post("/postsectionadmin", postSectionAdmin);
router.post("/postoptionadmin", postOptionAdmin);
// router.get("/getsection", getSection);
// router.get("/getsectionitm/:id", getSectionItem);
// router.put("/putsection/:id", putSectionItem);
// router.delete("/delsection/:id", delSectionItem);

//========= Option =========
router.post("/postoption", postOption);
router.get("/getoption", getOption);
router.get("/getoptionitm/:id", getOptionItem);
router.put("/putoption", putOptionItem);
router.delete("/deloption", delOptionItem);

module.exports = router;
