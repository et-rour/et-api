export {};

/** firebase storage*/
const {
  storage,
  storageRef,
  storageUploadBytes,
  storeGetDownloadURL,
} = require("../config/firebase");

/** Node Modules */
const httpStatus = require("http-status");
import moment from "moment";
/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");
const { transporter } = require("../utils/sendWelcomeEmail");
const { getAdminStorage } = require("../config/firebaseAdmin");

const { promisify } = require('util');
const convert = require('heic-convert');

/** Schemas */

const { getAuth, signInWithCustomToken } = require("firebase/auth");

const admin = require("../config/firebaseAdmin").firebase_admin_connect();

import * as Fake from "../utils/fakeData";

import { User } from "../models/User";
import { Location } from "../models/Location";
import { Zone } from "../models/Zone";
import { Review } from "../models/Review";
import { Reservation } from "../models/Reservation";
import { Image3d } from "../models/Image3d";
import { Publication } from "../models/Publication";
import { Images } from "../models/Images";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// USERS
const getAllUsers = catchAsync(async (req: any, res: any) => {
  const users = await User.find({
    where: {
      isTrash: false,
      isDeleted: false,
    },
  });

  if (!users.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "Could not find any user");
  }

  return res.status(httpStatus.OK).json(users);
});

const getTrashUsers = catchAsync(async (req: any, res: any) => {
  const users = await User.find({
    where: {
      isTrash: true,
      isDeleted: false,
    },
  });

  if (!users.length) {
    // throw new ApiError(
    //   httpStatus.INTERNAL_SERVER_ERROR,
    //   "Could not find any user"
    // );
    return res.status(httpStatus.OK).json({users: []});
  }

  return res.status(httpStatus.OK).json({ users });
});

const getUserById = catchAsync(async (req: any, res: any) => {
  const id = req.params.id;

  const users = await User.findOne({
    relations: [
      "locations",
      "createdReviews",
      "receivedReviews",
      "createdReviews.receiver",
      "receivedReviews.creator",
      "clientReservations",
      "ownerReservations",
      "clientReservations.location",
      "ownerReservations.location",
      "clientReservations.room",
      "ownerReservations.room",
    ],
    where: {
      id: id,
      isTrash: false,
      isDeleted: false,
    },
  });

  if (!users) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any user"
    );
  }

  return res.status(httpStatus.OK).json(users);
});

const getUserByIdTrash = catchAsync(async (req: any, res: any) => {
  const id = req.params.id;

  const users = await User.findOne({
    relations: [
      "locations",
      "createdReviews",
      "receivedReviews",
      "createdReviews.receiver",
      "receivedReviews.creator",
      "clientReservations",
      "ownerReservations",
      "clientReservations.location",
      "ownerReservations.location",
      "clientReservations.room",
      "ownerReservations.room",
    ],
    where: {
      id: id,
      isTrash: true,
      isDeleted: false,
    },
  });

  if (!users) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any user"
    );
  }

  return res.status(httpStatus.OK).json(users);
});

const verifyUser = catchAsync(async (req: any, res: any) => {
  const { id } = req.body;

  const user = await User.findOne({
    where: {
      id: parseInt(id),
    },
    relations: ["locations", "createdReviews", "receivedReviews"],
  });

  if (!user) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected user"
    );
  }

  user.isVerified = true;

  await user.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(user);
});

const deleteUser = catchAsync(async (req: any, res: any) => {
  const { id } = req.body;

  console.log('LOG 1', id)

  const user = await User.findOne({
    where: {
      id: id,
    }
  })

  console.log('LOG 2', user)

  if (user) {
    user.isTrash = true;

    await user.save().catch((error: any) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  return res
    .status(httpStatus.OK)
    .json(user);
});

const deleteUserPermanent = catchAsync(async (req: any, res: any) => {
  const { id } = req.body;

  const user = await User.findOne({
    where: {
      id: id,
    }
  })

  if (user) {
    user.isTrash = true;
    user.isDeleted = true;

    await user.save().catch((error: any) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  return res
    .status(httpStatus.OK)
    .json(user);
});

const restoreUser = catchAsync(async (req: any, res: any) => {
  const { id } = req.body;

  const user = await User.findOne({
    where: {
      id: id,
    }
  })

  if (user) {
    user.isTrash = false;
    user.isDeleted = false;

    await user.save().catch((error: any) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  return res
    .status(httpStatus.OK)
    .json(user);
});

const asignAdminRol = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { isAdmin } = req.body;
  const user = await User.findOne({
    where: {
      id,
    },
  });

  if (!user) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected user"
    );
  }

  user.isAdmin = isAdmin;

  await user.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res
    .status(httpStatus.OK)
    .json({ user: user.email, isAdmin: user.isAdmin });
});

const activeStatus = catchAsync(async (req: any, res: any) => {
  const { id, isActive } = req.body;

  const user = await User.findOne({
    where: {
      id: id,
    },
    relations: ["locations", "createdReviews", "receivedReviews"],
  });

  if (!user) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected user"
    );
  }

  user.isActive = isActive;

  await user.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res
    .status(httpStatus.OK)
    .json({ idUser: user.id, isActive: user.isActive });
});

