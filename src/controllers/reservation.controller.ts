export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

import { Reservation } from "../models/Reservation";
import { Location } from "../models/Location";
import { User } from "../models/User";
import moment from "moment";
import { Brackets, getRepository } from "typeorm";
import { Room } from "../models/Room";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const convert = require('heic-convert');

// Importing modules

const FONT_SIGNATURE = process.cwd() + "/src/assets/fonts/RockSalt-Regular.ttf";
const FONT_BOLD = process.cwd() + "/src/assets/fonts/ScheherazadeNew-Bold.ttf";
const FONT_NORMAL = process.cwd() + "/src/assets/fonts/ScheherazadeNew.ttf";
const IMAGE = process.cwd() + "/src/assets/images/espacio.jpg";
const TEXT_LARGE = 16;
const TEXT_NORMAL = 13;
const TEXT_SMALL = 9;

const { numeroALetras, numeroFormat } = require("../utils/numberToText");
const PDFDocument = require("pdfkit");
import fs from "fs";
import path from "path";
const {
  storage,
  storageRef,
  storageUploadBytes,
  storeGetDownloadURL,
} = require("../config/firebase");

interface ContractVariables {
  company: string;
  firstDate: string;
  subContractor_name: string;
  rut: string;
  represent: string;
  identity: string;
  location_1: string;
  location_2: string;
  location_3: string;
  location_name: string;
  location_uses: string;
  price_value: string;
  price_text: string;
  date_days: string;
  date_first: string;
  date_second: string;
  subContractor_email_1: string;
  subContractor_email_2: string;
  signature: string;
  people_fix: string;
  people_prox: string;
}
interface MetadataCheckoutSesion {
  metadata_stripe_price_id: string;

  metadata_reservation_is_daily: boolean;
  metadata_reservation_owner_id: number;
  metadata_reservation_is_room: boolean;
  metadata_reservation_location_id: number;
  metadata_reservation_location_name: string;
  metadata_reservation_room_id?: number;
  metadata_reservation_room_name?: string;
  metadata_reservation_price: number;
  metadata_reservation_user_id: number;
  metadata_user_email: string;
  metadata_reservation_date_start: number; //time since Jan 1, 1970, 00:00:00.000 GMT
  metadata_reservation_date_end: number; //time since Jan 1, 1970, 00:00:00.000 GMT
}
const { getAdminStorage } = require("../config/firebaseAdmin");

const get = catchAsync(async (req: any, res: any) => {
  const reservations = await Reservation.find({
    relations: ["owner", "client"],
  });

  if (!reservations.length) {
    return res.status(httpStatus.OK).json({ reservations: [] });
  }

  res.status(httpStatus.OK).json({ reservations });
});

