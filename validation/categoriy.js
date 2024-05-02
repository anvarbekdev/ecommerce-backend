const Validator = require("validator");
const isEmpty = require("./is-empty");

const Categoriy = (data) => {
	let errors = {};
	data.name = !isEmpty(data.name) ? data.name : "";
	data.optionId = !isEmpty(data.optionId) ? data.optionId.toString() : "";

	if (!Validator.isLength(data.name, { min: 2, max: 60 })) {
		errors.name = "Mahsulot nomi 60 belgidan ko'p bo'lmasligi kerak!";
	}

	if (Validator.isEmpty(data.name)) {
		errors.name = "Mahsulot nomi bo'sh!";
	}
	if (Validator.isEmpty(data.optionId)) {
		errors.optionId = "Kategoriya tanlanmagan!";
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};

module.exports = Categoriy;
