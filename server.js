require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");
const { makeShortUrl, urlIsValid } = require("./utils/shortUrl");
var validUrl = require("valid-url");

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO || "mongodb://localhost/url", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const urlModel = mongoose.model("Url", {
  longUrl: String,
  shortUrl: String,
});

app.get("/api/shorturl/:shortUrl", async (req, res) => {
  try {
    const doc = await urlModel.findOne({ shortUrl: req.params.shortUrl });
    res.redirect(doc.longUrl);
  } catch (error) {
    res.json({ error: "invalid url" });
  }
});

app.post("/api/shorturl", (req, res) => {
  const { url: longUrl } = req.body;
  if (!validUrl.isWebUri(longUrl)) {
    res.status(400).send({ error: "invalid url" });
    return;
  }
  const { hostname, origin } = new URL(longUrl);
  const test = new URL(longUrl);
  console.log(hostname, test);
  dns.lookup(hostname, async (err) => {
    if (!err) {
      const shortenedUrl = await urlModel.findOne({ longUrl });
      if (shortenedUrl) {
        res.send({
          original_url: shortenedUrl.longUrl,
          short_url: shortenedUrl.shortUrl,
        });
      } else {
        const shortUrl = makeShortUrl(longUrl);
        const url = new urlModel({ longUrl, shortUrl });
        const doc = await url.save();
        res.send({ original_url: doc.longUrl, short_url: doc.shortUrl });
      }
    } else {
      res.send({ error: "invalid url" });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

/* const express = require("express");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const validURL = require("valid-url");
const shortID = require("shortid");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB and mongoose connect
mongoose.connect(process.env.MONGO || "mongodb://localhost/url", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database schema
const urlSchema = new mongoose.Schema({
  originalURL: String,
  shortURL: String,
});
validURL.
const URL = mongoose.model("URL", urlSchema);

// App middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", function (req, res) {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// Response for POST request
app.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;
  const shortURL = shortID.generate();
  console.log(validURL.isUri(url));
  if (validURL.isWebUri(url) === undefined) {
    res.json({
      error: "invalid url",
    });
  } else {
    try {
      let findOne = await URL.findOne({
        originalURL: url,
      });
      if (findOne) {
        res.json({
          original_url: findOne.originalURL,
          short_url: findOne.shortURL,
        });
      } else {
        findOne = new URL({
          originalURL: url,
          shortURL,
        });
        await findOne.save();
        res.json({
          original_url: findOne.originalURL,
          short_url: findOne.shortURL,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json("Server error..");
    }
  }
});

// Redirect shortened URL to Original URL
app.get("/api/shorturl/:shortURL?", async (req, res) => {
  try {
    const urlParams = await URL.findOne({
      shortURL: req.params.shortURL,
    });
    if (urlParams) {
      return res.redirect(urlParams.originalURL);
    }
    return res.status(404).json("No URL found");
  } catch (err) {
    console.log(err);
    res.status(500).json("Server error..");
  }
});
// Listens for connections
app.listen(port, function () {
  console.log("Node.js listening ...");
});
 */
