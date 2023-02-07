export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");
import { getConnection, getRepository } from "typeorm";
/** Schemas */
import { createQueryBuilder } from "typeorm";

import { Zone } from "../models/Zone";

const get = catchAsync(async (req: any, res: any) => {
  const zones = await Zone.find({
    where: {
      isActive: true,
    }
  });

  if (!zones.length) {
    return res.status(httpStatus.OK).json({ zones: [] });
  }

  return res.status(httpStatus.OK).json({ zones });
});

module.exports = {
  get,
};
