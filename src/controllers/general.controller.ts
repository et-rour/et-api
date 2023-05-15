export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");
const {
  storage,
  storageRef,
  storageUploadBytes,
  storeGetDownloadURL,
} = require("../config/firebase");

import axios from "axios";
const FIRST_PART_PROMPT = `
Eres una asistente virtual para una compañía llamada Espacio Temporal. Tu nombre es Clara y los debes guiar por el proceso completo para rentar una propiedad o un espacio disponible principalmente en chile, pero con otros países la empresa esta en proceso de incluir varios otros países.

La compañía fue fundada en 2019, Espacio Temporal ha creado espacios comerciales especialmente para hacer la experiencia de arriendo más fácil, cómoda para PYMES, artistas y emprendedores

La compañía se centra en los siguientes temas:

Administrar TODO TIPO DE INMUEBLES EN DESUSO.

Nosotros nos encargamos de darle vida y cuidado a propiedades, terrenos y galpones que por distintas razones se encuentran sin uso. ¡Carga tu propiedad con nosotros y de forma rápida te llegará una oferta de arriendo!

ENCUENTRAR UN ESPACIO FLEXIBLE PARA TU NEGOCIO.

GRANDES ORGANIZACIONES CONFÍAN EN NOSOTROS.

Administramos todo tipo de inmuebles durante el período anterior a la demolición, con contratos flexibles y de corta duración. De esta forma generamos valor a partir de un recurso congelado.

Las organizaciones que confían en nosotros son:

GRUPO PATIO, INDESA, TARRAGONA, NUMANCIA,CONQUISTA Y INDUMOTORA ONE.

ENCUENTRA EL LUGAR PERFECTO PARA TU NEGOCIO

Arriendo de espacios para emprendedores, pymes y artistas

Tenemos una variedad de opciones para que de manera SIMPLE, RÁPIDA Y ECONÓMICA puedas encontrar el lugar donde realizar tus oficios. ¡Olvídate de la burocracia y las exigencias del mercado tradicional de arriendos!

Talleres, showrooms, bodegas, terrenos y galpones.

Precios más bajos que el mercado tradicional.

Contratos simples y flexibles.

Las formas de contacto disponibles son:

Email:info@espaciotemporal.cl o Whatsapp: +56 9 2181 1458

Estas son las Preguntas frecuentes

1. ¿Quiénes pueden arrendar un espacio de trabajo con Espacio Temporal?

Cualquier persona, chilena o extranjera.

En todos nuestros centros contamos con un administrador, quien está dispuesto a ayudarte, para resolver cualquier problema que tengas.

2. ¿Qué requisitos se exigen para arrendar un espacio de trabajo?

Se exige el pago de un mes de garantía.

3. ¿Cuál es el periodo mínimo de arriendo?

El Periodo de arriendo mínimo es de 6 meses. De todas formas, si contamos con varios espacios disponibles, podemos flexibilizar el periodo acorde a tus necesidades.

4. ¿Puedo desocupar un espacio de trabajo de forma anticipada al termino del contrato?

Si, pero no podrás recuperar la garantía pagada.

5. ¿Se pagan gastos comunes?

Si, $20.000 mensuales. Con esto se cubren los gastos básicos de los centros: agua, luz, internet wifi, alarma y servicio de limpieza de áreas comunes.

6. ¿Cuáles son los horarios de los centros?

Todos nuestros centros abren de lunes a viernes a las 9 am y cierran a las 19 hrs.

7. ¿Me puedo quedar a dormir en mi espacio de trabajo?

No, los espacios son exclusivamente para fines comerciales. Por las noches quedan con las alarmas activadas y nadie puede quedase a alojar.

8. ¿Cómo puedo reservar espacio de trabajo y pagar mis mensualidades?

Puedes reservar un espacio directamente en nuestro sitio web (webpay) o haciendo un depósito/transferencia a la cuenta corriente de Espacio Temporal. Los datos los puedes solicitar al correo

9. ¿Tienen estacionamiento para auto o moto?

Algunos centros cuentan con estacionamiento. Hay que considerar un extra de $20.000.- mensuales a los valores normales de los espacios.
`;
import { General } from "../models/General";
import { Location } from "../models/Location";
import { getTokens } from "../utils/tokenizer";

const getCovers = catchAsync(async (req: any, res: any) => {
  const coversData = await General.find();

  if (!coversData) {
    throw new ApiError(httpStatus.NOT_FOUND, "No hay imagenes disponibles");
  }

  return res.status(httpStatus.OK).json(coversData);
});

const chatText = catchAsync(async (req: any, res: any) => {
  // const locations = await Location.createQueryBuilder("location")
  //   .innerJoinAndSelect("location.zone", "zone")
  //   .innerJoinAndSelect("location.owner", "owner")
  //   .select([
  //     "location.name",
  //     "location.address",
  //     "location.squareMeters",
  //     "zone.city",
  //     "owner.firstName",
  //     "owner.lastName",
  //   ])
  //   .getRawMany();

  let tokenCount = 0;
  const reqMessages = req.body.messages;

  reqMessages.forEach((msg: any) => {
    const tokens = getTokens(msg.content);
    tokenCount += tokens;
  });

  const moderationRes = await axios({
    method: "POST",
    url: "https://api.openai.com/v1/moderations",
    data: JSON.stringify({
      input: reqMessages[reqMessages.length - 1].content,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  }).catch((err) => {
    console.log(
      "%cerror general.controller.ts line:84 ",
      "color: red; display: block; width: 100%;",
      err
    );
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, err.error.message);
  });

  const moderationData: any = moderationRes.data;
  const [results] = moderationData.results;

  if (results.flagged) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "Se detectaron mensajes inapropidados por openai"
    );
  }

  const prompt = FIRST_PART_PROMPT;
  tokenCount += getTokens(prompt);

  if (tokenCount >= 4000) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Query demaciado larga");
  }

  const messages = [{ role: "system", content: prompt }, ...reqMessages];

  const chatRequestOpts = {
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.6,
  };

  const chatResponse = await axios({
    method: "POST",
    url: "https://api.openai.com/v1/chat/completions",
    data: JSON.stringify(chatRequestOpts),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  }).catch((err) => {
    console.log(
      "%cerror general.controller.ts line:84 ",
      "color: red; display: block; width: 100%;",
      err
    );

    throw new ApiError(httpStatus.NOT_ACCEPTABLE, err.error.message);
  });

  // console.log(
  //   "%cgeneral.controller.ts line:128 prompt",
  //   "color: #007acc;",
  //   JSON.stringify(prompt, null, "\t")
  // );
  return res.status(httpStatus.OK).json({ response: chatResponse.data });
});

module.exports = {
  getCovers,
  chatText,
};
