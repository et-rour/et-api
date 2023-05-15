export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");
import moment from "moment";
import { getConnection, getRepository } from "typeorm";
/** Schemas */
import { createQueryBuilder } from "typeorm";

import { Location } from "../models/Location";
import { Reservation } from "../models/Reservation";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { Zone } from "../models/Zone";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const get = catchAsync(async (req: any, res: any) => {
  const locations = await Location.find({
    relations: ["zone", "owner", "roomsDetails"],
    order: {
      isActive: "DESC",
      order: "ASC",
    },
    where: {
      // isActive: true,
      isVerified: true,
      isTrash: false,
      isDeleted: false,
    },
  });

  if (!locations.length) {
    return res.status(httpStatus.OK).json({ locations: [] });
  }

  res.status(httpStatus.OK).json({ locations });
});

const getLocationById = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  // const location = await Location.findOne({
  //   relations: ["zone", "owner", "roomsDetails", "images3D", "imagesLocation"],
  //   where: {
  //     id,
  //   },
  // });

  const location = await Location.createQueryBuilder("location")
    .innerJoinAndSelect("location.zone", "zone")
    .innerJoinAndSelect("location.owner", "user")
    .leftJoinAndSelect(
      "location.roomsDetails",
      "room",
      "room.isDeleted = false"
    )
    .leftJoinAndSelect("room.reservations", "reservation")
    .leftJoinAndSelect("room.imagesRoom", "imagesRoom")
    .leftJoinAndSelect("location.images3D", "image3D")
    .leftJoinAndSelect(
      "location.reservations",
      "reservations",
      "reservations.roomId IS NULL"
    )
    .leftJoinAndSelect(
      "location.imagesLocation",
      "images",
      "images.isVisible=true"
    )
    .where("location.id = :id", { id })
    .getOne();

  if (!location) {
    return res.status(httpStatus.NOT_FOUND).json("location not found");
  }

  res.status(httpStatus.OK).json({ location });
});

const getLocationsByOwner = catchAsync(async (req: any, res: any) => {
  const { idOwner } = req.params;

  const locations = await Location.find({
    relations: ["zone", "owner", "roomsDetails", "images3D"],
    where: {
      // isActive: true,
      isTrash: false,
      isDeleted: false,
      owner: idOwner,
    },
  });

  if (!locations.length) {
    return res.status(httpStatus.OK).json({ locations: [] });
  }

  res.status(httpStatus.OK).json({ locations });
});

const getAllLocationsForAdmin = catchAsync(async (req: any, res: any) => {
  const locations = await Location.find({
    relations: ["zone", "owner", "roomsDetails", "images3D"],
  });

  if (!req.currentUser || req.currentUser.isAdmin !== true) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "You must be an admin" });
  }

  if (!locations.length) {
    return res.status(httpStatus.OK).json({ locations: [] });
  }

  res.status(httpStatus.OK).json({ locations });
});

