// Database
const { pool } = require("../db/connect");

module.exports = {
	getCategoriy: async (req, res, next) => {
		try {
			const mysqlCategoriy = `SELECT c.id, c.name FROM categoriy AS c`;

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
	getProducts: async (req, res, next) => {
		try {
			const filters = req.query;
			const sortOption = filters.sortOption || "none";

			// Build SQL query
			let sql = `
				SELECT
						p.name,
						p.id,
						p.price,
						p.chegirma,
						p.imagePrew,
						p.brand,
						o.name AS optionName,
						s.name AS sectionName,
						c.name AS categoriyName
				FROM
						product AS p
				RIGHT JOIN \`option\` o
						ON p.optionId = o.id
				RIGHT JOIN section s
						ON o.sectionId = s.id
				RIGHT JOIN categoriy c
						ON s.categoriyId = c.id
			`;

			const whereClauses = [];
			const whereValues = [];
			const limit = parseInt(filters.limit) || 30;
			const offset = parseInt(filters.offset) || 0;

			// Add optional filters
			if (filters.categoriy) {
				whereClauses.push("c.name = ?");
				whereValues.push(filters.categoriy);
			}
			if (filters.section) {
				whereClauses.push("s.name = ?");
				whereValues.push(filters.section);
			}
			if (filters.option) {
				whereClauses.push("o.name = ?");
				whereValues.push(filters.option);
			}

			if (filters.price_min) {
				whereClauses.push("p.chegirma >= ?");
				whereValues.push(filters.price_min);
			}
			if (filters.price_max) {
				whereClauses.push("p.chegirma <= ?");
				whereValues.push(filters.price_max);
			}

			if (filters.brand) {
				const brands = filters.brand.split(",");
				const placeholders = brands.map(() => "?").join(",");
				whereClauses.push(`p.brand IN (${placeholders})`);
				whereValues.push(...brands);
			}

			if (whereClauses.length > 0) {
				sql += " WHERE " + whereClauses.join(" AND ");
			}

			if (sortOption === "asc") {
				sql += " ORDER BY p.chegirma ASC";
			} else if (sortOption === "desc") {
				sql += " ORDER BY p.chegirma DESC";
			}
			// Add limit and offset

			// Execute SQL query to get total number of products
			pool.query(sql, whereValues, (error, results) => {
				if (error) {
					res.status(500).send("Internal Server Error");
				} else {
					const total = results.length;

					// Add LIMIT and OFFSET clauses to SQL query
					sql += ` LIMIT ${limit} OFFSET ${offset}`;

					// Execute SQL query to get paginated products
					pool.query(sql, whereValues, (error, product) => {
						if (error) {
							res.status(500).send("Internal Server Error");
						} else {
							res.json({ total, results, product });
						}
					});
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	getSameProducts: async (req, res, next) => {
		try {
			const filters = req.query.optionId;

			// Build SQL query
			let sql = `
      SELECT p.name, p.id, p.price, p.chegirma, p.imagePrew, p.brand, o.name AS optionName
      FROM product p
      LEFT JOIN \`option\` o ON p.optionId = o.id WHERE o.id = ${filters}
    `;

			// Execute SQL query
			pool.query(sql, (error, results) => {
				if (error) {
					res.status(500).send("Internal Server Errorr");
				} else {
					res.json(results);
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	getSearch: async (req, res, next) => {
		try {
			const query = req.query.q;

			const sql = `SELECT * FROM product WHERE name LIKE '%${query}%'`;

			// Execute SQL query
			pool.query(sql, (error, results) => {
				if (error) {
					res.status(500).send("Internal Server Errorr");
				} else {
					res.json(results);
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
};
