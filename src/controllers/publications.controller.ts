export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");
import { getConnection, getManager, getRepository } from "typeorm";
/** Schemas */
import { createQueryBuilder } from "typeorm";

import { User } from "../models/User";
import { Publication } from "../models/Publication";
import { Images } from "../models/Images";

const getAllverifiedPosts = catchAsync(async (req: any, res: any) => {
  const publications = await getRepository(Publication)
    .createQueryBuilder("publication")
    .leftJoinAndSelect("publication.user", "user")
    .leftJoinAndSelect(
      "publication.imagesPublication",
      "images",
      "images.isVisible=true"
    )
    .where("publication.isVerified=true")
    .getMany();

  if (!publications.length) {
    return res.status(httpStatus.OK).json({ publications: [] });
  }

  res.status(httpStatus.OK).json({ publications });
});

const getAll = catchAsync(async (req: any, res: any) => {
  const publications = await Publication.createQueryBuilder("publication")
    .innerJoinAndSelect("publication.user", "user")
    .leftJoinAndSelect("publication.imagesPublication", "images")
    .getMany();

  if (!publications.length) {
    return res.status(httpStatus.OK).json({ publications: [] });
  }

  res.status(httpStatus.OK).json({ publications });
});

const getByUser = catchAsync(async (req: any, res: any) => {
  const id = req.params.id;

  const publications = await Publication.find({
    where: {
      user: id,
    },
    relations: ["user"],
  });

  if (!publications.length) {
    return res.status(httpStatus.OK).json({ publications: [] });
  }

  res.status(httpStatus.OK).json({ publications });
});

const post = catchAsync(async (req: any, res: any) => {
  const { title, description, user, image, webSite, instagram } = req.body;

  const creatorUser = await User.findOne({
    where: {
      id: user,
    },
  });

  if (!creatorUser) {
    return res
      .status(httpStatus.METHOD_NOT_ALLOWED)
      .json("User could not be found");
  } else {
    if (!creatorUser.didReview) {
      return res
        .status(httpStatus.METHOD_NOT_ALLOWED)
        .json({ message: "User must make a review before publicating" });
    }
  }

  const existing = await Publication.find({
    where: {
      title: title,
      description: description,
      user: user,
    },
  });

  if (existing.length) {
    return res
      .status(httpStatus.METHOD_NOT_ALLOWED)
      .json({ message: "Publication already exists" });
  }

  const newPublicacion = new Publication();
  newPublicacion.title = title;
  newPublicacion.description = description;
  newPublicacion.user = user;
  newPublicacion.image = image;
  newPublicacion.webSite = webSite;
  newPublicacion.instagram = instagram;
  newPublicacion.isVerified = false;

  await newPublicacion.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(newPublicacion);
});

module.exports = {
  getAll,
  getByUser,
  post,
  getAllverifiedPosts,
};