const makeOwner = catchAsync(async (req: any, res: any) => {
  const { id, isOwner } = req.body;

  const user = await User.findOne({
    where: {
      id: id,
    },
    relations: ["locations", "createdReviews", "receivedReviews"],
  });

  if (!user) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected user"
    );
  }

  user.isOwner = isOwner;

  await user.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res
    .status(httpStatus.OK)
    .json({ idUser: user.id, isOwner: user.isOwner });
});

// LOCATIONS
const getAllLocations = catchAsync(async (req: any, res: any) => {
  const locations = await Location.find({
    where: {
      isTrash: false,
      isDeleted: false,
    },
    relations: ["zone"],
    order: { id: "ASC" },
  });

  if (!locations.length) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any location"
    );
  }

  return res.status(httpStatus.OK).json({ locations });
});

const getTrashLocations = catchAsync(async (req: any, res: any) => {
  const locations = await Location.find({
    where: {
      isTrash: true,
      isDeleted: false,
    },
    relations: ["zone"],
    order: { id: "ASC" },
  });

  if (!locations.length) {
    // throw new ApiError(
    //   httpStatus.INTERNAL_SERVER_ERROR,
    //   "Could not find any location"
    // );
    return res.status(httpStatus.OK).json({ locations: [] });
  }

  return res.status(httpStatus.OK).json({ locations });
});

const getLocationById = catchAsync(async (req: any, res: any) => {
  const id = req.params.id;

  // const location = await Location.findOne({
  //   relations: ["zone", "owner", "roomsDetails", "images3D", "imagesLocation"],
  //   where: { id: id },
  // });
  const location = await Location.createQueryBuilder("location")
    .where("location.id = :id", { id })
    .innerJoinAndSelect("location.zone", "zone")
    .innerJoinAndSelect("location.owner", "user")
    .leftJoinAndSelect(
      "location.roomsDetails", 
      "room",
      "room.isDeleted = false"
    )
    .leftJoinAndSelect("room.imagesRoom", "imagesRoom")
    .leftJoinAndSelect("location.images3D", "image3D")
    .leftJoinAndSelect("location.imagesLocation", "images")
    .getOne();

  if (!location) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any location"
    );
  }

  return res.status(httpStatus.OK).json(location);
});

const setLocationsValue = catchAsync(async (req: any, res: any) => {
  const { locationId, locationValue } = req.body;

  const location = await Location.findOne({ id: locationId });

  if (!location) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any location"
    );
  }

  let product;
  if (!location.stripeProductId) {
    const productStripe = await stripe.products.create({ name: location.name });
    location.stripeProductId = productStripe.id;
    product = productStripe.id;
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

  return res.status(httpStatus.OK).json({
    value: location.value,
    stripePriceId: location.stripePriceId,
    stripeProductId: location.stripeProductId,
  });
});

const activeLocationsStatus = catchAsync(async (req: any, res: any) => {
  const { id, isActive } = req.body;

  const location = await Location.findOne({
    where: {
      id: id,
    },
    relations: ["zone", "owner", "roomsDetails", "images3D"],
  });

  if (!location) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected location"
    );
  }

  location.isActive = isActive;

  await location.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res
    .status(httpStatus.OK)
    .json({ idLocation: location.id, isActive: location.isActive });
});

const verifyLocation = catchAsync(async (req: any, res: any) => {
  const { id, isVerified } = req.body;

  const location = await Location.findOne({
    where: {
      id: id,
    },
    relations: ["zone", "owner", "roomsDetails", "images3D"],
  });

  if (!location) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected location"
    );
  }

  location.isVerified = isVerified;

  await location.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res
    .status(httpStatus.OK)
    .json({ idLocation: location.id, isVerified: location.isVerified });
});

const modifyLocation = catchAsync(async (req: any, res: any) => {
  const {
    id,
    name,
    address,
    rooms,
    bathrooms,
    painting,
    floor,
    email,
    phone,
    description,
    garage,
    zone,
    user,
    lat,
    lng,
    meters,
    vault,
    cleaning,
    wifi,
    security,
    landUse,
    unused,
    calendlyLink
  } = req.body;

  if (zone) {
    const selectedZone = await Zone.findOne({
      where: {
        id: zone,
      },
    });
    if (!selectedZone) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Please provide a valid zone"
      );
    }
  }

  if (user) {
    const selectedUser = await User.findOne({
      where: {
        id: user,
      },
    });
    if (!selectedUser) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Please provide a valid user"
      );
    }
  }

  const location = await Location.findOne({
    where: {
      id: id,
    },
  });

  if (!location) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected location"
    );
  }

  location.name = name;
  location.address = address;
  location.rooms = rooms;
  location.bathrooms = bathrooms;
  location.painting = painting;
  location.floor = floor;
  location.email = email;
  location.phone = phone;
  location.description = description;
  location.garage = garage;
  location.zone = zone;
  location.owner = user;
  location.lat = lat;
  location.long = lng;
  location.squareMeters = meters;
  location.vault = vault;
  location.cleaning = cleaning;
  location.wifi = wifi;
  location.security = security;
  location.landUse = landUse;
  location.unused = unused;
  location.calendlyLink = calendlyLink;

  await location.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(location);
});

