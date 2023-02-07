export {};
const Joi = require("joi");

const postNewImage3d = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string().required(),
    longitude: Joi.string().required(),
    latitude: Joi.string().required(),
    locationId: Joi.number().required(),
  }),
};
const updateImage3d = {
  body: Joi.object().keys({
    id: Joi.number(),
    name: Joi.string().required(),
    image: Joi.string().required(),
    longitude: Joi.string().required(),
    latitude: Joi.string().required(),
    locationId: Joi.number().required(),
  }),
};
module.exports = {
  postNewImage3d,
  updateImage3d,
};