const post = catchAsync(async (req: any, res: any) => {
  const { start, end, ownerId, price } = req.body;

  const newReservation = new Reservation();
  newReservation.start = start;
  newReservation.end = end;
  newReservation.client = req.currentUser.id;
  newReservation.owner = ownerId;
  newReservation.price = price;
  newReservation.status = "in progres";

  await newReservation.save().catch((error) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(newReservation);
});

const createLocationCheckoutSession = catchAsync(async (req: any, res: any) => {
  const {
    locationId,
    roomId,
    range,
    company,
    identity,
    location_uses,
    people_fix,
    people_prox,
    represent,
    rut,
    subContractor_email_1,
    subContractor_email_2,
    signature,
    timeQuantity,
  } = req.body;

  const foundLocation = await Location.findOne({
    where: { id: locationId },
    relations: ["zone", "owner"],
  });

  if (!foundLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, "locación no encontrada");
  }

  let locationName = foundLocation.name;
  let propertyValue = foundLocation.value;
  let isRoom = false;
  if (roomId !== "entire") {
    const foundRoom = await Room.findOne({
      relations: ["location", "location.owner"],
      where: { id: roomId },
    });
    if (!foundRoom) {
      throw new ApiError(httpStatus.NOT_FOUND, "Cuarto no encontrado");
    }
    locationName = foundRoom.name;
    propertyValue = foundRoom.value;
    isRoom = true;
  }

  // MULTIPLY PROPERTY VALUE FOR THE AMOUNT OF MONTHS OR HOURS IN THE RESERVATION
  propertyValue = propertyValue * timeQuantity

  const startDate = moment(Number(range.start));
  const endDate = moment(Number(range.end));
  console.log("\x1b[44m%s\x1b[0m","reservation.controller.ts line:152 createLocationCheckoutSession",JSON.stringify({
    dates:{range, start: range.start,end: range.end,startDate,endDate},
    body:req.body,
    foundLocation
  },null,"\t"));

  const diffDates = endDate.diff(startDate, "days").toString();
  const today = moment().format("DD/MM/YYYY");

  // validate date range start before end
  if (startDate.isAfter(endDate)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Rango de fechas invalidas. \n La fecha de inicio debe ser antes que la fecha fin."
    );
  }
  // validate start and end dates, should´n be in any other reservations
  const invalidSameDateReservations = await getRepository(Reservation)
    .createQueryBuilder("reservation")
    .where("reservation.locationId = :roomId", { roomId: locationId })
    .andWhere(
      new Brackets((qb) => {
        qb.where(` reservation.roomId is null `);
      })
    )
    .andWhere(
      new Brackets((qb) => {
        qb.where(
          `:start BETWEEN reservation.start AND reservation.end 
        OR :end BETWEEN reservation.start AND reservation.end
        OR reservation.start BETWEEN :start AND :end 
        OR reservation.end BETWEEN :start AND :end 
        `,
          { start: startDate.toDate(), end: endDate.toDate() }
        );
      })
    )
    .getCount();
  if (invalidSameDateReservations > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Rango de fechas invalidas. \n Alguna de las fechas se sobrepone a otra reservación."
    );
  }

  const metadataSession: MetadataCheckoutSesion = {
    metadata_stripe_price_id: foundLocation.stripePriceId,
    metadata_reservation_owner_id: foundLocation.owner.id,
    metadata_reservation_is_room: isRoom,
    metadata_reservation_room_id: roomId,
    metadata_reservation_room_name: locationName,
    metadata_reservation_location_id: foundLocation.id,
    metadata_reservation_location_name: locationName,
    metadata_reservation_is_daily: foundLocation.isDaily,
    metadata_reservation_price: propertyValue,
    metadata_reservation_user_id: req.currentUser.id,
    metadata_user_email: req.currentUser.email,
    metadata_reservation_date_start: range.start,
    metadata_reservation_date_end: range.end,
  };
  const contractVariables: ContractVariables = {
    company: company,
    date_days: diffDates,
    date_first: startDate.format("DD/MM/YYYY"),
    date_second: endDate.format("DD/MM/YYYY"),
    firstDate: today,
    identity: identity,
    location_1: foundLocation.address,
    location_2: foundLocation.zone.zone,
    location_3: foundLocation.zone.city,
    location_name: locationName,
    location_uses: location_uses,
    people_fix: people_fix,
    people_prox: people_prox,
    price_value: numeroFormat(propertyValue.toString()),
    price_text: numeroALetras(propertyValue),
    represent: represent,
    rut: rut,
    subContractor_email_1: subContractor_email_1,
    subContractor_email_2: subContractor_email_2,
    subContractor_name: `${req.currentUser.firstName} ${req.currentUser.lastName}`,
    signature: signature,
  };

  // console.log(
  //   "\x1b[44m%s\x1b[0m",
  //   "reservation.controller.ts line:240 {allData}",
  //   JSON.stringify(
  //     {
  //       metadataSession,
  //       contractVariables,
  //       user: req.currentUser,
  //     },
  //     null,
  //     "\t"
  //   )
  // );

  const session = await stripe.checkout.sessions.create({
    metadata: {
      ...metadataSession,
      ...contractVariables,
    },
    customer: req.currentUser.stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: 'clp',
          product_data: { name: locationName },
          unit_amount: propertyValue,
          tax_behavior: 'inclusive',
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/stripe/success`,
    cancel_url: `${process.env.CLIENT_URL}/stripe/cancel`,
  });

  res.json({ url: session.url });
});

const createRoomCheckoutSession = catchAsync(async (req: any, res: any) => {
  // const { userId, roomId, range, signature } = req.body;
  // const user = await User.findOne({ id: userId });
  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, "The user is not registerd");
  // }
  // // find the location or room stripe price id
  // const foundRoom = await Room.findOne({
  //   relations: ["location", "location.owner"],
  //   where: { id: roomId },
  // });
  // if (!foundRoom) {
  //   throw new ApiError(httpStatus.NOT_FOUND, "The space doesn't exists");
  // }
  // // validate date range start before end
  // const rangeStart = moment(range.start);
  // const rangeEnd = moment(range.end);
  // console.log(
  //   "%creservation.controller.ts line:156 object",
  //   "color: #007acc;",
  //   JSON.stringify({ rangeStart, rangeEnd }, null, "\t")
  // );
  // if (rangeStart.isAfter(rangeEnd)) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "Rango de fechas invalidas. \n La fecha de inicio debe ser antes que la fecha fin."
  //   );
  // }
  // // validate start and end dates, should´n be in any other reservations
  // const invalidSameDateReservations = await getRepository(Reservation)
  //   .createQueryBuilder("reservation")
  //   .where("reservation.roomId = :roomId", { roomId: roomId })
  //   .andWhere(
  //     new Brackets((qb) => {
  //       qb.where(
  //         `:start BETWEEN reservation.start AND reservation.end
  //       OR :end BETWEEN reservation.start AND reservation.end
  //       OR reservation.start BETWEEN :start AND :end
  //       OR reservation.end BETWEEN :start AND :end
  //       `,
  //         { start: rangeStart.toDate(), end: rangeEnd.toDate() }
  //       );
  //     })
  //   )
  //   .getCount();
  // if (invalidSameDateReservations > 0) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "Rango de fechas invalidas. \n Alguna de las fechas se sobrepone a otra reservación."
  //   );
  // }
  // const metadataSession: MetadataCheckoutSesion = {
  //   price_id: foundRoom.stripePriceId,
  //   metadata_owner_id: foundRoom.location.owner.id,
  //   metadata_owner_name: `${foundRoom.location.owner.firstName} ${foundRoom.location.owner.lastName}`,
  //   metadata_is_room: true,
  //   metadata_location_id: foundRoom.location.id,
  //   metadata_location_name: foundRoom.location.name,
  //   metadata_room_id: foundRoom.id,
  //   metadata_room_name: foundRoom.name,
  //   metadata_price: foundRoom.value,
  //   metadata_user_id: user.id,
  //   metadata_user_name: `${user.firstName} ${user.lastName}`,
  //   metadata_user_email: user.email,
  //   metadata_user_signature: signature,
  //   metadata_date_start: range.start,
  //   metadata_date_end: range.end,
  // };
  // const session = await stripe.checkout.sessions.create({
  //   metadata: metadataSession,
  //   customer_email: user.email,
  //   line_items: [
  //     {
  //       // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
  //       price: metadataSession.price_id,
  //       quantity: 1,
  //     },
  //   ],
  //   mode: "payment",
  //   success_url: `${process.env.CLIENT_URL}/stripe/success`,
  //   cancel_url: `${process.env.CLIENT_URL}/stripe/cancel`,
  // });
  // res.json({ url: session.url });
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
      // Then define and call a function to handle the event payment_intent.succeeded
      const paymentIntent = event.data.object;
      const metadataRecived = paymentIntent.metadata;

      console.log(
        "\x1b[44m%s\x1b[0m",
        "reservation.controller.ts line:378 metadataRecived",
        JSON.stringify(metadataRecived, null, "\t")
      );

      const userDetails = await User.findOne({
        id: metadataRecived.metadata_reservation_user_id,
      });
      if (!userDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, `User not found`);
      }
      // make the user a current client
      if (!userDetails.isClient) {
        userDetails.isClient = true;
        await userDetails.save().catch((error) => {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
        });
      }

      const reservationStartDate = moment(
        Number(metadataRecived.metadata_reservation_date_start)
      ).toDate();
      const reservationEndDate = moment(
        Number(metadataRecived.metadata_reservation_date_end)
      ).toDate();

      const isTrueRoom =
        metadataRecived.metadata_reservation_is_room === "true";

      const reservation = new Reservation();
      reservation.start = reservationStartDate;
      reservation.end = reservationEndDate;
      reservation.clientId = metadataRecived.metadata_reservation_user_id;
      reservation.ownerId = metadataRecived.metadata_reservation_owner_id;
      reservation.isDaily = metadataRecived.metadata_reservation_is_daily;
      reservation.price = paymentIntent.amount_total;
      reservation.status = "created";
      reservation.locationId = metadataRecived.metadata_reservation_location_id;
      if (isTrueRoom) {
        reservation.roomId = metadataRecived.metadata_reservation_room_id;
      }

      // SAVE CONTRACT PDF IN FIREBASE
      var myDoc = createPDF({
        company: metadataRecived.company,
        date_days: metadataRecived.date_days,
        date_first: metadataRecived.date_first,
        date_second: metadataRecived.date_second,
        firstDate: metadataRecived.firstDate,
        identity: metadataRecived.identity,
        location_1: metadataRecived.location_1,
        location_2: metadataRecived.location_2,
        location_3: metadataRecived.location_3,
        location_name: metadataRecived.location_name,
        location_uses: metadataRecived.location_uses,
        people_fix: metadataRecived.people_fix,
        people_prox: metadataRecived.people_prox,
        price_value: metadataRecived.price_value,
        price_text: metadataRecived.price_text,
        represent: metadataRecived.represent,
        rut: metadataRecived.rut,
        subContractor_email_1: metadataRecived.subContractor_email_1,
        subContractor_email_2: metadataRecived.subContractor_email_2,
        subContractor_name: metadataRecived.subContractor_name,
        signature: metadataRecived.signature,
      });
      let buffers: any = [];
      myDoc.on("data", buffers.push.bind(buffers));
      myDoc.end();
      myDoc.on("end", async () => {
        let pdfData = Buffer.concat(buffers);
        const currentDate = moment().format("YYYY-MM-DDHH-mm-SS");
        const imagePath = `${metadataRecived.metadata_user_email}/contract/Contrato${currentDate}.pdf`;
        const file = getAdminStorage().bucket().file(imagePath);
        await file.save(pdfData, { contentType: file.mimetype });
        await file.makePublic();
        const publicPDFUrl = file.publicUrl();
        console.log(
          "%creservation.controller.ts line:342 {publicPDFUrl}",
          "color: #007acc;",
          { publicPDFUrl }
        );
        reservation.contractUrl = publicPDFUrl;
        await reservation.save().catch((error) => {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
        });
        console.log(
          "\n----------------------------------------------------------------------------------------------------\n"
        );
      });
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.send();
});