const deleteLocation = catchAsync(async (req: any, res: any) => {
  const { id } = req.body;

  const location = await Location.findOne({
    where: {
      id: id,
    }
  })

  if (location) {
    location.isTrash = true;

    await location.save().catch((error: any) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  return res
    .status(httpStatus.OK)
    .json(location);
});

const deleteLocationPermanent = catchAsync(async (req: any, res: any) => {
  const { id } = req.body;

  const location = await Location.findOne({
    where: {
      id: id,
    }
  })

  if (location) {
    location.isTrash = true;
    location.isDeleted = true;

    await location.save().catch((error: any) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  return res
    .status(httpStatus.OK)
    .json(location);
});

const restoreLocation = catchAsync(async (req: any, res: any) => {
  const { id } = req.body;

  const location = await Location.findOne({
    where: {
      id: id,
    }
  })

  if (location) {
    location.isTrash = false;
    location.isDeleted = false;

    await location.save().catch((error: any) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  return res
    .status(httpStatus.OK)
    .json(location);
});

const updateLocationCoverImage = catchAsync(async (req: any, res: any) => {
  const { image } = req.body;

  const { idLocation } = req.params;
  const location = await Location.findOne({
    where: {
      id: idLocation,
    },
  });

  if (!location) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected location"
    );
  }

  location.image = image;

  await location.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json({ image: location.image });
});

const createLocation = catchAsync(async (req: any, res: any) => {
  const {
    name,
    address,
    rooms,
    bathrooms,
    painting,
    floor,
    email,
    phone,
    description,
    garage,
    owner,
    zone,
    propertyType,
    isActive,
    isVerified,
    lat,
    lng,
    meters,
    vault,
    cleaning,
    wifi,
    security,
  } = req.body;

  console.log("kjfghdjshgjsdfh", req.body);

  if (zone) {
    const selectedZone = await Zone.findOne({
      where: {
        id: zone,
      },
    });
    if (!selectedZone) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Please provide a valid zone"
      );
    }
  }

  if (owner) {
    const selectedUser = await User.findOne({
      where: {
        id: owner,
      },
    });
    if (!selectedUser) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Please provide a valid user"
      );
    }
  }

  const location = new Location();

  location.name = name;
  location.address = address;
  location.rooms = rooms;
  location.bathrooms = bathrooms;
  location.painting = painting;
  location.floor = floor;
  location.email = email;
  location.phone = phone;
  location.description = description;
  location.garage = garage;
  location.zone = zone;
  location.owner = owner;
  location.propertyType = propertyType;
  location.landUse = 'commercial';
  location.isActive = false;
  location.isVerified = false;
  // location.value = value ? value : 0;
  location.lat = lat;
  location.long = lng;
  location.squareMeters = meters;
  location.vault = vault;
  location.cleaning = cleaning;
  location.wifi = wifi;
  location.security = security;
  location.createdByAdmin = true;
  location.calendlyLink = `${process.env.CALENDLY_LINK}`


  await location.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(location);
});

// ZONES
const getAllZones = catchAsync(async (req: any, res: any) => {
  const zones = await Zone.find();

  if (!zones.length) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any zone"
    );
  }

  return res.status(httpStatus.OK).json(zones);
});

const getZoneById = catchAsync(async (req: any, res: any) => {
  const id = req.params.id;

  const zone = await Zone.findOne({
    where: { id: id },
  });

  if (!zone) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any user"
    );
  }

  return res.status(httpStatus.OK).json(zone);
});

const createZone = catchAsync(async (req: any, res: any) => {
  const { country, city, state, zone, centerCoordinates, rate, averageValue } =
    req.body;

  const existing = await Zone.find({
    where: {
      country: country,
      state: state,
      city: city,
      zone: zone,
    },
  });

  if (existing.length) {
    return res.status(httpStatus.OK).json("Zone already exists");
  }

  const newZone = new Zone();

  newZone.country = country;
  newZone.state = state;
  newZone.city = city;
  newZone.zone = zone;
  newZone.centerCoordinates = centerCoordinates;
  newZone.rate = rate;
  newZone.averageValue = averageValue;
  newZone.isActive = true;

  await newZone.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(newZone);
});

