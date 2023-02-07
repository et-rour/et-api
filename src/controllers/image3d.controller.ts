export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

import { Image3d } from "../models/Image3d";
import { Location } from "../models/Location";

const get = catchAsync(async (req: any, res: any) => {
  const images = await Image3d.find({});

  if (!images.length) {
    return res.status(httpStatus.OK).json({ images: [] });
  }

  res.status(httpStatus.OK).json({ images });
});

const post = catchAsync(async (req: any, res: any) => {
  const { name, image, longitude, latitude, locationId } = req.body;

  const location = await Location.findOne({
    where: { id: locationId },
    relations: ["owner"],
  });

  if (!location) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "location not found" });
  }
  if (!req.currentUser.isAdmin) {
    if (location.owner.id !== req.currentUser.id) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "You are not the owner nor an admin" });
    }
  }

  const newImage3d = new Image3d();
  newImage3d.name = name;
  newImage3d.image = image;
  newImage3d.longitude = longitude;
  newImage3d.latitude = latitude;
  newImage3d.location = locationId;

  await newImage3d.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(newImage3d);
});

const updateImage3d = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { name, image, longitude, latitude, locationId } = req.body;

  const location = await Location.findOne({
    where: { id: locationId },
    relations: ["owner"],
  });

  if (!location) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "location not found" });
  }
  if (!req.currentUser.isAdmin) {
    if (location.owner.id !== req.currentUser.id) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "You are not the owner nor an admin" });
    }
  }

  const image3d = await Image3d.findOne({
    id,
  });

  if (!image3d) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "image not found" });
  }

  image3d.name = name;
  image3d.image = image;
  image3d.longitude = longitude;
  image3d.latitude = latitude;

  await image3d.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(image3d);
});

module.exports = {
  get,
  post,
  updateImage3d,
};