const getPDF = catchAsync(async (req: any, res: any) => {
  const {
    locationId,
    roomId,
    range,
    company,
    identity,
    location_uses,
    people_fix,
    people_prox,
    represent,
    rut,
    subContractor_email_1,
    subContractor_email_2,
    signature,
  } = req.body;

  const foundLocation = await Location.findOne({
    where: { id: locationId },
    relations: ["zone", "owner"],
  });

  if (!foundLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, "locación no encontrada");
  }
  let locationName = foundLocation.name;
  let propertyValue = foundLocation.value;
  if (roomId !== "entire") {
    const foundRoom = await Room.findOne({
      relations: ["location", "location.owner"],
      where: { id: roomId },
    });
    if (!foundRoom) {
      throw new ApiError(httpStatus.NOT_FOUND, "Cuarto no encontrado");
    }
    locationName = foundRoom.name;
    propertyValue = foundRoom.value;
  }

  const startDate = moment(range.start);
  const endDate = moment(range.end);
  console.log("\x1b[44m%s\x1b[0m","reservation.controller.ts line:521 GET PDF",JSON.stringify({
    dates:{range,start: range.start,end: range.end,startDate,endDate},
    body:req.body,
    foundLocation
  },null,"\t"));
  
  const diffDates = endDate.diff(startDate, "days").toString();
  const today = moment().format("DD/MM/YYYY");
  const contractVariables: ContractVariables = {
    company: company,
    date_days: diffDates,
    date_first: startDate.format("DD/MM/YYYY"),
    date_second: endDate.format("DD/MM/YYYY"),
    firstDate: today,
    identity: identity,
    location_1: foundLocation.address,
    location_2: foundLocation.zone.zone,
    location_3: foundLocation.zone.city,
    location_name: locationName,
    location_uses: location_uses,
    people_fix: people_fix,
    people_prox: people_prox,
    price_value: numeroFormat(propertyValue.toString()),
    price_text: numeroALetras(propertyValue),
    represent: represent,
    rut: rut,
    subContractor_email_1: subContractor_email_1,
    subContractor_email_2: subContractor_email_2,
    subContractor_name: `${req.currentUser.firstName} ${req.currentUser.lastName}`,
    signature: signature,
  };

  var myDoc = createPDF(contractVariables);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=quote.pdf");

  myDoc.pipe(res);
  myDoc.end();
});

