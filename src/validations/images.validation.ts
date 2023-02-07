export {};
const Joi = require("joi");

const postNewImage = {
  body: Joi.object().keys({
    image: Joi.string().required(),
    id: Joi.number().required(),
    table: Joi.number(),
  }),
};

const uploadMulpipleToFirebase = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    route: Joi.number().required(),
    table: Joi.number().required(),
  }),
};
const postNewImageRoom = {
  body: Joi.object().keys({
    image: Joi.string().required(),
    roomId: Joi.number().required(),
  }),
};
const updateImageVisibility = {
  body: Joi.object().keys({
    isVisible: Joi.boolean().required(),
  }),
};

module.exports = {
  postNewImage,
  updateImageVisibility,
  postNewImageRoom,
  uploadMulpipleToFirebase,
};
