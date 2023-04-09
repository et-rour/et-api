import { allow } from "joi";

export {};
const Joi = require("joi");

// USER
const verifyUser = {
  body: Joi.object().keys({
    id: Joi.number().required(),
  }),
};
const activeStatus = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isActive: Joi.boolean().required(),
  }),
};
const makeOwner = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isOwner: Joi.boolean().required(),
  }),
};
const asignAdminRol = {
  body: Joi.object().keys({
    isAdmin: Joi.boolean().required(),
  }),
};

// LOCATION
const setLocationsValue = {
  body: Joi.object().keys({
    locationId: Joi.number().required(),
    locationValue: Joi.number().required(),
  }),
};
const activeLocationsStatus = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isActive: Joi.boolean().required(),
  }),
};
const verifyLocation = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isVerified: Joi.boolean().required(),
  }),
};
const modifyLocation = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isVerified: Joi.boolean(),
    isActive: Joi.boolean(),
    name: Joi.string(),
    address: Joi.string(),
    propertyType: Joi.string(),
    landUse: Joi.string(),
    lat: Joi.number(),
    long: Joi.number(),
    rooms: Joi.number(),
    bathrooms: Joi.number(),
    calendlyLink: Joi.string(),
    vault: Joi.boolean(),
    cleaning: Joi.boolean(),
    wifi: Joi.boolean(),
    security: Joi.boolean(),
    painting: Joi.number(),
    floor: Joi.number(),
    garage: Joi.number(),
    email: Joi.string(),
    phone: Joi.string(),
    description: Joi.string(),
    unused: Joi.number(),
    zone: Joi.number(),
    owner: Joi.number(),
    squareMeters: Joi.number(),
    stripePriceId: Joi.string(),
    stripeProductId: Joi.string(),
    startLease: Joi.string().allow(null, ""),
    endLease: Joi.string().allow(null, ""),
    createdByAdmin: Joi.boolean(),
    isDaily: Joi.boolean(),
    dailyValue: Joi.number(),
  }),
};
const updateLocationCoverImage = {
  body: Joi.object().keys({
    image: Joi.string().required(),
  }),
};
const createLocation = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    rooms: Joi.number().required(),
    bathrooms: Joi.number().required(),
    painting: Joi.number().required(),
    floor: Joi.number().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    propertyType: Joi.string().required(),
    description: Joi.string().required(),
    garage: Joi.number().required(),
    meters: Joi.number().required(),
    zone: Joi.number().required(),
    owner: Joi.number().required(),
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    vault: Joi.boolean().required(),
    cleaning: Joi.boolean().required(),
    wifi: Joi.boolean().required(),
    security: Joi.boolean().required(),
  }),
};

// ZONES
const createZone = {
  body: Joi.object().keys({
    country: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zone: Joi.string().required(),
    centerCoordinates: Joi.string().allow(null, ""),
    rate: Joi.number().required(),
    averageValue: Joi.number(),
    isActive: Joi.boolean(),
  }),
};
const modifyZone = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    country: Joi.string().allow(null, ""),
    city: Joi.string().allow(null, ""),
    state: Joi.string().allow(null, ""),
    zone: Joi.string().allow(null, ""),
    centerCoordinates: Joi.string().allow(null, ""),
    rate: Joi.number().required(),
    averageValue: Joi.number(),
    isActive: Joi.boolean(),
  }),
};
const activeZoneStatus = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isActive: Joi.boolean().required(),
  }),
};

// REVIEWS
const activeReviewStatus = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isActive: Joi.boolean().required(),
  }),
};
const verifyReview = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    isVerified: Joi.boolean().required(),
  }),
};

// RESERVATIONS
const modifyReservation = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    start: Joi.string().allow(null, ""),
    end: Joi.string().allow(null, ""),
    status: Joi.string().allow(null, ""),
    client: Joi.number(),
    owner: Joi.number(),
    price: Joi.number(),
  }),
};
const changeReservationStatus = {
  body: Joi.object().keys({
    id: Joi.number().required(),
    status: Joi.string().required(),
  }),
};

// PUBLICATIONS
const verifyPublication = {
  body: Joi.object().keys({
    isVerified: Joi.boolean().required(),
  }),
};

// IMAGES
const verifyOneImagePost = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    userEmail: Joi.string().required(),
    id: Joi.number().required(),
    route: Joi.string().required(),
    table: Joi.string().required(),
  }),
};

// TESTIMONIALS
const createTestimonial = {
  body: Joi.object().keys({
    video_url: Joi.string().required(),
    name: Joi.string().required(),
    position: Joi.string().required(),
    location: Joi.string().required(),
  }),
};

// GENERAL

const postNewCoverImage = {
  body: Joi.object().keys({
    imageUrl: Joi.string().required(),
    text: Joi.string().required(),
  }),
};
const putCoverImage = {
  body: Joi.object().keys({
    imageUrl: Joi.string().required(),
  }),
};
const putText = {
  body: Joi.object().keys({
    text: Joi.string().required(),
  }),
};

// ROOM
const postNewRoom = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow(null, ""),
    image: Joi.string().allow(null, ""),
    squareMeter: Joi.number().required(),
    locationId: Joi.number().required(),
    value: Joi.number().min(0).required(),
  }),
};
const updateRoom = {
  body: Joi.object().keys({
    name: Joi.string().allow(null, ""),
    description: Joi.string().allow(null, ""),
    image: Joi.string().allow(null, ""),
    squareMeter: Joi.number().allow(null, ""),
    locationId: Joi.number().required(),
    value: Joi.number(),
    isDeleted: Joi.boolean(),
    dailyValue: Joi.number(),
    isDaily: Joi.boolean(),
  }),
};
const updateRoomIsActive = {
  body: Joi.object().keys({
    locationId: Joi.number().required(),
    isActive: Joi.boolean().required(),
  }),
};
const updateRoomImage = {
  body: Joi.object().keys({
    image: Joi.string().allow(null, ""),
    locationId: Joi.number().required(),
  }),
};

module.exports = {
  verifyUser,
  activeStatus,
  makeOwner,
  asignAdminRol,
  setLocationsValue,
  activeLocationsStatus,
  verifyLocation,
  modifyLocation,
  createLocation,
  updateLocationCoverImage,
  createZone,
  modifyZone,
  activeZoneStatus,
  activeReviewStatus,
  verifyReview,
  modifyReservation,
  changeReservationStatus,
  verifyPublication,
  verifyOneImagePost,

  createTestimonial,

  postNewCoverImage,
  putCoverImage,
  putText,

  postNewRoom,
  updateRoom,
  updateRoomIsActive,
  updateRoomImage,
};
