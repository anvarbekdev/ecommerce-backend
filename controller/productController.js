// Database
const { pool } = require("../db/connect");
//File Handler
const cloudinary = require("../utils/cloudinary");
// Validation
const Categoriy = require("../validation/categoriy");

module.exports = {
	postProduct: async (req, res, next) => {
		const { errors, isValid } = Categoriy(req.body);
		try {
			if (!isValid) {
				res.status(404).json(errors);
			} else {
				const {
					name,
					brand,
					color,
					price,
					chegirma,
					sotuvda,
					delivery,
					descrip,
					shortdesc,
					optionId,
					sizes,
					images,
				} = req.body;
				let product = {
					name,
					brand,
					color,
					price,
					chegirma,
					sotuvda,
					delivery,
					descrip,
					shortdesc,
					optionId,
					imagePrew: images[0].imageUrl,
				};
				pool.getConnection((err, conn) => {
					if (err) {
						console.error(err);
						return res
							.status(500)
							.json({ status: false, message: "Internal server error 1" });
					}
					// Check if the product name already exists in the database
					const checkQuery = `SELECT name FROM product WHERE name = "${name}"`;
					conn.query(checkQuery, (error, result) => {
						if (error) {
							console.error(error);
							return res
								.status(500)
								.json({ status: false, message: "Internal server error 2" });
						}

						if (result.length > 0) {
							return res.status(404).json({
								status: false,
								message: "Bunday mahsulot nomi mavjud!",
							});
						}

						// if (sizes.length === 0) {
						// 	return res.status(404).json({
						// 		status: false,
						// 		message: "O'lchamlar tanlanmagan!",
						// 	});
						// }
						if (images.length === 0) {
							return res.status(404).json({
								status: false,
								message: "Rasimlar tanlanmagan!!",
							});
						}

						// If the product name is unique, insert the new product into the database
						conn.beginTransaction((err) => {
							if (err) throw err;
							// Insert the new product into the product table
							conn.query(
								"INSERT INTO product SET ?",
								product,
								(err, result) => {
									if (err) {
										return conn.rollback(() => {
											throw err;
										});
									}

									// console.log(req.body.images);
									const productId = result.insertId; // Get the id of the newly inserted product

									// Insert the sizes into the sizes table with the productId value
									// const sizes = [{ productId, size }];
									const sizeData = sizes?.map((size) => [productId, size.size]);
									// let imageData = [];
									// if (Array.isArray(images)) {
									const imageData = images.map((img) => [
										productId,
										img.imageId,
										img.imageUrl,
									]);
									// }
									// if (!Array.isArray(images)) {
									// 	imageData = [[productId, images.imageId, images.imageUrl]];
									// }
									if (sizeData.length === 0) {
										conn.query(
											"INSERT INTO images (productId, imageId, imageUrl) VALUES ?",
											[imageData],
											function (error, results, fields) {
												if (error) {
													return conn.rollback(function () {
														throw error;
													});
												}

												conn.commit(function (err) {
													if (err) {
														return conn.rollback(function () {
															throw err;
														});
													}
													res.status(200).json({
														message: "Tovar muvaffaqiyatli qo'shildi!",
													});
												});
											}
										);
									} else {
										conn.query(
											"INSERT INTO sizes (productId, size) VALUES ?",
											[sizeData],
											function (error, results, fields) {
												if (error) {
													return conn.rollback(function () {
														throw error;
													});
												}
												conn.query(
													"INSERT INTO images (productId, imageId, imageUrl) VALUES ?",
													[imageData],
													function (error, results, fields) {
														if (error) {
															return conn.rollback(function () {
																throw error;
															});
														}

														conn.commit(function (err) {
															if (err) {
																return conn.rollback(function () {
																	throw err;
																});
															}
															res.status(200).json({
																message: "Tovar muvaffaqiyatli qo'shildi!",
															});
														});
													}
												);
											}
										);
									}
								}
							);
						});
					});
				});
			}
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	postImage: async (req, res, next) => {
		try {
			const imgResponse = await cloudinary.uploader.upload(req.file.path);

			res.status(200).json({
				imageUrl: imgResponse.secure_url,
				imageId: imgResponse.public_id,
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				error: "Internal Server Error",
			});
		}
	},
	postImageId: async (req, res, next) => {
		try {
			// Find user by id
			const id = req.body;

			// Delete image from cloudinary
			await cloudinary.uploader
				.destroy(id.public_id)
				.then((data) => {
					if (data.result === "ok") {
						res.status(200).json("Rasim o'chirildi!");
						// console.log(data);
					} else {
						res.status(404).json("Xatolik qayta urining!");
						// console.log(data);
					}
				})
				.catch((err) => {});
		} catch (err) {
			res.status(400).json(err);
		}
	},
	getProduct: async (req, res, next) => {
		try {
			const filters = req.query;
			const limit = parseInt(filters.limit) || 40;
			const sql = ` 
			SELECT p.*, z.size, i.imageUrl 
			FROM product AS p 
			LEFT JOIN sizes AS z ON p.id = z.productId 
			LEFT JOIN images AS i ON p.id = i.productId LIMIT ${limit}
			`;
			// console.log(sql);
			pool.query(sql, (error, result) => {
				if (error) {
					res.send({ status: false, message: "Get data failedd" });
				} else {
					const sizes = [];
					const images = [];
					const mergedData = result.reduce((accumulator, row) => {
						const existingRow = accumulator.find((r) => r.id === row.id);
						if (existingRow) {
							if (
								row.size &&
								!existingRow.sizes.some((s) => s.size === row.size)
							) {
								sizes.push({ id: sizes.length, size: row.size });
								existingRow.sizes.push({
									id: existingRow.sizes.length,
									size: row.size,
								});
							}
							if (
								row.imageUrl &&
								!existingRow.images.some((u) => u.imageUrl === row.imageUrl)
							) {
								images.push({ id: images.length, imageUrl: row.imageUrl });
								existingRow.images.push({
									id: existingRow.images.length,
									imageUrl: row.imageUrl,
								});
							}
						} else {
							const newRow = {
								...row,
								sizes: row.size ? [{ id: 0, size: row.size }] : [],
								images: row.imageUrl ? [{ id: 0, imageUrl: row.imageUrl }] : [],
							};
							accumulator.push(newRow);
						}
						return accumulator;
					}, []);
					res.send({ status: true, data: mergedData });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	getProductItem: async (req, res, next) => {
		try {
			let id = req.params.id;
			const sql = ` 
			SELECT p.*, z.*, i.* 
			FROM product AS p 
			LEFT JOIN sizes AS z ON p.id = z.productId 
			LEFT JOIN images AS i ON p.id = i.productId 
			WHERE p.id = ${id}
			`;
			// console.log(id);
			pool.query(sql, (error, result) => {
				if (error) {
					res.send({ status: false, message: "Get data failed" });
				} else {
					const sizes = [];
					const images = [];
					const mergedData = result.reduce((accumulator, row) => {
						const existingRow = accumulator.find((r) => r.id === row.id);
						if (existingRow) {
							if (
								row.size &&
								!existingRow.sizes.some((s) => s.size === row.size)
							) {
								sizes.push({ id: sizes.length, size: row.size });
								existingRow.sizes.push({
									id: existingRow.sizes.length,
									size: row.size,
								});
							}
							if (
								row.imageUrl &&
								!existingRow.images.some((u) => u.imageUrl === row.imageUrl)
							) {
								images.push({
									id: row.imageUrl.length,
									imageUrl: row.imageUrl,
									imageId: row.imageId,
								});
								existingRow.images.push({
									id: existingRow.images.length,
									imageUrl: row.imageUrl,
									imageId: row.imageId,
								});
							}
						} else {
							const newRow = {
								...row,
								sizes: row.size ? [{ id: 0, size: row.size }] : [],
								images: row.imageUrl
									? [{ id: 0, imageUrl: row.imageUrl, imageId: row.imageId }]
									: [],
							};
							accumulator.push(newRow);
						}
						return accumulator;
					}, []);
					res.send({ status: true, data: mergedData });
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
	putProductItem: async (req, res, next) => {
		try {
			const { product } = req.body;
			const {
				name,
				brand,
				color,
				price,
				chegirma,
				rating,
				sotuvda,
				delivery,
				deliverydesc,
				descrip,
				shortdesc,
				optionId,
				sizes,
				images,
			} = product;
			// Use the product ID from the request parameters to update the corresponding rows
			const id = req.params.id;

			// Prepare the data for the "sizes" and "images" tables
			const sizesData = sizes.map((size) => [id, size.size]);
			const imageData = images.map((image) => [
				id,
				image.imageUrl,
				image.imageId,
			]);

			// Use a multi-table UPDATE statement to update the "product", "sizes", and "images" tables
			const mySql = `
				UPDATE product
				SET
					name = ?,
					brand = ?,
					color = ?,
					descrip = ?,
					price = ?,
					chegirma = ?,
					rating = ?,
					sotuvda = ?,
					delivery = ?,
					deliverydesc = ?,
					shortdesc = ?,
					optionId = ?,
					imagePrew = ?
				WHERE
					id = ${id}
			`;

			const Value = [
				name,
				brand,
				color,
				descrip,
				price,
				chegirma,
				rating,
				sotuvda,
				delivery,
				deliverydesc,
				shortdesc,
				optionId,
				images[0].imageUrl,
			];
			// console.log(mySql);
			pool.query(mySql, Value, (error) => {
				if (error) {
					res.status(404).json({ status: false, message: "Update failed!" });
				} else {
					if (sizesData.length === 0) {
						const deleteImagesSql = `DELETE FROM images WHERE productId = ?`;
						pool.query(deleteImagesSql, [id], (error) => {
							if (error) {
								res
									.status(500)
									.json({ message: "Eski Rasmilar o'chirilmadi!" });
							} else {
								const insertImagesSql = `INSERT INTO images (productId, imageUrl, imageId) VALUES ?`;
								pool.query(insertImagesSql, [imageData], (error) => {
									if (error) {
										res.status(500).json({ message: "Rasimlar tanlanmagan!!" });
									} else {
										res.status(200).json({
											status: true,
											message: "Mahsulot yangilandi!",
										});
									}
								});
							}
						});
					} else {
						const deleteSizesSql = `DELETE FROM sizes WHERE productId = ?`;
						pool.query(deleteSizesSql, [id], (error) => {
							if (error) {
								res.status(500).json({ message: "O'lchamlar o'chirilmadi!" });
							} else {
								const insertSizesSql = `INSERT INTO sizes (productId, size) VALUES ?`;
								pool.query(insertSizesSql, [sizesData], (error) => {
									if (error) {
										res
											.status(500)
											.json({ message: "O'lchamlar yangilanmadi!" });
									} else {
										const deleteImagesSql = `DELETE FROM images WHERE productId = ?`;
										pool.query(deleteImagesSql, [id], (error) => {
											if (error) {
												res
													.status(500)
													.json({ message: "Eski Rasmilar o'chirilmadi!" });
											} else {
												const insertImagesSql = `INSERT INTO images (productId, imageUrl, imageId) VALUES ?`;
												pool.query(insertImagesSql, [imageData], (error) => {
													if (error) {
														res
															.status(500)
															.json({ message: "Rasimlar tanlanmagan!!" });
													} else {
														res.status(200).json({
															status: true,
															message: "Mahsulot yangilandi!",
														});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error e" });
		}
	},
	delProductItem: async (req, res, next) => {
		try {
			const id = req.body;
			let sql = `DELETE p, z, i FROM product AS p
			LEFT JOIN sizes AS z ON p.id = z.productId
			LEFT JOIN images AS i ON p.id = i.productId
			WHERE p.id = ${id.id}
			`;
			const sqls = ` 
			SELECT p.id, i.imageId 
			FROM product AS p 
			LEFT JOIN images AS i ON p.id = i.productId 
			WHERE p.id = ${id.id}
			`;
			pool.query(sqls, (error, result) => {
				if (error) {
					res
						.status(404)
						.json({ status: false, message: "Jarayon Yakunlanmadi!" });
				} else {
					const next = result.map((i) => {
						if (i.imageId !== "false") {
							cloudinary.uploader.destroy(i.imageId).then((data) => {
								if (data.result === "ok") {
									return data;
								} else {
									res.status(404).json("Xatolok qayta urining!");
								}
							});
						} else if (i.imageId === "false") {
							let result = "okes";
							let data = [];
							data.push(result);
							return data;
							// console.log(data);
						}
					});
					// console.log(result);
					Promise.all(next).then((data) => {
						if (data) {
							pool.query(sql, (error) => {
								if (error) {
									res.status(404).json({
										status: false,
										message: "Jarayon Yakunlanmadi!",
									});
								} else {
									res
										.status(200)
										.json({ status: true, message: "Mahsulot o'chirildi!" });
								}
							});
						}
					});
				}
			});
		} catch (error) {
			res.status(500).json({ message: "Server error" });
		}
	},
};