const modifyZone = catchAsync(async (req: any, res: any) => {
  const {
    id,
    country,
    city,
    state,
    zone,
    centerCoordinates,
    rate,
    averageValue,
  } = req.body;

  const selectedZone = await Zone.findOne({
    where: {
      id: id,
    },
  });

  if (!selectedZone) {
    return res.status(httpStatus.OK).json("Could not find any zone");
  }

  selectedZone.country = country ? country : selectedZone.country;
  selectedZone.city = city ? city : selectedZone.city;
  selectedZone.state = state ? state : selectedZone.state;
  selectedZone.zone = zone ? zone : selectedZone.zone;
  selectedZone.centerCoordinates = centerCoordinates
    ? centerCoordinates
    : selectedZone.centerCoordinates;
  selectedZone.rate = rate ? rate : selectedZone.rate;
  selectedZone.averageValue = averageValue
    ? averageValue
    : selectedZone.averageValue;
  selectedZone.isActive = true;

  await selectedZone.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(selectedZone);
});

const activeZoneStatus = catchAsync(async (req: any, res: any) => {
  const { id, isActive } = req.body;

  const zone = await Zone.findOne({
    where: {
      id: id,
    },
  });

  if (!zone) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected zone"
    );
  }

  const zoneLocations = await Location.find({
    where: {
      zone: id,
    },
  });

  if (zoneLocations.length) {
    for (let i = 0; i < zoneLocations.length; i++) {
      zoneLocations[i].isActive = isActive;
      await zoneLocations[i].save().catch((error: any) => {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
      });
    }
  }

  zone.isActive = isActive;

  await zone.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res
    .status(httpStatus.OK)
    .json({ idZone: zone.id, isActive: zone.isActive });
});

// REVIEWS
const getAllReviews = catchAsync(async (req: any, res: any) => {
  const reviews = await Review.find({
    relations: ["creator", "receiver"],
  });

  if (!reviews.length) {
    return res.status(httpStatus.OK).json([]);
  }

  return res.status(httpStatus.OK).json(reviews);
});

const getReviewById = catchAsync(async (req: any, res: any) => {
  const id = req.params.id;

  const review = await Review.findOne({
    relations: ["creator", "receiver"],
    where: { id: id },
  });

  if (!review) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any review"
    );
  }

  return res.status(httpStatus.OK).json(review);
});

const activeReviewStatus = catchAsync(async (req: any, res: any) => {
  const { id, isActive } = req.body;

  const review = await Review.findOne({
    where: {
      id: id,
    },
    relations: ["creator", "receiver"],
  });

  if (!review) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected review"
    );
  }

  review.isActive = isActive;

  await review.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res
    .status(httpStatus.OK)
    .json({ idReview: review.id, isActive: review.isActive });
});

const verifyReview = catchAsync(async (req: any, res: any) => {
  const { id, isVerified } = req.body;

  const review = await Review.findOne({
    where: {
      id: id,
    },
    relations: ["creator", "receiver"],
  });

  if (!review) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected review"
    );
  }

  review.isVerified = isVerified;

  await review.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res
    .status(httpStatus.OK)
    .json({ idReview: review.id, isVerified: review.isVerified });
});

// RESERVATIONS
const getAllReservations = catchAsync(async (req: any, res: any) => {
  const reservations = await Reservation.find({
    relations: ["client", "owner", "location", "room"],
  });

  if (!reservations.length) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any reservation"
    );
  }

  return res.status(httpStatus.OK).json(reservations);
});

const getReservationById = catchAsync(async (req: any, res: any) => {
  const id = req.params.id;

  const reservation = await Reservation.findOne({
    relations: ["client", "owner"],
    where: { id: id },
  });

  if (!reservation) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any reservation"
    );
  }

  return res.status(httpStatus.OK).json(reservation);
});

const modifyReservation = catchAsync(async (req: any, res: any) => {
  const { id, start, end, client, owner, price, status } = req.body;

  if (!id || typeof id !== "number") {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Please provide a valid id"
    );
  }

  const reservation = await Reservation.findOne({
    where: {
      id: id,
    },
    relations: ["client", "owner"],
  });

  if (!reservation) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected reservation"
    );
  }

  if (client) {
    const selectedUser = await User.findOne({
      where: {
        id: client,
      },
    });
    if (!selectedUser) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Please provide a valid client"
      );
    }
  }

  if (owner) {
    const selectedUser = await User.findOne({
      where: {
        id: owner,
      },
    });
    if (!selectedUser) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Please provide a valid owner"
      );
    }
  }

  reservation.start = start ? start : reservation.start;
  reservation.end = end ? end : reservation.end;
  reservation.client = client ? client : reservation.client;
  reservation.owner = owner ? owner : reservation.owner;
  reservation.price = price ? price : reservation.price;
  reservation.status = status ? status : reservation.status;

  await reservation.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(reservation);
});

const changeReservationStatus = catchAsync(async (req: any, res: any) => {
  const { id, status } = req.body;

  const reservation = await Reservation.findOne({
    where: {
      id: id,
    },
    relations: ["client", "owner"],
  });

  if (!reservation) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected reservation"
    );
  }

  reservation.status = status;

  await reservation.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(reservation);
});

