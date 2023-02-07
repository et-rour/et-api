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
import { Location } from "../models/Location";
import { Currency } from "../models/Currency";
import calculateValue from "../utils/calculator";

const post = catchAsync(async (req: any, res: any) => {
  const { locationId, zoneId, time, timeUse, expectedValue, currencyData } = req.body
  
  const zone = await Zone.find({
      where: {
          id: parseInt(zoneId)
      }
  });

  if(!zone.length) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not find zone');
  }

  const location = await Location.find({
    where: {
        id: locationId
    }
  });

  if(!location.length) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not find location');
  }

  const currency = await Currency.findOne({
    where: {
      country: currencyData,
    }
  });

  let parsedExpectedValue: number;

  if (!currency) {
    parsedExpectedValue = parseInt(expectedValue);
  } else {
    parsedExpectedValue = parseInt(expectedValue) /currency.value;
  }

  let calcParams = {
      zoneData: zone[0],
      locationData: location[0],
      time: time,
      timeUse: timeUse,
      expectedValue: parsedExpectedValue,
  }

  const result = calculateValue(calcParams);

  const finalRes = {
    ...result,
    currencyType: currency ? currency : 'default',
  }

  location[0].suggestedValue = result;
  location[0].expectedValue = expectedValue;

  await location[0].save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  console.log('--- FINAL RES ---', finalRes);

  res.status(httpStatus.OK).json(finalRes);
});

module.exports = {
  post
};
