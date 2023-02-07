export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
import { General } from "../models/General";
import { Personal } from "../models/Personal";

const getAllPersonalMembers = catchAsync(async (req: any, res: any) => {
  const allPersonalMembers = await Personal.find({});

  return res.status(httpStatus.OK).json(allPersonalMembers);
});

const postNewPersonalMember = catchAsync(async (req: any, res: any) => {
  const { name, email, image, position } = req.body;

  const newPersonalMember = new Personal();
  newPersonalMember.name = name;
  newPersonalMember.email = email;
  newPersonalMember.image = image;
  newPersonalMember.position = position;

  await newPersonalMember.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json({ newMember: newPersonalMember });
});

const updatePersonalMember = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { name, email, image, position, isVisible, isEmailVisible } = req.body;

  const foundPersonalMember = await Personal.findOne({
    where: { id },
  });

  if (!foundPersonalMember) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No se encontro al miembro del personal"
    );
  }

  foundPersonalMember.name = name;
  foundPersonalMember.email = email;
  foundPersonalMember.image = image;
  foundPersonalMember.position = position;
  foundPersonalMember.name = name;
  foundPersonalMember.isVisible = isVisible;
  foundPersonalMember.isEmailVisible = isEmailVisible;

  await foundPersonalMember.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(foundPersonalMember);
});

module.exports = {
  updatePersonalMember,
  getAllPersonalMembers,
  postNewPersonalMember,
};
