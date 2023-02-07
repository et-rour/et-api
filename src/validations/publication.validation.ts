export {};
const Joi = require("joi");

const postNewPublication = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().allow(null, ""),
    webSite: Joi.string().allow(null, ""),
    instagram: Joi.string().allow(null, ""),
    user: Joi.number().required(),
  }),
};
module.exports = {
  postNewPublication,
};
