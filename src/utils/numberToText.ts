/*************************************************************/
// NumeroALetras
// @author   Rodolfo Carmona
/*************************************************************/
function Unidades(num: any) {
  switch (num) {
    case 1:
      return "UN";
    case 2:
      return "DOS";
    case 3:
      return "TRES";
    case 4:
      return "CUATRO";
    case 5:
      return "CINCO";
    case 6:
      return "SEIS";
    case 7:
      return "SIETE";
    case 8:
      return "OCHO";
    case 9:
      return "NUEVE";
  }

  return "";
}

function Decenas(num: any) {
  let decena = Math.floor(num / 10);
  let unidad = num - decena * 10;

  switch (decena) {
    case 1:
      switch (unidad) {
        case 0:
          return "DIEZ";
        case 1:
          return "ONCE";
        case 2:
          return "DOCE";
        case 3:
          return "TRECE";
        case 4:
          return "CATORCE";
        case 5:
          return "QUINCE";
        default:
          return "DIECI" + Unidades(unidad);
      }
    case 2:
      switch (unidad) {
        case 0:
          return "VEINTE";
        default:
          return "VEINTI" + Unidades(unidad);
      }
    case 3:
      return DecenasY("TREINTA", unidad);
    case 4:
      return DecenasY("CUARENTA", unidad);
    case 5:
      return DecenasY("CINCUENTA", unidad);
    case 6:
      return DecenasY("SESENTA", unidad);
    case 7:
      return DecenasY("SETENTA", unidad);
    case 8:
      return DecenasY("OCHENTA", unidad);
    case 9:
      return DecenasY("NOVENTA", unidad);
    case 0:
      return Unidades(unidad);
  }
} //Unidades()

function DecenasY(strSin: any, numUnidades: any) {
  if (numUnidades > 0) return strSin + " Y " + Unidades(numUnidades);

  return strSin;
} //DecenasY()

function Centenas(num: any) {
  let centenas = Math.floor(num / 100);
  let decenas = num - centenas * 100;

  switch (centenas) {
    case 1:
      if (decenas > 0) return "CIENTO " + Decenas(decenas);
      return "CIEN";
    case 2:
      return "DOSCIENTOS " + Decenas(decenas);
    case 3:
      return "TRESCIENTOS " + Decenas(decenas);
    case 4:
      return "CUATROCIENTOS " + Decenas(decenas);
    case 5:
      return "QUINIENTOS " + Decenas(decenas);
    case 6:
      return "SEISCIENTOS " + Decenas(decenas);
    case 7:
      return "SETECIENTOS " + Decenas(decenas);
    case 8:
      return "OCHOCIENTOS " + Decenas(decenas);
    case 9:
      return "NOVECIENTOS " + Decenas(decenas);
  }

  return Decenas(decenas);
} //Centenas()

function Seccion(num: any, divisor: any, strSingular: any, strPlural: any) {
  let cientos = Math.floor(num / divisor);
  let resto = num - cientos * divisor;

  let letras = "";

  if (cientos > 0)
    if (cientos > 1) letras = Centenas(cientos) + " " + strPlural;
    else letras = strSingular;

  if (resto > 0) letras += "";

  return letras;
} //Seccion()

function Miles(num: any) {
  let divisor = 1000;
  let cientos = Math.floor(num / divisor);
  let resto = num - cientos * divisor;

  let strMiles = Seccion(num, divisor, "UN MIL", "MIL");
  let strCentenas = Centenas(resto);

  if (strMiles == "") return strCentenas;

  return strMiles + " " + strCentenas;

  //return Seccion(num, divisor, "UN MIL", "MIL") + " " + Centenas(resto);
} //Miles()

function Millones(num: any) {
  let divisor = 1000000;
  let cientos = Math.floor(num / divisor);
  let resto = num - cientos * divisor;

  let strMillones = Seccion(num, divisor, "UN MILLON", "MILLONES");
  let strMiles = Miles(resto);

  if (strMillones == "") return strMiles;

  return strMillones + " " + strMiles;

  //return Seccion(num, divisor, "UN MILLON", "MILLONES") + " " + Miles(resto);
} //Millones()

function NumeroALetras(num: any) {
  var data = {
    numero: num,
    enteros: Math.floor(num),
    centavos: Math.round(num * 100) - Math.floor(num) * 100,
    letrasCentavos: "",
    letrasMonedaPlural: "PESOS",
    letrasMonedaSingular: "PESO",
  };

  if (data.centavos > 0) data.letrasCentavos = "CON " + data.centavos + "/100";

  if (data.enteros == 0)
    return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
  if (data.enteros == 1)
    return (
      Millones(data.enteros) +
      " " +
      data.letrasMonedaSingular +
      " " +
      data.letrasCentavos
    );
  else
    return (
      Millones(data.enteros) +
      " " +
      data.letrasMonedaPlural +
      " " +
      data.letrasCentavos
    );
} //NumeroALetras()
function NumeroFormat(num: any) {
  // console.log(
  //   "%cnumberToText.ts line:190 num",
  //   "color: white; background-color: #007acc;",
  //   num
  // );
  const newNum = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // console.log(
  //   "%cnumberToText.ts line:190 num",
  //   "color: white; background-color: #007acc;",
  //   num
  // );
  return newNum;
}

exports.numeroALetras = NumeroALetras;
exports.numeroFormat = NumeroFormat;
