export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");
const {
  storage,
  storageRef,
  storageUploadBytes,
  storeGetDownloadURL,
} = require("../config/firebase");

const { getAuth, signInWithCustomToken } = require("firebase/auth");

import { General } from "../models/General";

const getCovers = catchAsync(async (req: any, res: any) => {
  const coversData = await General.find();
  
  if (!coversData) {
    throw new ApiError(httpStatus.NOT_FOUND, "No hay imagenes disponibles");
  }

  return res.status(httpStatus.OK).json(coversData);
});
module.exports = {
  getCovers,
};
