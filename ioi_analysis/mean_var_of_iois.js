// Caroline Owen, Tom Collins, Jennifer Bantick, 4.3.2020
// Analysing MIDI files to get mean and variance of IOIs and export them to a
// file for importing to SPSS.

// Individual user paths.
const mainPaths = {
  "tom": {
    "midiDir": __dirname + "/midi/",
    "outputDir": __dirname + "/csv/",
    "outputFileName": "mean_var_etc.csv"
  },
  "anotherUser": {
    // ...
  }
}

// Requires.
const fs = require("fs")
const { Midi } = require('@tonejs/midi')
const mu = require("maia-util")

// Parameters

// Grab user name from command line to set path to data.
let nextU = false
let mainPath;
process.argv.forEach(function(arg, ind){
  if (arg === "-u"){
    nextU = true
  }
  else if (nextU){
    mainPath = mainPaths[arg]
    nextU = false
  }
})
// fs.mkdir(outdir);

let analysisString = ""
// Import and analyse the MIDI files.
let pFiles = fs.readdirSync(mainPath["midiDir"])
pFiles = pFiles.filter(function(pFile){
  return pFile.split(".")[1] == "mid"
})
console.log("pFiles:", pFiles);

pFiles.forEach(function(pFile, iFile){
  console.log("pFile:", pFile)
  if (iFile % 1 == 0){
    console.log("!!! PFILE " + (iFile + 1) + " OF " + pFiles.length + " !!!")
  }
  try {
    const midiData = fs.readFileSync(mainPath["midiDir"] + pFile);
    const midi = new Midi(midiData)
    let allPoints = []
    // let trials = []
    // let points = []
    // console.log("midi:", midi)
    midi.tracks[0].notes.forEach(function(n, idx){
      // if (idx > 0){
      //   if (n.time - midi.tracks[0].notes[idx - 1].time > 5){
      //     // Make a new trial.
      //     trials.push(points)
      //     points = []
      //   }
      // }
      // points.push([
      //   n.time,
      //   n.midi,
      //   n.duration,
      //   Math.round(1000*n.velocity)/1000
      // ])
      allPoints.push([
        n.time,
        n.midi,
        n.duration,
        Math.round(1000*n.velocity)/1000
      ])
    })
    // console.log("trials.slice(0, 3):", trials.slice(0, 3));
    // console.log("allPoints.slice(0, 10):", allPoints.slice(0, 10));
    // console.log("allPoints.slice(-10):", allPoints.slice(-10));
    // Throw away first two and last notes.
    allPoints = allPoints.slice(2, -1)
    // console.log("allPoints.slice(0, 10):", allPoints.slice(0, 10));
    // console.log("allPoints.slice(-10):", allPoints.slice(-10));
    let ioi = []
    allPoints.forEach(function(p, idx){
      if (idx > 0){
        ioi.push(p[0] - allPoints[idx - 1][0])
      }
    })
    // console.log("ioi.slice(0, 10):", ioi.slice(0, 10))
    // console.log("ioi.slice(-10):", ioi.slice(-10))
    let m = mu.mean(ioi)
    console.log("m:", m)
    let s = std(ioi)
    console.log("s:", s)
    analysisString += pFile + "," + m + "," + s + "\n"
  }
  catch (e) {
    console.log(e)
  }



});

fs.writeFileSync(
  mainPath["outputDir"] + mainPath["outputFileName"],
  analysisString
  // JSON.stringify(pStm)
)

function std(x){
  const xbar = mu.mean(x)
  let ss = 0
  x.forEach(function(val){
    ss += Math.pow((val - xbar), 2);
  })
  return ss/(x.length - 1)
}
