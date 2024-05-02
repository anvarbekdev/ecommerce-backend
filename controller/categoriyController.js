// Database
const { pool } = require("../db/connect");

// Validation
const Categoriy = require("../validation/categoriy");

module.exports = {
	postCategoriy: async (req, res, next) => {
		try {
			if (req.body.categoriyName.length === 0) {
				res.status(404).json("Kategoriya nomi bo'sh");
			} else {
				const { categoriyName } = req.body;
				let categoriy = { name: categoriyName };
				let sql = "INSERT INTO categoriy SET ?";
				pool.query(sql, categoriy, (error) => {
					if (error) {
						res.send({ status: false, message: "Post failed" });
					} else {
						res.send({ status: true, message: "Post sucuccessfully" });
					}
				});
			}
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	getCategoriy: async (req, res, next) => {
		try {
			const mysqlCategoriy = `SELECT * FROM categoriy`;

			pool.query(mysqlCategoriy, (errorCategoriy, resultCategoriy) => {
				if (errorCategoriy) {
					res.send({ status: false, message: "Get categoriy data failed" });
				} else {
					res.send({
						status: true,
						categoriyData: resultCategoriy,
					});
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	getCategoriyItem: async (req, res, next) => {
		try {
			const { id } = req.body;
			let sql = "SELECT * FROM categoriy WHERE id=" + id;
			pool.query(sql, function (error, result) {
				if (error) {
					res.send({ status: false, message: "Get failed" });
				} else {
					res.send({ status: true, data: result });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	putCategoriyItem: async (req, res, next) => {
		try {
			const { id } = req.body.categoriyNewData;

			if (id.length === 0) {
				res.status(404).json({ status: false, message: "Turkim bo'sh" });
			}
			let sql = `UPDATE categoriy SET name = "${req.body.categoriyNewData.name}" WHERE categoriy.id = ${id}`;
			pool.query(sql, (error) => {
				if (error) {
					res.status(404).json({ status: false, message: "Update failed" });
				} else {
					res
						.status(200)
						.json({ status: true, message: "Turkim Nomi Yangiladi!" });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	delCategoriyItem: async (req, res, next) => {
		try {
			const { id } = req.body;
			// let { name } = req.body;
			let sql = `DELETE c, s, o, p, z, i FROM categoriy AS c
			LEFT JOIN section AS s ON c.id = s.categoriyId
			LEFT JOIN \`option\` AS o ON s.id = o.sectionId
			LEFT JOIN product AS p ON o.id = p.optionId
			LEFT JOIN sizes AS z ON p.id = z.productId
			LEFT JOIN images AS i ON p.id = i.productId
			WHERE c.id = ${id}
			`;
			pool.query(sql, (error) => {
				if (error) {
					res.send({ status: false, message: "Delete failed" });
				} else {
					res.send({ status: true, message: "Delete successfully" });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	postSectionAdmin: async (req, res, next) => {
		try {
			const { categoriy } = req.body;
			let sql = `SELECT * FROM section WHERE categoriyId = ${categoriy}`;
			pool.query(sql, (error, result) => {
				if (error) {
					res.send({ status: false, message: "Get data failed" });
				} else {
					res.send({ status: true, data: result });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	postOptionAdmin: async (req, res, next) => {
		try {
			const { section } = req.body;
			let sql = `SELECT * FROM \`option\` WHERE sectionId = ${section}`;
			pool.query(sql, (error, result) => {
				if (error) {
					res.send({ status: false, message: "Get data failed" });
				} else {
					res.send({ status: true, data: result });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	postSection: async (req, res, next) => {
		try {
			if (req.body.sectionName.length === 0) {
				res.status(404).json("Bo'lim nomi bo'sh");
			} else {
				const { sectionName, id } = req.body;
				let section = { name: sectionName, categoriyId: id };
				let sql = "INSERT INTO section SET ?";
				pool.query(sql, section, (error) => {
					if (error) {
						res.send({ status: false, message: "Post failed" });
					} else {
						res.send({ status: true, message: "Post sucuccessfully" });
					}
				});
			}
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	getSection: async (req, res, next) => {
		try {
			let sql = "SELECT * FROM section";
			pool.query(sql, (error, result) => {
				if (error) {
					res.send({ status: false, message: "Get data failed" });
				} else {
					res.send({ status: true, data: result });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	getSectionItem: async (req, res, next) => {
		try {
			let id = req.params.id;
			let sql = "SELECT * FROM section WHERE id=" + id;
			pool.query(sql, function (error, result) {
				if (error) {
					res.send({ status: false, message: "Get failed" });
				} else {
					res.send({ status: true, data: result });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	putSectionItem: async (req, res, next) => {
		try {
			const { id } = req.body.sectionNewData;

			if (id.length === 0) {
				res.status(404).json({ status: false, message: "Bo'lim bo'sh" });
			}
			let sql = `UPDATE section SET name = "${req.body.sectionNewData.name}" WHERE section.id = ${id}`;
			pool.query(sql, (error) => {
				if (error) {
					res.status(404).json({ status: false, message: "Update failed" });
				} else {
					res
						.status(200)
						.json({ status: true, message: "Update successfullyy" });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	delSectionItem: async (req, res, next) => {
		try {
			const { id } = req.body;
			// let { name } = req.body;
			let sql = `DELETE s, o, p, z, i FROM section AS s
			LEFT JOIN \`option\` AS o ON s.id = o.sectionId
			LEFT JOIN product AS p ON o.id = p.optionId
			LEFT JOIN sizes AS z ON p.id = z.productId
			LEFT JOIN images AS i ON p.id = i.productId
			WHERE s.id = ${id}
			`;
			pool.query(sql, (error) => {
				if (error) {
					res.send({ status: false, message: "Delete failed" });
				} else {
					res.send({ status: true, message: "Delete successfully" });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	postOption: async (req, res, next) => {
		const { errors, isValid } = Categoriy(req.body);
		try {
			if (req.body.optionName.length === 0) {
				res.status(404).json("Bo'lim nomi bo'sh");
			} else {
				const { optionName, idOpt } = req.body;
				let section = { name: optionName, sectionId: idOpt };
				let sql = "INSERT INTO `option` SET ?";
				pool.query(sql, section, (error) => {
					if (error) {
						res.send({ status: false, message: "Post failed" });
					} else {
						res.send({ status: true, message: "Post sucuccessfully" });
					}
				});
			}
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	getOption: async (req, res, next) => {
		try {
			let sql = "SELECT * FROM `option`";
			pool.query(sql, (error, result) => {
				if (error) {
					res.send({ status: false, message: "Get data failed" });
				} else {
					res.send({ status: true, data: result });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	getOptionItem: async (req, res, next) => {
		try {
			let id = req.params.id;
			let sql = "SELECT * FROM `option` WHERE id=" + id;
			pool.query(sql, function (error, result) {
				if (error) {
					res.send({ status: false, message: "Get failed" });
				} else {
					res.send({ status: true, data: result });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	putOptionItem: async (req, res, next) => {
		try {
			const { id } = req.body.optionNewData;

			if (id.length === 0) {
				res.status(404).json({ status: false, message: "Bo'lim bo'sh" });
			}
			let sql = `UPDATE \`option\` SET name = "${req.body.optionNewData.name}" WHERE \`option\`.id = ${id}`;
			pool.query(sql, (error) => {
				if (error) {
					res.send({ status: false, message: "Update failed" });
				} else {
					res.send({ status: true, message: "Update successfully" });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	delOptionItem: async (req, res, next) => {
		try {
			const { id } = req.body;
			// let { name } = req.body;
			let sql = `DELETE o, p, z, i FROM \`option\` AS o
			LEFT JOIN product AS p ON o.id = p.optionId
			LEFT JOIN sizes AS z ON p.id = z.productId
			LEFT JOIN images AS i ON p.id = i.productId
			WHERE o.id = ${id}
			`;
			pool.query(sql, (error) => {
				if (error) {
					res.send({ status: false, message: "Delete failed" });
				} else {
					res.send({ status: true, message: "Delete successfully" });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
};
