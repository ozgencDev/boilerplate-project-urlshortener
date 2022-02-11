const dns = require("dns");

dns.lookup("www.google.com", (err, address) => {
  console.log(address);
});

const nanoid = require("nanoid");
console.log(nanoid.nanoid(4));
