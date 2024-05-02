let DataUri = require("datauri/parser");
let path = require("path");

let dataURIChild = new DataUri();

module.exports = (originalName, buffer) => {
	if (buffer == null) {
		throw new Error("Buffer cannot be null or undefined");
	}
	const extension = path.extname(originalName);
	return dataURIChild.format(extension, buffer).content;
};