const post = catchAsync(async (req: any, res: any) => {
  const {
    name,
    address,
    zone,
    rooms,
    bathrooms,
    painting,
    floor,
    user,
    imageUrl,
    email,
    phone,
    description,
    garage,
    propertyType,
    landUse,
    lat,
    lng,
    meters,
    unused,
  } = req.body;

  const existing = await Location.find({
    where: {
      name: name,
      address: address,
      zone: zone,
      rooms: rooms,
      bathrooms: bathrooms,
      painting: painting,
      floor: floor,
    },
    relations: ["zone"],
  });

  if (existing.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "Location already exists");
  }

  const userDetails = await User.findOne({ id: user });

  if (!userDetails) {
    return res.status(httpStatus.NOT_FOUND).json("User not found");
  }

  if (!userDetails.isClient) {
    userDetails.isClient = true;
    await userDetails.save().catch((error) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  const product = await stripe.products.create({ name: name });

  const newLocation = new Location();
  newLocation.name = name;
  newLocation.address = address;
  newLocation.zone = zone;
  newLocation.rooms = parseInt(rooms);
  newLocation.bathrooms = parseInt(bathrooms);
  newLocation.painting = parseInt(painting);
  newLocation.floor = parseInt(floor);
  newLocation.isVerified = false;
  newLocation.isActive = false;
  newLocation.value = 0;
  newLocation.createdByAdmin = false;
  newLocation.owner = user;
  newLocation.image = imageUrl;
  newLocation.email = email;
  newLocation.phone = phone;
  newLocation.garage = parseInt(garage);
  newLocation.description = description;
  newLocation.stripeProductId = product.id;
  newLocation.propertyType = propertyType;
  newLocation.landUse = landUse;
  newLocation.lat = lat ? lat : "-33.469230";
  newLocation.long = lng ? lng : "-70.576469";
  newLocation.squareMeters = meters;
  newLocation.unused = parseInt(unused);
  newLocation.calendlyLink = `${process.env.CALENDLY_LINK}`;

  console.log("location body reqquest", newLocation);

  await newLocation.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  const locationCreated = await Location.findOne({
    where: { id: newLocation.id },
    relations: ["zone"],
  });

  res.status(httpStatus.OK).json(locationCreated);
});

const updateLeaseRange = catchAsync(async (req: any, res: any) => {
  const { start, end, locationId } = req.body;

  const location = await Location.findOne({
    where: { id: locationId },
    relations: ["owner"],
  });

  if (!location) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ response: "No se encontro la propiedad" });
  }
  if (req.currentUser.id !== location.owner.id) {
    if (!req.currentUser || req.currentUser.isAdmin !== true) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "No tienes los permisos necesarios." });
    }
  }

  location.startLease = start;
  location.endLease = end;

  await location.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });
  res.status(httpStatus.OK).json(location);
});

const updateLocation = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { startLease, endLease, isActive } = req.body;

  const foundLocation = await Location.findOne({
    where: { id },
    relations: ["owner"],
  });

  if (!foundLocation) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ response: "No se encontro la propiedad" });
  }
  if (req.currentUser.id !== foundLocation.owner.id) {
    if (!req.currentUser || req.currentUser.isAdmin !== true) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "No tienes los permisos necesarios." });
    }
  }

  console.log(
    "%clocations.controller.ts line:271 req.body",
    "color: white; background-color: #007acc;",
    req.body
  );

  foundLocation.startLease = startLease;
  foundLocation.endLease = endLease;
  foundLocation.isActive = isActive;

  await foundLocation.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });
  res.status(httpStatus.OK).json(foundLocation);
});