// PUBLICATIONS
const getAllPublications = catchAsync(async (req: any, res: any) => {
  // const publications = await Publication.find({
  //   relations: ["user"],
  // });
  const publications = await Publication.createQueryBuilder("publication")
    .innerJoinAndSelect("publication.user", "user")
    .leftJoinAndSelect("publication.imagesPublication", "images")
    .getMany();

  if (!publications) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find any zone"
    );
  }

  return res.status(httpStatus.OK).json({ publications });
});

const verifyPublication = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { isVerified } = req.body;

  const publication = await Publication.findOne({
    where: {
      id: id,
    },
    relations: ["user"],
  });

  if (!publication) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not find selected publication"
    );
  }

  publication.isVerified = isVerified;

  await publication.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json({
    idPublication: publication.id,
    isVerified: publication.isVerified,
  });
});

const loadFakeData = catchAsync(async (req: any, res: any) => {
  // First create a fake user and get the response
  const name = Fake.generateUniqueName().name;
  const surname = Fake.generateUniqueName().surname;
  const email = Fake.generateUniqueEmail();
  const password = "Espacio2022";
  const userPass: any[] = [];
  await admin
    .auth()
    .createUser({
      email: email,
      password: password,
      displayName: name + " " + surname,
      disabled: false,
    })
    .then((userCredential: any) => {
      // Signed in
      userPass.push(userCredential.providerData[0].uid);
      userPass.push(userCredential.uid);
    })
    .catch((error: any) => {
      let code = httpStatus.INTERNAL_SERVER_ERROR;
      let message = error.message;
      if (error.code === "auth/email-already-exists") {
        code = httpStatus.CONFLICT;
        message = error.message;
      } else if (error.code === "auth/invalid-email") {
        code = httpStatus.BAD_REQUEST;
        message = error.message;
      } else if (error.code === "auth/operation-not-allowed") {
        code = httpStatus.FORBIDDEN;
        message = error.message;
      } else if (error.code === "auth/weak-password") {
        code = httpStatus.BAD_REQUEST;
        message = error.message;
      }
      throw new ApiError(code, error.message);
    });
  const user = new User();
  user.firstName = name;
  user.lastName = surname;
  user.email = email;
  user.isOwner = true;
  user.isClient = true;
  user.country = "Chile";
  user.uuid = userPass[1];
  user.isVerified = true;
  user.isActive = true;
  user.didReview = true;
  const userData = await user.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  // Create all zones from scratch
  const newZones = [...Fake.zones];
  for (let i = 0; i < newZones.length; i++) {
    const newZone = new Zone();
    newZone.country = newZones[i].country;
    newZone.state = newZones[i].state;
    newZone.city = newZones[i].city;
    newZone.zone = newZones[i].zone;
    newZone.centerCoordinates = newZones[i].centerCoordinates;
    newZone.rate = parseInt(newZones[i].rate);
    newZone.averageValue = parseInt(newZones[i].averageValue);
    newZone.isActive = true;
    await newZone.save().catch((error) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }
  const zonesData = await Zone.find();

  // Create all locations with random zones and the created user
  const newLocations = [...Fake.locations];

  for (let i = 0; i < newLocations.length; i++) {
    const randomPrice = Math.round(Math.random() * (20000 - 80000)) + 80000;
    const product = await stripe.products.create({
      name: newLocations[i].name,
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: randomPrice,
      currency: "clp",
    });

    const newLocation = new Location();
    newLocation.name = newLocations[i].name;
    newLocation.address = newLocations[i].address;
    newLocation.zone =
      zonesData[Math.round(Math.random() * (zonesData.length - 1))];
    newLocation.rooms = Math.ceil(Math.random() * 5);
    newLocation.bathrooms = Math.ceil(Math.random() * 3);
    newLocation.painting = newLocations[i].painting;
    newLocation.floor = newLocations[i].floor;
    newLocation.unused = 1;
    newLocation.isVerified = true;
    newLocation.isActive = true;
    newLocation.value = randomPrice;
    newLocation.owner = userData;
    newLocation.image = newLocations[i].image;
    newLocation.email = email;
    newLocation.phone = Fake.pickPhone();
    newLocation.garage = newLocations[i].garage;
    newLocation.description = newLocations[i].description;
    newLocation.stripeProductId = product.id;
    newLocation.stripePriceId = price.id;
    newLocation.propertyType = newLocations[i].propertyType;
    newLocation.landUse = 'commercial';
    newLocation.long = "-70.576469";
    newLocation.lat = "-33.469230";
    newLocation.squareMeters = 90;

    await newLocation.save().catch((error) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  // Create some locations for Peru, so that front can render some example cards
  const newPeruLocations = [...Fake.peruLocations];

  const peruZone = await Zone.find({
    where: {
      country: "Perú",
    },
  });

  for (let i = 0; i < newPeruLocations.length; i++) {
    const randomPrice = Math.round(Math.random() * (20000 - 80000)) + 80000;
    const product = await stripe.products.create({
      name: newPeruLocations[i].name,
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: randomPrice,
      currency: "clp",
    });

    const newLocation = new Location();
    newLocation.name = newPeruLocations[i].name;
    newLocation.address = newPeruLocations[i].address;
    newLocation.zone = peruZone[0];
    newLocation.rooms = Math.ceil(Math.random() * 5);
    newLocation.bathrooms = Math.ceil(Math.random() * 3);
    newLocation.painting = newPeruLocations[i].painting;
    newLocation.floor = newPeruLocations[i].floor;
    newLocation.isVerified = true;
    newLocation.isActive = true;
    newLocation.value = randomPrice;
    newLocation.owner = userData;
    newLocation.image = newPeruLocations[i].image;
    newLocation.email = email;
    newLocation.phone = Fake.pickPhone();
    newLocation.garage = newPeruLocations[i].garage;
    newLocation.description = newPeruLocations[i].description;
    newLocation.stripeProductId = product.id;
    newLocation.stripePriceId = price.id;
    newLocation.propertyType = newPeruLocations[i].propertyType;
    newLocation.landUse = 'commercial';
    newLocation.long = "-77.042793";
    newLocation.lat = "-12.046374";
    newLocation.squareMeters = 90;

    await newLocation.save().catch((error) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  const locationsData = await Location.find();

  for (let i = 0; i < locationsData.length; i++) {
    const newImage3d = new Image3d();
    newImage3d.name = Fake.image3dData.name;
    newImage3d.image = Fake.image3dData.image;
    newImage3d.longitude = Fake.image3dData.longitude;
    newImage3d.latitude = Fake.image3dData.latitude;
    newImage3d.location = locationsData[i];

    await newImage3d.save().catch((error) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  return res.status(httpStatus.OK).json(locationsData);
});

// ONLY FOR TESTING
const loadDefaultStripeData = catchAsync(async (req: any, res: any) => {
  const locations = await Location.find();

  if (locations.length === 0) {
    throw new ApiError(httpStatus.NO_CONTENT, "not locations registered");
  }

  let alteredPropertiesCount = 0;
  let savedPropertiesCount = 0;
  let newStripeProductsId = 0;
  let newStripePriceId = 0;

  for (const location of locations) {
    alteredPropertiesCount++;
    let stripeProductId;

    // create producto id
    if (!location.stripeProductId) {
      const { id } = await stripe.products.create({
        name: location.name,
      });
      stripeProductId = id;
      location.stripeProductId = stripeProductId;
      newStripeProductsId++;
    } else {
      stripeProductId = location.stripeProductId;
    }

    // create price id
    const randomPrice = Math.round(Math.random() * (20000 - 80000)) + 80000;

    const locationValueValid = location.value > 0;
    const stripePrice = location.value > 0 ? location.value : randomPrice;

    const newPriceId = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: stripePrice,
      currency: "clp",
    });

    if (!locationValueValid) {
      location.value = stripePrice;
    }

    location.stripePriceId = newPriceId.id;
    newStripePriceId++;
    await location.save();
    savedPropertiesCount++;
  }
  return res.status(httpStatus.OK).json({
    status: "completed",
    data: {
      alteredPropertiesCount,
      savedPropertiesCount,
      newStripeProductsId,
      newStripePriceId,
    },
  });
});

// STRIPE
const getPaymentsPagination = catchAsync(async (req: any, res: any) => {
  const { starting_after, ending_before } = req.query;
  console.log("------------------");
  console.log(starting_after);
  const payments = await stripe.paymentIntents.list({
    limit: 15,
    starting_after,
    ending_before,
  });

  return res.status(httpStatus.OK).json({
    payments,
  });
});

const getAllPayments = catchAsync(async (req: any, res: any) => {
  const payments = await stripe.paymentIntents.list({
    limit: 100,
  });

  const paymentsData = payments.data.map((payment: any) => {
    const { amount, created, status, charges, currency } = payment;
    return {
      member:
        charges.data.length > 0 ? charges.data[0].billing_details.name : "",
      date: moment.unix(created).format("MMMM Do, h:mm a"),
      paymentType:
        charges.data.length > 0
          ? charges.data[0].payment_method_details.type
          : "",
      paymentDetails:
        charges.data.length > 0 ? charges.data[0].receipt_url : "",
      amount: amount,
      currency: currency,
      status: status,
    };
  });
  return res.status(httpStatus.OK).json({
    payments: paymentsData,
    created: new Date().getTime(),
  });
});

// IMAGES
import validImageTableName from "../utils/validImageTableName";
import { locations } from '../utils/fakeData';
import { Testimonial } from "../models/Testimonial";
import { General } from "../models/General";
import { Room } from "../models/Room";

const postOneImage = catchAsync(async (req: any, res: any) => {
  // const { token, userEmail, locationId, route } = req.body;
  const { token, userEmail, id, route, table } = req.body;
  const { originalname } = req.file;

  if (!validImageTableName.includes(table)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "¡¡Nombre de tabla incorrecto!!"
    );
  }
  const currentDate = new Date().getTime();
  
  let imageBuffer = req.file.buffer;
  let imagePath = `${userEmail}${route}${currentDate}${originalname}`;

  if (req.file.mimetype==="application/octet-stream") {
    const outputBuffer = await convert({
      buffer: imageBuffer, // the HEIC file buffer
      format: 'JPEG',      // output format
      quality: 0.92           // the jpeg compression quality, between 0 and 1
    });
    imageBuffer = outputBuffer
    imagePath = `${userEmail}${route}${currentDate}${originalname.split(".")[0]}.jpeg`;
  }

  const file = getAdminStorage().bucket().file(imagePath);
  await file.save(imageBuffer);
  await file.makePublic();
  const url = file.publicUrl();

  // const firebaseStorage = storage();
  // const firebaseStorageRef = storageRef(firebaseStorage, imagePath);

  // 'file' comes from the Blob or File API
  // const response = await storageUploadBytes(
  //   firebaseStorageRef,
  //   req.file.buffer
  // );
  // const url = await storeGetDownloadURL(storageRef(firebaseStorage, imagePath));

  const newImage = new Images();
  newImage.image = url;
  // newImage.location = locationId;

  // SAVE IMAGE TABLE IDENTIFICATOR DEPENDING ON THE ROUTE
  // DEFAULT 0 = LOCATION
  // if (route.includes("Publication")) {
  //   newImage.table = 1;
  // }
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

  res.status(httpStatus.OK).json({ success: true, url });
});

const postImage = catchAsync(async (req: any, res: any) => {
  const { image, locationId } = req.body;

  const location = await Location.findOne({
    where: { id: locationId },
    relations: ["owner"],
  });

  if (!location) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "location not found" });
  }

  const newImage = new Images();
  newImage.image = image;
  newImage.location = locationId;

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

const sendWelcomeEmail = catchAsync(async (req: any, res: any) => {
  const { email } = req.body;

  await transporter.sendMail({
    from: '"Espacio temporal -" <foo@example.com>', // sender address
    to: email, // list of receivers
    subject: "Bienvenido a Espacio Temporal", // Subject line
    template: "index",
  });

  res.status(httpStatus.OK).json("send");
});

// TESTIMONIALS

const postNewTestimonial = catchAsync(async (req: any, res: any) => {
  const { video_url, name, position, location } = req.body;

  const newTestimonial = new Testimonial()

  newTestimonial.name = name;
  newTestimonial.video_url = video_url;
  newTestimonial.position = position;
  newTestimonial.location = location;

  await newTestimonial.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(newTestimonial);
});

const putTestimonial = catchAsync(async (req: any, res: any) => {
  const { video_url, name, position, location } = req.body;
  const { id } = req.params;

  const testimonial = await Testimonial.findOne({
    where: { id },
  });

  if (!testimonial) {
    throw new ApiError(httpStatus.NOT_FOUND, "No se encontro la información que buscas");
  }

  testimonial.name = name;
  testimonial.video_url = video_url;
  testimonial.position = position;
  testimonial.location = location;

  await testimonial.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(testimonial);
});

const deleteTestimonial = catchAsync(async (req: any, res: any) => {
  const { idTestimonial } = req.params;

  const foundedTestimonial = await Testimonial.findOne({
    where: { id:idTestimonial },
  });

  if (!foundedTestimonial) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "No se encontro el testimonio" });
  }

  await foundedTestimonial.remove().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json({removed:true});
});

