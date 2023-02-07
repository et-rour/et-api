export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

import { Room } from "../models/Room";
import { Location } from "../models/Location";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const get = catchAsync(async (req: any, res: any) => {
  const rooms = await Room.find({
    relations: ["location"],
  });

  if (!rooms.length) {
    return res.status(httpStatus.OK).json({ rooms: [] });
  }

  res.status(httpStatus.OK).json({ rooms });
});
const getRoomById = catchAsync(async (req: any, res: any) => {
  const { idRoom } = req.params;
  const room = await Room.findOne({
    where: { id: idRoom },
  });

  if (!room) {
    return res.status(httpStatus.NOT_FOUND).json("Room not found");
  }

  res.status(httpStatus.OK).json(room);
});


module.exports = {
  get,
  getRoomById,
};
