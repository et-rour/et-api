export {};
const Joi = require("joi");

const updateLeaseRange = {
  body: Joi.object().keys({
    start: Joi.string().required(),
    end: Joi.string().required(),
    locationId: Joi.number().required(),
  }),
};
const createCheckoutSession = {
  body: Joi.object().keys({
    userId: Joi.number().required(),
    locationId: Joi.number().required(),
    isLocation: Joi.boolean().required(),
    range: Joi.object({
      start: Joi.number(),
      end: Joi.number(),
    }).required(),
  }),
};
const changeLocationIsActiveProperty = {
  body: Joi.object().keys({
    active: Joi.boolean().required(),
  }),
};
module.exports = {
  updateLeaseRange,
  createCheckoutSession,
  changeLocationIsActiveProperty,
};
