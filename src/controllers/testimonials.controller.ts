export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

import { Testimonial } from "../models/Testimonial";

const getTestimonials = catchAsync(async (req: any, res: any) => {
  const testimonials = await Testimonial.find();
  
  if (!testimonials) {
    throw new ApiError(httpStatus.NOT_FOUND, "No hay imagenes disponibles");
  }

  return res.status(httpStatus.OK).json(testimonials);
});

const getTestimonialById = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const testimonial = await Testimonial.findOne({
    where: { id },
  });

  if (!testimonial) {
    throw new ApiError(httpStatus.NOT_FOUND, "No hay imagenes disponibles");
  }

  return res.status(httpStatus.OK).json(testimonial);
});

module.exports = {
  getTestimonialById,
  getTestimonials,
};
