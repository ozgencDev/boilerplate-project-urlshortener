const dns = require("dns");

dns.lookup("https://www.google.com", (err, address) => {
  console.log(address, err);
});
