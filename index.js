const {
  performance,
  PerformanceObserver
} = require('perf_hooks');

const fs = require('fs');
// const Browscap = require('browscap-js');
const useragent = require('useragent');
// var browscap = new Browscap();

let file = fs.readFileSync('./useragents.txt', 'utf8');
let useragents = file.split('\n');

let durations = [];
let parsedUseragents = [];

function getBrowser(a) {
  // let start = new Date().valueOf();
  // let data = browscap.getBrowser(a);
  let data = new useragent.lookup(a);
  console.log(data);
  parsedUseragents.push(data);
  // let end = new Date().valueOf();
  // console.log(end-start);

  // return data;
}

const wrapped = performance.timerify(getBrowser);

const obs = new PerformanceObserver((list) => {
  durations.push(list.getEntries()[0].duration);
});

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

obs.observe({ entryTypes: ['function'] });

// A performance timeline entry will be created
for (var i = useragents.length - 1; i >= 0; i--) {
  wrapped(useragents[i])
}

obs.disconnect();
performance.clearFunctions();

let sortedDurations = durations.sort();
let len = sortedDurations.length;
let sum = sortedDurations.reduce((a, b) => a+b);
let mean = sum/len;
let max = Math.max(...sortedDurations);
let min = Math.min(...sortedDurations);
let median = (sortedDurations[len/2] + sortedDurations[len/2 + 1]) / 2;
let absoluteDeviations = sortedDurations.map(duration => Math.abs(duration - median));
let sortedAbsoluteDeviations = absoluteDeviations.sort();
let MAD = (sortedAbsoluteDeviations[len/2] + sortedAbsoluteDeviations[len/2 + 1]) / 2;


console.log(`Calls: ${len}   Max: ${precisionRound(max, 3)}ms   Min: ${precisionRound(min, 3)}ms   MAD: ${precisionRound(MAD, 3)}ms   Mean: ${precisionRound(mean, 3)}ms   Total time: ${precisionRound(sum/1000, 3)}s`);

console.log(parsedUseragents[500]);