// GENERAL
const postNewCoverImage = catchAsync(async (req: any, res: any) => {
  const { imageUrl, text } = req.body;

  const newImageCover = new General()

  newImageCover.image = imageUrl;
  newImageCover.text = text;

  await newImageCover.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(newImageCover);
});

const putCoverImage = catchAsync(async (req: any, res: any) => {
  const { imageUrl } = req.body;
  const { id } = req.params;
  console.log('%cgeneral.controller.ts line:48 id', 'color: white; background-color: #007acc;', id);
  const imageData = await General.findOne({
    where: { id },
  });

  if (!imageData) {
    throw new ApiError(httpStatus.NOT_FOUND, "No se encontro la información que buscas");
  }

  imageData.image = imageUrl;

  await imageData.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(imageData.image);
});

const putText = catchAsync(async (req: any, res: any) => {
  const { text } = req.body;
  const {id} = req.params
  
  const imageData = await General.findOne({
    where: { id },
  });

  if (!imageData) {
    throw new ApiError(httpStatus.NOT_FOUND, "No se encontro la información que buscas");
  }

  imageData.text = text;

  await imageData.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(imageData.text);
});


const post = catchAsync(async (req: any, res: any) => {
  const { name, description, image, squareMeter, locationId, value } = req.body;

  const location = await Location.findOne({
    where: { id: locationId },
    relations: ["owner"],
  });

  if (!location) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "location not found" });
  }

  if (location.propertyType === "entire") {
    return res.status(httpStatus.METHOD_NOT_ALLOWED).json({
      message: "No se puede agregar un cuarto en una propiedad completa",
    });
  }
  const newRoom = new Room();
  newRoom.name = name;
  newRoom.description = description;
  newRoom.image = image;
  newRoom.squareMeter = squareMeter;
  newRoom.location = locationId;
  newRoom.startLease = location.startLease;
  newRoom.endLease = location.endLease;

  await newRoom.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(newRoom);
});