const postPDF = catchAsync(async (req: any, res: any) => {
  const price = 100000;
  const contractVariables: ContractVariables = {
    company: "EMPRESA CON UN NOMBRE",
    firstDate: "10/10/2022",
    subContractor_name: "Victor Manuel Delfin Santos",
    rut: "00.000.000-6",
    represent: "NOMBRE DEL REPRESENTANTE",
    identity: "CEDULA DE IDENTIDAD",
    location_1: "location CON DESCRIPCION 1",
    location_2: "location CON DESCRIPCION 2",
    location_3: "location CON DESCRIPCION 3",
    location_name: "NOBRE DE LA LOCACION",
    location_uses: "USOS DEL ESPACIO",
    price_value: numeroFormat(price.toString()),
    price_text: numeroALetras(price),
    date_days: "15",
    date_first: "11/11/2022",
    date_second: "12/12/2022",
    subContractor_email_1: "victormanu31611@gmail.com",
    subContractor_email_2: "vi_manuel28@hotmail.com",
    signature: "victormanu signature",
    people_fix: "4",
    people_prox: "5",
  };
  var myDoc = createPDF(contractVariables);

  let buffers: any = [];
  myDoc.on("data", buffers.push.bind(buffers));

  myDoc.on("end", async () => {
    let pdfData = Buffer.concat(buffers);
    const currentDate = moment().format("YYYY-MM-DDHH-mm-SS");
    const imagePath = `testContract/Contrato${currentDate}.pdf`;
    const file = getAdminStorage().bucket().file(imagePath);
    await file.save(pdfData, { contentType: file.mimetype });
    await file.makePublic();
    const publicUrl = file.publicUrl();
    res.json({ url: publicUrl });
    res
      .writeHead(200, {
        "Content-Length": Buffer.byteLength(pdfData),
        "Content-Type": "application/pdf",
        "Content-disposition": "attachment;filename=test.pdf",
      })
      .end(pdfData);
  });

  myDoc.end();
});

const testPFDVariables = catchAsync(async (req: any, res: any) => {
  const price = 100000;

  const contractVariables: ContractVariables = {
    company: "EMPRESA CON UN NOMBRE",
    firstDate: "10/10/2022",
    subContractor_name: "Victor Manuel Delfin Santos",
    rut: "00.000.000-6",
    represent: "NOMBRE DEL REPRESENTANTE",
    identity: "CEDULA DE IDENTIDAD",
    location_1: "location CON DESCRIPCION 1",
    location_2: "location CON DESCRIPCION 2",
    location_3: "location CON DESCRIPCION 3",
    location_name: "NOBRE DE LA LOCACION",
    location_uses: "USOS DEL ESPACIO",
    price_value: numeroFormat(price.toString()),
    price_text: numeroALetras(price),
    date_days: "15",
    date_first: "11/11/2022",
    date_second: "12/12/2022",
    subContractor_email_1: "victormanu31611@gmail.com",
    subContractor_email_2: "vi_manuel28@hotmail.com",
    signature: "victormanu signature",
    people_fix: "4",
    people_prox: "5",
  };
  var myDoc = createPDF(contractVariables);

  let buffers: any = [];
  myDoc.on("data", buffers.push.bind(buffers));

  myDoc.on("end", async () => {
    let pdfData = Buffer.concat(buffers);
    res
      .writeHead(200, {
        "Content-Length": Buffer.byteLength(pdfData),
        "Content-Type": "application/pdf",
        "Content-disposition": "attachment;filename=test.pdf",
      })
      .end(pdfData);
  });

  myDoc.end();
});

