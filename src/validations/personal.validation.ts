export {};
const Joi = require("joi");

const postNewPersonalMember = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    image: Joi.string().allow(null, ""),
    position: Joi.string().required(),
  }),
};
const updatePersonalMember = {
  params: Joi.object().keys({
    id: Joi.number().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    image: Joi.string().allow(null, ""),
    position: Joi.string().required(),
    isVisible: Joi.boolean().required(),
    isEmailVisible: Joi.boolean().required(),
  }),
};
module.exports = {
  updatePersonalMember,
  postNewPersonalMember,
};
