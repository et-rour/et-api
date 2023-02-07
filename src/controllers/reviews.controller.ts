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

import { User } from "../models/User";
import { Review } from "../models/Review";

const getAll = catchAsync(async (req: any, res: any) => {
  const reviews = await Review.find({
    relations: ["creator", "receiver"],
    where: {
      isActive: true,
      isVerified: true,
    }
  });

  if (!reviews.length) {
    return res.status(httpStatus.OK).json({ reviews: [] });
  }

  res.status(httpStatus.OK).json({ reviews });
});

const getByCreator = catchAsync(async (req: any, res: any) => {

    const id = req.params.id;

    const reviews = await Review.find({
        where: {
            creator: id,
            isVerified: true,
            isActive: true,
        },
        relations: ["creator", "receiver"]
    });
  
    if (!reviews.length) {
      return res.status(httpStatus.OK).json({ reviews: [] });
    }
  
    res.status(httpStatus.OK).json({ reviews });
});

const getByReceiver = catchAsync(async (req: any, res: any) => {

    const id = req.params.id;

    const reviews = await Review.find({
        where: {
            receiver: id,
            isActive: true,
            isVerified: true,
        },
        relations: ["creator", "receiver"]
    });
  
    if (!reviews.length) {
      return res.status(httpStatus.OK).json({ reviews: [] });
    }
  
    res.status(httpStatus.OK).json({ reviews });
});

const post = catchAsync(async (req: any, res: any) => {
  const { title, comment, review, creator, receiver } = req.body;

  if(!title || !comment || !review || !creator || !receiver) {
      return res.status(httpStatus.OK).json("All fields must be completed");
  }

  const existing = await Review.find({
    where: {
      title: title,
      comment: comment,
      review: review,
      creator: creator,
      receiver: receiver,
    },
  });

  if (existing.length) {
    return res
      .status(httpStatus.METHOD_NOT_ALLOWED)
      .json("Review already exists");
  }

  const newReview = new Review();
  newReview.title = title;
  newReview.comment = comment;
  newReview.review = review;
  newReview.creator = creator;
  newReview.receiver = receiver;
  newReview.isVerified = false,
  newReview.isActive = true,

  await newReview.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  const creatorUser = await User.find({
      where: {
          id: creator,
      }
  })

  if(creatorUser.length) {
      creatorUser[0].didReview = true;
  } else {
    return res
    .status(httpStatus.METHOD_NOT_ALLOWED)
    .json("Could not find creator user");
  }

  await creatorUser[0].save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(newReview);
});

module.exports = {
  getAll,
  getByCreator,
  getByReceiver,
  post,
};