const postOneFile = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { route } = req.body;
  const { originalname } = req.file;

  const foundReservation = await Reservation.findOne({
    where:{ id: id},
    relations:["client"]
  })

  if (!foundReservation) {
    res.status(httpStatus.NOT_FOUND).json({ message:"Reservación invalida" });
    return
  }

  if (foundReservation?.client.id !== req.currentUser.id) {
    res.status(httpStatus.UNAUTHORIZED).json({ message:"Usiario no authorizado" });
    return
  }
  const now =  new Date().getTime()
  let imageBuffer = req.file.buffer;
  let imagePath = `${route}${now}${originalname}`;

  if (req.file.mimetype==="application/octet-stream") {
    const outputBuffer = await convert({
      buffer: imageBuffer, // the HEIC file buffer
      format: 'JPEG',      // output format
      quality: 0.92           // the jpeg compression quality, between 0 and 1
    });
    imageBuffer = outputBuffer
    imagePath = `${route}${now}${originalname.split(".")[0]}.jpeg`;
  }

  const file = getAdminStorage().bucket().file(imagePath);
  await file.save(imageBuffer);
  await file.makePublic();
  const url = file.publicUrl();

  res.status(httpStatus.OK).json({ success: true, url });
});
const createPDF = (documentVariables: ContractVariables) => {
  var doc = new PDFDocument({ bufferPages: true });

  // Embed a font, set the font size, and render some text

  const listDecodation = {
    bulletRadius: 2,
    indent: 20,
    textIndent: 20,
    baseline: -10,
  };

  doc
    .font(FONT_BOLD)
    .fontSize(TEXT_LARGE)
    .text("Contrato de Subarrendamiento CoWork", { align: "center" })
    .text("ESPACIO TEMPORAL SPA", { align: "center", underline: true })
    .text("Y", { align: "center" })
    .text(documentVariables.company, { align: "center", underline: true })
    .moveDown()
    .lineGap(-10)

    .font(FONT_NORMAL)
    .fontSize(TEXT_NORMAL)
    .text(`En Santiago de Chile, ${documentVariables.firstDate} ,entre `, {
      continued: true,
    })
    .font(FONT_BOLD)
    .text("Espacio Temporal SpA, Rut 77.467.203-6", { continued: true })
    .font(FONT_NORMAL)
    .text(
      `, como subarrendador y ${documentVariables.subContractor_name}, Rut ${documentVariables.rut} , como subarrendatario, representada por ${documentVariables.represent}, cedula de identidad número ${documentVariables.identity}, se ha convenido el siguiente contrato.`
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("PRIMERO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Subarrendamiento"], listDecodation)
    .moveDown()

    .text(
      `Espacio Temporal SpA tiene la calidad arrendataria de la propiedad ubicada en ${documentVariables.location_1}, ${documentVariables.location_2}, región ${documentVariables.location_3} correspondiéndole la facultad de subarrendar el mismo, en adelante el “inmueble”, por el presente acto, el Subarrendador da en arrendamiento al Subarrendatario uno de los espacios denominado como ${documentVariables.location_name} en adelante el “espacio”.`
    )
    .moveDown()

    .text(
      `El espacio será destinado exclusivamente como taller u oficina para los fines comerciales de distintos rubos como ${documentVariables.location_uses}, y no podrá ser destinado para fines habitacionales u otros. las partes acuerdan que el presente contrato de subarrendamiento se celebra con estricta sujeción a las condiciones del contrato de subarrendamiento que sirve de base del presente contrato, conforme a lo anterior, el contrato de subarrendamiento estará sujeto a la vigencia del contrato de subarrendamiento señalado.`
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("SEGUNDO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Renta"], listDecodation)
    .moveDown()

    .text(
      "La renta se pagará por mes anticipado, dentro de los tres primeros días hábiles de cada mes. El valor de arriendo del espacio será la suma ",
      { continued: true }
    )
    .font(FONT_BOLD)
    .text(
      `$${documentVariables.price_value} ( ${documentVariables.price_text} ) `,
      { continued: true }
    )
    .font(FONT_NORMAL)
    .text(
      "durante todo el periodo de arriendo siendo la fecha límite de pago el día 05 de cada Mes. Se establece Para todos los efectos del artículo 1977 del código civil, el simple retardo en el pago de la renta será motivo suficiente para que el subarrendador ponga término inmediato al contrato."
    )
    .moveDown()

    .text(
      "El Subarrendatario pagará la renta de arrendamiento y los gastos comunes mediante transferencia electrónica o depósito a la siguiente cuenta bancaria:"
    )
    .moveDown()

    .font(FONT_BOLD)
    .list(
      [
        "Banco Santander",
        "Cuenta Corriente",
        "Titular: Espacio Temporal SpA,",
        "Rut: 77.467.203-6",
        "Número de cuenta: 84389234",
        "Mail: pagos@espaciotemporal.cl",
      ],
      listDecodation
    )
    .moveDown()

    .font(FONT_NORMAL)
    .text(
      "El comprobante de depósito o de transferencia electrónica deberá ser enviado en la misma fecha del depósito o transferencia a la dirección de correo ",
      { continued: true }
    )
    .font(FONT_BOLD)
    .text("pagos@espaciotemporal.cl.", { continued: true })
    .font(FONT_NORMAL)
    .text(
      " Para todos los efectos, el recibo de arrendamiento estará constituido por el comprobante de depósito o de transferencia en la cuenta corriente del Subarrendador."
    )
    .moveDown()

    .text(
      "En el evento que el Subarrendatario no pague la renta de arrendamiento en la forma y oportunidad señalada precedentemente, deberá pagar una multa indemnizatoria y como avaluación anticipada de perjuicios, equivalente a la cantidad de 1 UF (una unidad de fomento) por cada dos días de retraso, simple retardo o mora, sin necesidad de declaración, trámite, gestión o acto formal alguno."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("TERCERO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Plazo"], listDecodation)
    .moveDown()

    .text(
      `El presente contrato se celebra por un plazo de ${documentVariables.date_days}, a contar del día ${documentVariables.date_first} hasta el día ${documentVariables.date_second}. El contrato se renovará tácita y automáticamente por períodos iguales, salvo que Espacio Temporal SpA exprese por correo electrónico al Subarrendatario su intención de ponerle término al contrato con al menos 30 días de anticipación a la fecha de término del plazo o de cualquiera de sus renovaciones.`
    )

    .text(
      "Sin perjuicio de lo señalado anteriormente, el Subarrendador podrá, luego de cumplido los 2 meses de arriendo inicial garantizados, poner término anticipado al contrato y requerir la entrega del espacio, siempre y cuando se comunique dicha circunstancia por correo electrónico, mensaje de WhatsApp y/o llamada telefónica al subarrendatario con a lo menos 30 días de anticipación."
    )
    .moveDown()

    .text(
      "Si el Subarrendatario desea dar término al presente contrato de forma anticipada, deberá cancelar en su totalidad la renta de arrendamiento hasta el término del plazo pactado."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("CUARTO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Entrega del Espacio"], listDecodation)
    .moveDown()

    .text(
      "La entrega del espacio se efectúa en este acto, en el estado que actualmente se encuentra, el cual el Subarrendatario declara expresamente conocer y aceptar."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("QUINTO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Obligaciones del Subarrendatario"], listDecodation)
    .moveDown()

    .text(
      "Es responsabilidad del Subarrendatario la gestión y obtención de los permisos necesarios para desarrollar sus actividades. A mayor abundamiento, el subarrendatario libera expresamente al subarrendador de cualquier tipo de responsabilidad que pudiere corresponderle por este concepto, y de cualquier perjuicio que pudiere ocasionar al subarrendatario o a terceros la falta o imposibilidad de obtención de algún permiso o patente."
    )
    .text(
      "El Subarrendatario se obliga a respetar y cumplir fielmente el reglamento interno, que, como anexo al presente contrato, forma parte integral del mismo, y que está destinado a regular las relaciones entre los otros subarrendatarios y con la administración del inmueble, dentro del cual se ubica el espacio arrendado, y los moradores y/o subarrendatarios."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("SEXTO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Prohibiciones"], listDecodation)
    .moveDown()

    .text("Queda prohibido al Subarrendatario:")
    .moveDown()
    .list(
      [
        "Subarrendar ni ceder el contrato, ni los derechos que de él emanen salvo que cuente con el consentimiento previo y por escrito del Subarrendador.",
        "Destinar el espacio a un objeto distinto al autorizado por el presente contrato de subarrendamiento y, en general, ejecutar o celebrar cualquier acto o contrato que suponga su explotación o uso por terceros.",
        "Modificar elementos estructurales o las instalaciones y materiales del espacio arrendado, sin permiso previo y otorgado por escrito por el subarrendador.",
        "Hacer transformaciones, ejecutar obras o efectuar mejoras en el inmueble arrendado, salvo autorización previa y otorgada por escrito por el subarrendador.",
        "Usar este documento para tramites bancarios.",
      ],
      {
        listType: "numbered",
        ...listDecodation,
      }
    )

    .font(FONT_BOLD)
    .text("SÉPTIMO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Terminación Anticipada de Contrato"], listDecodation)
    .moveDown()

    .text(
      "El subarrendador tendrá derecho a poner término inmediato al contrato de subarrendamiento, ipso facto, de pleno derecho y sin necesidad de declaración judicial, cuando ocurra una de las siguientes causas:"
    )
    .moveDown()
    .list(
      [
        "Si el Subarrendatario no paga la renta acordada transcurridos 10 días, contados desde el día 5 del período de pago acordado.",
        "Si el Subarrendatario infringe las prohibiciones señaladas en la cláusula sexta precedente o en cualquiera de los puntos del reglamento interno del inmueble.",
      ],
      {
        listType: "numbered",
        ...listDecodation,
      }
    )

    .text(
      "En caso de terminación anticipada del contrato de subarrendamiento por las causales anteriormente descritas, el Subarrendatario deberá proceder a la devolución inmediata del espacio. La terminación anticipada dará derecho al Subarrendador para cobrar judicialmente las rentas impagas, sus intereses, multas y perjuicios derivados del incumplimiento del presente contrato, incluyendo indemnizaciones a las que se vea obligado a pagar el Subarrendador como consecuencia de las infracciones del Subarrendatario a lo dispuesto en la cláusula sexta precedente."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("OCTAVO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Restitución del Espacio"], listDecodation)
    .moveDown()

    .text(
      "El subarrendatario se obliga a restituir el espacio al término del plazo señalado en este contrato mediante la desocupación total del mismo, en las mismas condiciones en las que se le fue entregado. En el evento de que el subarrendatario no restituyere el espacio en la fecha de término del arrendamiento correspondiente, continuará obligada a pagar mensualmente la suma correspondiente a la renta convenida hasta que efectúe la restitución del espacio debiendo pagar además, una multa equivalente a 1 UF (una unidad de fomento) por cada día de atraso, dentro de los primeros cinco días de atraso; desde el sexto día, deberá pagar una multa equivalente a 3 UF (tres unidades de fomento) por cada día de atraso."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("NOVENO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Abandono del Espacio"], listDecodation)
    .moveDown()

    .text(
      "En el evento que el Subarrendatario abandonare el espacio y deje de cumplir con el pago de las rentas de arrendamiento por dos o más períodos mensuales consecutivos, faculta desde ya al Subarrendador o a quien lo represente en sus derechos, para ingresar al espacio, retirar las pertenencias que existan en su interior y depositarlas bajo inventario, en una bodega u otro lugar apropiado cuyo riesgo y costo será de cargo del subarrendatario."
    )
    .moveDown()

    .text(
      "Este inventario deberá efectuarse en presencia de dos testigos y se protocoliza en los registros de un notario público. La presente cláusula es esencial para la suscripción del presente contrato y se establece con el propósito de impedir el perjuicio derivado de no poder volver a tomar posesión del espacio por el incumplimiento, abandono o imposibilidad de ubicar al subarrendatario o a quienes lo representen."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("DÉCIMO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Perjuicios en el Inmueble"], listDecodation)
    .moveDown()

    .text(
      "El Subarrendatario será responsable de los perjuicios que sufriere el inmueble, por su hecho o culpa de sus familiares, dependientes, alumnos, visitas o terceros. el subarrendador no será responsable en caso alguno por eventuales daños que pudieren sufrir el subarrendatario y/o sus dependientes o sus bienes, por efectos de robos, incendios, humedad, filtraciones, rotura de cañerías, derrumbe, o cualquier otro producido por caso fortuito o fuerza mayor que pudiera afectar al inmueble o el espacio arrendado."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("DÉCIMO PRIMERO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Acceso al Espacio"], listDecodation)
    .moveDown()

    .text(
      "El Subarrendador, previa coordinación con el subarrendatario, podrá acceder al espacio para cualquier fin que le sea relevante su acceso."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("DÉCIMO SEGUNDO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Comunicaciones"], listDecodation)
    .moveDown()

    .text(
      "Todas las comunicaciones entre las partes se efectuarán por correo electrónico a las siguientes direcciones:"
    )
    .moveDown()
    .list(
      [
        "Subarrendador: pagos@espaciotemporal.cl cc angel@espaciotemporal.cl",
        `Subarrendatario: ${documentVariables.subContractor_email_1} cc ${documentVariables.subContractor_email_2}`,
      ],
      {
        listType: "numbered",
        ...listDecodation,
      }
    )

    .text(
      "Todo cambio de dirección de correo electrónico no surtirá efecto alguno, a menos que hubiere sido debida y oportunamente comunicado y notificado a la otra parte con antelación. Las comunicaciones se entenderán debidamente notificadas con la misma fecha de envío del correo respectivo."
    )
    .moveDown()

    .font(FONT_BOLD)
    .text("DÉCIMO TERCERO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Reajuste"], listDecodation)
    .moveDown()

    .text(
      `La renta se reajustará durante toda la vigencia del subarrendamiento; reajuste que se hará cada `,
      { continued: true }
    )
    .font(FONT_BOLD)
    .text(`6 meses`, { continued: true })
    .font(FONT_NORMAL)
    .text(
      `, de acuerdo con el comportamiento del mercado inmobiliario, mejoras introducidas en el inmueble y/o en la misma proporción o porcentaje en que haya podido variar el Índice de Precios al Consumidor (IPC) determinado por el Instituto Nacional de Estadísticas o por el organismo que lo reemplace, del período anterior y en forma acumulada. Si durante algún periodo resulta un IPC negativo, se mantendrá el valor de arriendo que está rigiendo en ese momento hasta el próximo reajuste.`
    )
    .moveDown()

    .addPage()
    .font(FONT_BOLD)
    .text("DÉCIMO CUARTO:")
    .font(FONT_NORMAL)
    .moveDown()
    .list(["Garantía"], listDecodation)
    .moveDown()

    .text(
      "A fin de garantizar la conservación del espacio y, en general, para responder al fiel y oportuno cumplimiento de este contrato y de todas las obligaciones que de él emanen, el Subarrendatario entrega en este acto al Subarrendador la cantidad equivalente a un mes de arrendamiento, esto es la cantidad de",
      { continued: true }
    )
    .font(FONT_BOLD)
    .text(
      `$${documentVariables.price_value} ( ${documentVariables.price_text} )`,
      { continued: true }
    )
    .font(FONT_NORMAL)
    .text(`moneda nacional, a la fecha del presente contrato.`)
    .moveDown()

    .text(
      "Esta garantía deberá restituirse al Subarrendatario dentro de los treinta días siguientes al término de este contrato, en ningún caso podrá ser imputada al pago de rentas mensuales de arrendamiento, ni aún a la de la última renta. El Subarrendador queda desde ya autorizado para descontar de la cantidad mencionada el valor de reparaciones por deterioros y/o perjuicios a cargo del Subarrendatario."
    )
    .moveDown()

    .text(
      "En caso de producirse la desocupación anticipada de la habitación, la garantía quedará a beneficio del subarrendador, en pago de los perjuicios que causa dicha desocupación, lo que las partes evalúan desde luego, en el exacto monto de la garantía, es decir, no hay devolución de garantía en el caso que el Subarrendatario no cumpla con el periodo que estipula el presente contrato. Por otro lado, el uso de dirección fiscal para fines de creación de patente y/o registro de actividades en el servicio de impuestos internos fuera del plazo contractual implica la no retribución de la garantía."
    )
    .moveDown()

    .moveTo(50, 650)
    .lineTo(250, 650)
    .stroke()
    .font(FONT_NORMAL)
    .text("Firma Subarrendatario", 100, 660)
    .font(FONT_SIGNATURE)
    .text(documentVariables.signature, 50, 620)

    .moveTo(350, 650)
    .lineTo(550, 650)
    .stroke()
    .font(FONT_NORMAL)
    .text("Firma Subarrendador", 400, 660)
    .font(FONT_SIGNATURE)
    .image(IMAGE, 400, 550, { fit: [100, 100] });
  doc.addPage();

  doc
    .font(FONT_BOLD)
    .text("ANEXO 1:", { underline: true })
    .text("REGLAMENTO INTERNO:", { align: "center" })
    .moveDown()

    .font(FONT_NORMAL)
    .text(
      "El incumplimiento de los siguientes puntos será causal de la finalización inmediata de contrato."
    )
    .moveDown()
    .list(
      [
        "Los Subarrendatarios deberán abstenerse de generar cualquier tipo de ruido molesto al objeto de no permitir la tranquilidad del resto de los Subarrendatarios y/o vecinos, esto está contemplado en la ordenanza municipal.",
        "Los Subarrendatarios, serán responsables de la limpieza de cada uno de sus espacios. Así mismo se comprometen con la mantención (limpieza, orden y organización de tareas para dicho compromiso) junto con los demás subarrendatarios del inmueble. ",
        "En caso de que un Subarrendatario tenga visitas o clientes ocasionales, éste será responsable por cualquier problema que ocurra en el inmueble y de la limpieza baños y áreas comunes luego de su atención.",
        "No se aceptará ningún tipo de falta de respeto entre Subarrendatarios o integrantes del equipo de Espacio Temporal.",
        "El Subarrendatario será responsable de la limpieza y orden causada por animales domésticos asistentes en los espacios.",
        "Está prohibido el uso de calefactores eléctricos y aire acondicionado en los espacios y otros lugares del inmueble, el incumplimiento de esto generará un incremento en los gastos comunes establecidos, lo cual se estipula en Anexo 2 - Cobros extras. ",
        "Ninguna visita podrá permanecer en el inmueble, sin la presencia del subarrendatario. Este debe recibir a las visitas en la puerta de acceso, y acompañarla al espacio arrendado. Posteriormente deberá acompañarla a esta a la salida.",
        "Queda estrictamente prohibido fumar dentro del inmueble; ya sea en los ambientes comunes como en el interior de los espacios. ",
        "El horario de uso del inmueble es de lunes a viernes de 9 am a 19 horas. Si los Subarrendatarios desean permanecer tiempo adicional en el inmueble, debe quedar bajo acuerdo con el administrador del inmueble. ",
        "Los Subarrendatarios serán responsable de la mantención y cuidado de artículos de uso común provistos por el Subarrendador, esto aplica para artículos eléctricos, electrónicos y mobiliario en general, así mismo donaciones y/o aportes temporales que se ofrezcan al inmueble. ",
        "La restitución de lo anteriormente señalado a causa de daño, pérdida, robo o hurto será de total responsabilidad del conjunto de subarrendatarios, siempre y cuando la mayoría esté de acuerdo, de lo contrario no se generará la reposición.",
        "El Subarrendador no será responsable de dinero, joyas y otros artículos de valor dejados en los espacios. Cada subarrendatario contará con llave de su espacio y será responsable de éste y de sus efectos personales.",
      ],
      {
        ...listDecodation,
      }
    )
    .text(
      "Para los efectos legales derivados del presente contrato las partes fijan su domicilio en la ciudad de Santiago y se someten a la jurisdicción de sus tribunales de justicia."
    )

    .moveTo(50, 650)
    .lineTo(250, 650)
    .stroke()    
    .font(FONT_NORMAL)
    .text("Firma Subarrendatario", 100, 660)
    .font(FONT_SIGNATURE)
    .text(documentVariables.signature, 50, 620)

    .moveTo(350, 650)
    .lineTo(550, 650)
    .stroke()
    .font(FONT_NORMAL)
    .text("Firma Subarrendador", 400, 660)
    .font(FONT_SIGNATURE)
    .image(IMAGE, 400, 550, { fit: [100, 100] });
  doc
    .addPage()

    .font(FONT_BOLD)
    .text("ANEXO 2", { underline: true })
    .text("GASTOS EXTRAS", { align: "center", underline: true })
    .font(FONT_NORMAL)
    .moveDown()

    .list(
      [
        `Se establece como gasto común, la suma de $${documentVariables.price_value} y varía según los siguientes factores:`,
        "El consumo eléctrico debe ser correspondiente a 7 equipos electrónicos de bajo consumo como computadores y otros, El aumento considerable de equipos y/ o aparatos de consumo de alta potencia significara un aumento en el gasto común proporcional al consumo de energía adicional. ",
        `La empresa declara que el flujo mensual de personas es de ${documentVariables.people_fix} personas fijas y ${documentVariables.people_prox} persona de flujo aproximadamente, un flujo mayor se considera un incremento proporcional en el valor del gasto común debido principalmente al uso de áreas comunes, como mantención de baños, pasillos y áreas comunes. `,
        "En caso de que una empresa saque una patente municipal esta está obligada a costear la misma, Espacio Temporal SpA no se responsabiliza por el cumplimiento de pago, adicionalmente el subarrendador se compromete a finalizar dicha patente en caso de abandono o retiro de oficina.",
      ],
      {
        ...listDecodation,
      }
    )

    .text(
      "Para los efectos legales derivados del presente contrato las partes fijan su domicilio en la ciudad de Santiago y se someten a la jurisdicción de sus tribunales de justicia."
    )
    .moveDown()

    .moveTo(50, 650)
    .lineTo(250, 650)
    .stroke()
    .font(FONT_NORMAL)
    .text("Firma Subarrendatario", 100, 660)
    .font(FONT_SIGNATURE)
    .text(documentVariables.signature, 50, 620)

    .moveTo(350, 650)
    .lineTo(550, 650)
    .stroke()
    .font(FONT_NORMAL)
    .text("Firma Subarrendador", 400, 660)
    .font(FONT_SIGNATURE)
    .image(IMAGE, 400, 550, { fit: [100, 100] });

  return doc;
};
module.exports = {
  get,
  post,
  webhook,
  createLocationCheckoutSession,
  createRoomCheckoutSession,
  postPDF,
  getPDF,
  testPFDVariables,
  postOneFile
};
