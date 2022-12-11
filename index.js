require('dotenv').config()
const express = require("express");
const app = express();
const axios = require("axios");
const moment = require("moment");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const API_KEY = process.env.API_KEY;

const calculateDuration = async (req, res) => {
  try {
    let totalDuration = 0;
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/playlistItems",
      {
        params: {
          part: "contentDetails",
          maxResults: 50,
          playlistId: req.body.playlist.slice(38, req.body.playlist.length),
          key: API_KEY,
        },
      }
    );

    videoIds = [];
    response.data.items.forEach((item) => {
      videoIds.push(item.contentDetails.videoId);
    });

    const videoResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "contentDetails",
          id: videoIds.join(","),
          key: API_KEY,
        },
      }
    );

    videoResponse.data.items.forEach((item) => {
      totalDuration += moment
        .duration(item.contentDetails.duration)
        .asSeconds();
    });

    let hours = Math.floor(totalDuration / 3600);
    let minutes = Math.floor((totalDuration - hours * 3600) / 60);
    let seconds = totalDuration - hours * 3600 - minutes * 60;

    console.log(totalDuration);
    res
      .status(200)
      .json({ message: "Success",videosCount : response.data.pageInfo.totalResults , durationInSeconds : totalDuration , duration: { hours: hours, minutes: minutes, seconds: seconds}});
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};

app.post("/", calculateDuration);

app.get("/", (req, res) => {
  res.send("Welcome to Youtube playlist length calculator");
});

app.get("/playlist", (req, res) => {
  calculateDuration();
  res.send("welcome the length is");
});

app.get("/message", (req, res) => {
  res.json({ message: "Hello from express!" });
});

const port = process.env.PORT || 3001;

app.listen(port, (req, res) => {
  console.log("Listening on port " + port);
});