const updateRoom = catchAsync(async (req: any, res: any) => {
  const { idRoom } = req.params;
  const { name, description, image, squareMeter, locationId, value, isDeleted } = req.body;

  const location = await Location.findOne({
    where: { id: locationId },
    relations: ["owner"],
  });

  if (!location) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "location not found" });
  }

  let newRoom = await Room.findOne({
    where: { id: idRoom },
  });

  if (!newRoom) {
    throw new ApiError(httpStatus.NOT_FOUND, "room not found");
  }

  newRoom.name = name;
  newRoom.description = description;
  newRoom.image = image;
  newRoom.squareMeter = squareMeter;
  newRoom.isDeleted = isDeleted;

  if (value && newRoom.value !== value) {
    let stripeProductId;
    if (!newRoom.stripeProductId) {
      const stripeProduct = await stripe.products.create({
        name: location.name,
      });
      stripeProductId = stripeProduct.id;
      newRoom.stripeProductId = stripeProductId.id;
    } else {
      stripeProductId = newRoom.stripeProductId;
    }
    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: value,
      currency: "clp",
    });
    newRoom.stripePriceId = price.id;
    newRoom.value = value;
  }

  await newRoom.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json({
    idLocation: location.id,
    room: newRoom,
  });
});

const updateRoomIsActive = catchAsync(async (req: any, res: any) => {
  const { idRoom } = req.params;
  const { locationId, isActive } = req.body;

  const location = await Location.findOne({
    where: { id: locationId },
    relations: ["owner", "roomsDetails"],
  });

  if (!location) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "location not found" });
  }

  if (location.owner.id !== req.currentUser.id) {
    if (!req.currentUser.isAdmin) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "You are not the owner" });
    }
  }
  console.log(
    "%croom.controller.ts line:175 location",
    "color: #007acc;",
    location
  );
  if (!location.roomsDetails.find((room) => room.id === Number(idRoom))) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "room not found in current location"
    );
  }

  let newRoom = await Room.findOne({
    where: { id: idRoom },
  });

  if (!newRoom) {
    throw new ApiError(httpStatus.NOT_FOUND, "room not found");
  }

  newRoom.isActive = isActive;

  await newRoom.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json({
    idLocation: location.id,
    room: newRoom,
  });
});

