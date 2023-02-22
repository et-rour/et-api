export {};
const Joi = require("joi");
const { password } = require("./custom.validation");

const register = {
  body: Joi.object().keys({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().required().email(),
    phone: Joi.string(),
    password: Joi.string().required().custom(password),
    country: Joi.string().allow(null, ""),
    whatsapp: Joi.string().allow(null, ""),
    isOwner: Joi.boolean(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const refresh = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const changeUserIsActiveProperty = {
  body: Joi.object().keys({
    active: Joi.boolean().required(),
  }),
};

const updateUser = {
  body: Joi.object().keys({
    isOwner: Joi.boolean(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    whatsapp: Joi.string(),
    country: Joi.string(),
    companyName: Joi.string(),
    identityCard: Joi.string(),
    representativeName: Joi.string(),
    rut: Joi.string(),
  }),
};

const putExtraData = {
  body: Joi.object().keys({
    companyName: Joi.string().required(),
    identityCard: Joi.string().required(),
    representativeName: Joi.string().required(),
    rut: Joi.string().required(),
  }),
};

// const logout = {
//   body: Joi.object().keys({
//     refreshToken: Joi.string().required(),
//   }),
// };

// const refreshTokens = {
//   body: Joi.object().keys({
//     refreshToken: Joi.string().required(),
//   }),
// };

// const forgotPassword = {
//   body: Joi.object().keys({
//     email: Joi.string().email().required(),
//   }),
// };

// const resetPassword = {
//   query: Joi.object().keys({
//     token: Joi.string().required(),
//   }),
//   body: Joi.object().keys({
//     password: Joi.string().required().custom(password),
//   }),
// };

// const verifyEmail = {
//   query: Joi.object().keys({
//     token: Joi.string().required(),
//   }),
// };

module.exports = {
  register,
  login,
  changeUserIsActiveProperty,
  putExtraData,
  updateUser,
  // logout,
  // refreshTokens,
  // forgotPassword,
  // resetPassword,
  // verifyEmail,
};
