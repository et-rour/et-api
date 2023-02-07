export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

import { Location } from "../models/Location";
import { User } from "../models/User";

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

module.exports = {
  getPropertiesByOwnerId,
};
