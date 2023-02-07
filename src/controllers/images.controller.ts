export {};
/** Node Modules */
const httpStatus = require("http-status");
const {
  storage,
  storageRef,
  storageUploadBytes,
  storeGetDownloadURL,
} = require("../config/firebase");
const { getAdminStorage } = require("../config/firebaseAdmin");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const convert = require('heic-convert');

import { Images } from "../models/Images";
import { Location } from "../models/Location";
import { Publication } from "../models/Publication";
import { Room } from "../models/Room";
import validImageTableName from "../utils/validImageTableName";

const getAllImages = catchAsync(async (req: any, res: any) => {
  const images = await Images.find({});

  if (images.length === 0) {
    return res.status(httpStatus.OK).json({ images: [] });
  }

  res.status(httpStatus.OK).json({ images });
});

const getImagesByLocation = catchAsync(async (req: any, res: any) => {
  const { idLocation } = req.params;
  const images = await Images.find({
    id: idLocation,
  });

  if (images.length === 0) {
    return res.status(httpStatus.OK).json({ images: [] });
  }

  res.status(httpStatus.OK).json({ images });
});

const postImage = catchAsync(async (req: any, res: any) => {
  const { image, id, table } = req.body;

  let foudRow;
  let ownerIdFound;

  const newImage = new Images();
  newImage.image = image;

  switch (table) {
    // IMAGE FOR A LOCATION
    case 0:
      foudRow = await Location.findOne({
        where: { id },
        relations: ["owner"],
      });
      ownerIdFound = foudRow?.owner.id;
      newImage.location = id;

      break;
    // IMAGE FOR A PUBLCIATION
    case 1:
      foudRow = await Publication.findOne({
        where: { id },
        relations: ["user"],
      });
      ownerIdFound = foudRow?.user.id;
      newImage.publication = id;

      break;
    // IMAGE FOR A ROOM
    case 2:
      foudRow = await Room.findOne({
        where: { id },
        relations: ["location", "location.owner"],
      });
      ownerIdFound = foudRow?.location.owner.id;
      newImage.room = id;

      break;
  }

  if (!foudRow) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({ message: "table not found" });
  }
  if (!req.currentUser.isAdmin) {
    if (ownerIdFound !== req.currentUser.id) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "You are not the owner nor an admin" });
    }
  }

  await newImage.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(newImage);
});

const updateImageVisibility = catchAsync(async (req: any, res: any) => {
  const { isVisible } = req.body;
  const { idImage } = req.params;

  const foundImage = await Images.findOne({
    where: {
      id: idImage,
    },
    relations: ["location", "location.owner"],
  });

  if (!foundImage) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({ message: "image not found" });
  }

  if (!req.currentUser.isAdmin) {
    if (foundImage.location.owner.id !== req.currentUser.id) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "You are not the owner nor an admin" });
    }
  }

  foundImage.isVisible = isVisible;
  console.log("%cimages.controller.ts line:106 foundImage", "color: #007acc;", {
    foundImage,
  });

  await foundImage.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json({
    image: {
      id: foundImage.id,
      image: foundImage.image,
      isVisible: foundImage.isVisible,
    },
  });
});

const postImageRoom = catchAsync(async (req: any, res: any) => {
  const { image, roomId } = req.body;

  const foundedRoom = await Room.findOne({
    where: { id: roomId },
    relations: ["location", "location.owner"],
  });

  if (!foundedRoom) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "Room not found" });
  }
  if (!req.currentUser.isAdmin) {
    if (foundedRoom.location.owner.id !== req.currentUser.id) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "You are not the owner nor an admin" });
    }
  }

  const newImage = new Images();
  newImage.image = image;
  newImage.room = roomId;

  await newImage.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(newImage);
});

const deleteImage = catchAsync(async (req: any, res: any) => {
  const { idImage } = req.params;

  const foundedImage = await Images.findOne({
    where: { id:idImage },
  });

  if (!foundedImage) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "No se encontro el cuarto" });
  }

  await foundedImage.remove().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json({removed:true});
});

const uploadMulpipleToFirebase = catchAsync(async (req: any, res: any) => {
  const { id, route, table } = req.body;

  if (!validImageTableName.includes(table)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "¡¡Nombre de tabla incorrecto!!"
    );
  }

  await Promise.all(
    req.files.map(async (file: any) => {
      const currentDate = new Date().getTime();

      let imageBuffer = file.buffer;
      let imagePath = `${req.currentUser.email}${route}/${currentDate}${file.originalname}`;
      if (file.mimetype==="application/octet-stream") {
        const outputBuffer = await convert({
          buffer: imageBuffer, // the HEIC file buffer
          format: 'JPEG',      // output format
          quality: 0.92           // the jpeg compression quality, between 0 and 1
        });
        imageBuffer = outputBuffer
        imagePath = `${req.currentUser.email}${route}/${currentDate}${file.originalname.split(".")[0]}.jpeg`;
      }

      const fileSaved = getAdminStorage().bucket().file(imagePath);
      await fileSaved.save(imageBuffer);
      await fileSaved.makePublic();
      const url = fileSaved.publicUrl();



      const newImage = new Images();
      newImage.image = url;

      switch (table) {
        // IMAGE FOR A LOCATION
        case "location":
          newImage.location = id;

          break;
        // IMAGE FOR A PUBLCIATION
        case "publication":
          newImage.publication = id;

          break;
        // IMAGE FOR A ROOM
        case "room":
          newImage.room = id;

          break;
        default:
          break;
      }

      await newImage.save().catch((error) => {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
      });
    })
  );
  res.status(httpStatus.OK).json({ success: true });
});

module.exports = {
  getAllImages,
  getImagesByLocation,
  postImage,
  updateImageVisibility,
  postImageRoom,
  uploadMulpipleToFirebase,
  deleteImage
};
