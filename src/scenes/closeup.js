const SVG = require("rabbit-ear-svg");
const dateSequence = require("../schedule/dateSequence")
const SVGsToVideo = require("../file/svgsToVideo");
const Ephemeris = require("../ephemeris/moons");
const Jupiter = require("../draw/jupiter");
const Roto = require("../draw/roto");

const makeTweetText = (startDate, endDate) => {
  const day = startDate.format("dddd");
  const start = startDate.format("h:mm a");
  const end = endDate.format("h:mm a");
  return `Jupiter now, the next 5 hours (${start} - ${end} UTC+0)`;
};

// @param {object} date is a Moment.js object
// @param {number} integer 0...n frame number
const TelescopeJupiter = (date, frameNum) => {
  const chart = Ephemeris(date);

  const svg = SVG(-1, -1, 2, 2)
    .padding(0.5);
  svg.background("black");
  svg.appendChild(Jupiter(date, frameNum));

  // draw moons
  const options = { t: date.unix(), magnitude: 1 };
  chart.map((moon, i) => Roto(`./assets/${moon.name}.svg`, options)
      .translate(moon.x, moon.y)
      // .scale(moon.radius * 2))
      .scale(moon.radius * 4))
    .forEach(g => svg.appendChild(g));

  return svg.save();
};

const Scene = function (startDate, endDate, frames) {
  return new Promise((resolve, reject) => {
    const dates = dateSequence(startDate, endDate, frames);
    const svgs = dates.map((date, i) => TelescopeJupiter(date, i));
    SVGsToVideo(svgs, [400, 400])
      .then((videoPath) => resolve({
        // tweet: makeTweetText(startDate, endDate),
        media: videoPath,
      }))
      .catch(reject);
  });
};

module.exports = Scene;
