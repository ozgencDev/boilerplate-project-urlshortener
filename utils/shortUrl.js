const nanoid = require("nanoid");

module.exports.makeShortUrl = () => {
  return nanoid.nanoid(6);
};