const updateRoomImage = catchAsync(async (req: any, res: any) => {
  const { idRoom } = req.params;
  const { image, locationId } = req.body;

  const location = await Location.findOne({
    where: { id: locationId },
    relations: ["owner", "roomsDetails"],
  });

  if (!location) {
    return res
      .status(httpStatus.NO_CONTENT)
      .json({ message: "location not found" });
  }

  if (location.owner.id !== req.currentUser.id) {
    if (!req.currentUser.isAdmin) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "You are not the owner" });
    }
  }

  let newRoom = await Room.findOne({
    where: { id: idRoom },
  });

  if (!newRoom) {
    throw new ApiError(httpStatus.NOT_FOUND, "room not found");
  }

  newRoom.image = image;

  await newRoom.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json({
    idLocation: location.id,
    room: newRoom,
  });
});

module.exports = {
  getAllUsers,
  getTrashUsers,
  getUserById,
  getUserByIdTrash,
  verifyUser,
  deleteUser,
  deleteUserPermanent,
  restoreUser,
  asignAdminRol,
  activeStatus,
  makeOwner,
  getAllLocations,
  getTrashLocations,
  getLocationById,
  setLocationsValue,
  activeLocationsStatus,
  verifyLocation,
  modifyLocation,
  deleteLocation,
  deleteLocationPermanent,
  restoreLocation,
  createLocation,
  getAllZones,
  getZoneById,
  createZone,
  modifyZone,
  activeZoneStatus,
  getAllReviews,
  getReviewById,
  activeReviewStatus,
  verifyReview,
  getAllReservations,
  getReservationById,
  modifyReservation,
  changeReservationStatus,
  loadFakeData,
  getAllPublications,
  verifyPublication,
  getPaymentsPagination,
  getAllPayments,
  postOneImage,
  postImage,
  updateImageVisibility,
  loadDefaultStripeData,
  updateLocationCoverImage,
  sendWelcomeEmail,

  postNewTestimonial,
  putTestimonial,
  deleteTestimonial,

  
  postNewCoverImage,
  putCoverImage,
  putText,

  post,
  updateRoom,
  updateRoomIsActive,
  updateRoomImage,
};
