export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

import { Location } from "../models/Location";
import { Reservation } from "../models/Reservation";
import { User } from "../models/User";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getPropertiesByOwnerId = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;

  const locations = await Location.find({
    relations: ["zone", "owner", "roomsDetails", "images3D"],
    where: {
      // isActive: true,
      isTrash: false,
      isDeleted: false,
      owner: id
    },
  });

  res.status(httpStatus.OK).json( locations );
});
const getReservationsByClientId = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;

  const locations = await Reservation.find({
    relations: ["owner", "client", "location", "room"],
    where: {
      clientId: id
    },
  });

  res.status(httpStatus.OK).json( locations );
});
const getPaymentsByClientId = catchAsync(async (req: any, res: any) => {

  const userFound = await User.findOne({
    where: {id:req.currentUser.id},
  });


  if (!userFound ) {
    throw new ApiError(httpStatus.NOT_FOUND, "Usuario no encontrado");
  }
  if (!userFound.stripeCustomerId ) {
    throw new ApiError(httpStatus.NOT_FOUND, "Id del cliente en stripe no disponible ");
  }

  const paymentIntents = await stripe.paymentIntents.list({
    customer:userFound.stripeCustomerId,
    // customer:"cus_NNrynlHAeYQEHU",
    limit:100
  });


  res.status(httpStatus.OK).json( paymentIntents );
});

module.exports = {
  getPropertiesByOwnerId,
  getReservationsByClientId,
  getPaymentsByClientId
};
