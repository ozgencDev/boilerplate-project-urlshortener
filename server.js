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
    console.log("ses");
    res.json({ error: "invalid url" });
    return;
  }
  const { hostname, origin } = new URL(longUrl);
  const test = new URL(longUrl);
  console.log(hostname, test);
  dns.lookup(hostname, async (err) => {
    if (!err) {
      const shortenedUrl = await urlModel.findOne({ longUrl });
      if (shortenedUrl) {
        res.json({
          original_url: shortenedUrl.longUrl,
          short_url: shortenedUrl.shortUrl,
        });
      } else {
        const shortUrl = makeShortUrl(longUrl);
        const url = new urlModel({ longUrl, shortUrl });
        const doc = await url.save();
        res.json({ original_url: doc.longUrl, short_url: doc.shortUrl });
      }
    } else {
      res.json({ error: "invalid url" });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
