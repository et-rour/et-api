export {};

const objectId = (value: any, helpers: any) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value: any, helpers: any) => {
  if (value.length < 8) {
    return helpers.message("La contraseña debe tener al menos 8 caracteres");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "la contraseña debe contener al menos 1 letra y 1 número"
    );
  }
  return value;
};

module.exports = {
  objectId,
  password,
};