const updateLocationValue = catchAsync(async (req: any, res: any) => {
  const { locationId, locationValue } = req.body;

  const location = await Location.findOne({ id: locationId });

  if (!location) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ response: "No se encontro la propiedad" });
  }

  let product;
  if (!location.stripeProductId) {
    const stripeProduct = await stripe.products.create({ name: location.name });
    product = stripeProduct.id;
    location.stripeProductId = product.id;
  } else {
    product = location.stripeProductId;
  }
  const price = await stripe.prices.create({
    product: product,
    unit_amount: locationValue,
    currency: "clp",
  });

  location.value = locationValue;
  location.stripePriceId = price.id;

  await location.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });
  res.status(httpStatus.OK).json({ location });
});
/*
const createCheckoutSession = catchAsync(async (req: any, res: any) => {
  const { userId, locationId, isLocation, range } = req.body;

  const user = await User.findOne({ id: userId });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "The user is not registerd");
  }

  // find the location or room stripe price id
  // isLocation if you are trying to rent a full location
  // !isLocation if you are trying to rent a Room
  let owner_id;
  let price_id;
  let location_id;
  let room_id;

  if (isLocation) {
    const foundLocation = await Location.findOne({
      relations: ["owner"],
      where: { id: locationId },
    });
    if (!foundLocation) {
      throw new ApiError(httpStatus.NOT_FOUND, "The space doesn't exists");
    }
    owner_id = foundLocation.owner.id;
    price_id = foundLocation.stripePriceId;
    location_id = foundLocation.id;
  } else {
    const foundRoom = await Room.findOne({
      relations: ["location", "location.owner"],
      where: { id: locationId },
    });
    if (!foundRoom) {
      throw new ApiError(httpStatus.NOT_FOUND, "The space doesn't exists");
    }
    owner_id = foundRoom.location.owner.id;
    price_id = foundRoom.stripePriceId;
    location_id = foundRoom.location.id;
    room_id = foundRoom.id;
  }

  // validate date range start before end
  const rangeStart = moment(range.start);
  const rangeEnd = moment(range.end);
  console.log(
    "%clocations.controller.ts line:297 {dates}",
    "color: white; background-color: red;",
    {
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
    }
  );
  if (rangeStart.isAfter(rangeEnd)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Rango de fechas invalidas. \n La fecha de inicio debe ser antes que la fecha fin."
    );
  }

  const invalidSameDateReservations = await getRepository(Reservation)
    .createQueryBuilder("reservation")
    .where(
      `:start BETWEEN reservation.start AND reservation.end 
      OR :end BETWEEN reservation.start AND reservation.end
      OR reservation.start BETWEEN :start AND :end 
      OR reservation.end BETWEEN :start AND :end 
      `,
      { start: rangeStart.toDate(), end: rangeEnd.toDate() }
    )
    .getCount();

  console.log(
    "%cerror locations.controller.ts line:316 ",
    "color: red; display: block; width: 100%;",
    invalidSameDateReservations
  );
  if (invalidSameDateReservations > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Rango de fechas invalidas. \n Alguna de las fechas se sobrepone a otra reservación."
    );
  }
  // validate start and end dates, should´n be in any other reservations

  const session = await stripe.checkout.sessions.create({
    metadata: {
      owner_id: `${owner_id}`,
      client_id: `${user.id}`,
      isARoom: `${!isLocation}`,
      location_id: `${location_id}`,
      room_id: `${room_id}`,
      reservationStart: range.start,
      reservationEnd: range.end,
    },
    customer_email: user.email,
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: price_id,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/stripe/success`,
    cancel_url: `${process.env.CLIENT_URL}/stripe/cancel`,
  });

  res.json({ url: session.url });
});

const webhook = catchAsync(async (request: any, response: any) => {
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      process.env.STRIPE_SECRET_WEBHOOK
    );
  } catch (err: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }
  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const paymentIntent = event.data.object;

      const userDetails = await User.findOne({
        id: paymentIntent.metadata.client_id,
      });
      if (!userDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, `User not found`);
      }
      if (!userDetails.isClient) {
        userDetails.isClient = true;
        await userDetails.save().catch((error) => {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
        });
      }

      // Then define and call a function to handle the event payment_intent.succeeded
      const {
        owner_id,
        client_id,
        location_id,
        room_id,
        isARoom,
        reservationStart,
        reservationEnd,
      } = paymentIntent.metadata;

      const reservationStartDate = moment(Number(reservationStart)).toDate();
      const reservationEndDate = moment(Number(reservationEnd)).toDate();

      const reservation = new Reservation();
      reservation.start = reservationStartDate;
      reservation.end = reservationEndDate;
      reservation.client = client_id;
      reservation.owner = owner_id;
      reservation.price = paymentIntent.amount_total;
      reservation.status = "created";
      reservation.location = location_id;

      if (isARoom === "true") {
        reservation.room = room_id;
      }

      await reservation.save().catch((error) => {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
      });

      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.json({ received: true });
});
*/

const changeLocationIsActiveProperty = catchAsync(
  async (req: any, res: any) => {
    const { idLocation } = req.params;
    const { active } = req.body;

    const location = await Location.findOne({ id: idLocation });

    if (!location) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Location not found" });
    }

    if (!req.currentUser || req.currentUser.isAdmin !== true) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "You must be an admin" });
    }
    location.isActive = active;

    await location.save().catch((error: any) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });

    return res.status(httpStatus.OK).json(location);
  }
);

module.exports = {
  getLocationById,
  get,
  getLocationsByOwner,
  getAllLocationsForAdmin,
  post,
  updateLeaseRange,
  updateLocationValue,
  // createCheckoutSession,
  // webhook,
  changeLocationIsActiveProperty,
  updateLocation,
};
