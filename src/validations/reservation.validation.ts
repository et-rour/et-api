export {};
const Joi = require("joi");

const postNewReservation = {
  body: Joi.object().keys({
    start: Joi.string().required(),
    end: Joi.string().required(),
    owner: Joi.number().required(),
    price: Joi.number().required(),
    status: Joi.string().allow(null, ""),
  }),
};
const createLocationCheckoutSession = {
  body: Joi.object().keys({
    locationId: Joi.number().required(),
    roomId: Joi.required(),
    range: Joi.object({
      start: Joi.number(),
      end: Joi.number(),
    }).required(),
    // Quantity of hours or months
    timeQuantity: Joi.required(),
    company: Joi.string().required(),
    identity: Joi.string().required(),
    location_uses: Joi.string().required(),
    people_fix: Joi.string().required(),
    people_prox: Joi.string().required(),
    represent: Joi.string().required(),
    rut: Joi.string().required(),
    subContractor_email_1: Joi.string().required(),
    subContractor_email_2: Joi.string().required(),
    signature: Joi.string().required(),
  }),
};
const getPDF = {
  body: Joi.object().keys({
    locationId: Joi.required(),
    roomId: Joi.required(),
    range: Joi.object({
      start: Joi.number(),
      end: Joi.number(),
    }).required(),
    company: Joi.string().required(),
    identity: Joi.string().required(),
    location_uses: Joi.string().required(),
    people_fix: Joi.string().required(),
    people_prox: Joi.string().required(),
    represent: Joi.string().required(),
    rut: Joi.string().required(),
    subContractor_email_1: Joi.string().required(),
    subContractor_email_2: Joi.string().required(),
    signature: Joi.string().allow(null, ""),
  }),
};
const createRoomCheckoutSession = {
  body: Joi.object().keys({
    userId: Joi.number().required(),
    roomId: Joi.number().required(),
    range: Joi.object({
      start: Joi.number(),
      end: Joi.number(),
    }).required(),
    signature: Joi.string().required(),
  }),
};
module.exports = {
  postNewReservation,
  createLocationCheckoutSession,
  createRoomCheckoutSession,
  getPDF,
};
