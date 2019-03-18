
'use strict';

//import { Roller } from './roller.js';
import * as rol from './roller.js';

// Scene
let scene = document.querySelector(".scene");


// Controls
let controls = document.createElement("div");
controls.style.border = '1px dotted black';
controls.style.display = "inline-grid";
controls.style.gridTemplateColumns = "auto auto auto";
controls.style.gridGap = "10px";
controls.style.gridColumn = "7";

// Adds a range input and disply to controls and returns a range input and a div
// to display the value.
/**
 * @param {string} name
 * @param {string | number} min
 * @param {string | number} max
 * @param {string | number} val
 */
function addRangeControl(name, min, max, val) {
  let id = name + '_ID';

  let l = document.createElement("label");
  l.innerHTML = name;
  l.htmlFor = id;
  controls.appendChild(l);

  let i = document.createElement("input");
  i.type = "range";
  i.min = String(min);
  i.max = String(max);
  i.value = String(val);
  i.id = id;
  controls.appendChild(i);

  let d = document.createElement("div");
  controls.appendChild(d);

  return {
    input: i,
    display: d,
  };
}


// perspective
let perspective = addRangeControl("Perspective", 1, 2000, 1500);

perspective.input.onchange = perspective.input.oninput = function () {
  let p = perspective.input.value + "px";
  scene.style.perspective = p;
  perspective.display.innerHTML = p;
};
perspective.input.onchange(null); //Ensure value initialised

// perspective origin
let originX = addRangeControl("Origin x", 0, 100, 50);
let originY = addRangeControl("Origin y", 0, 100, 50);

function updatePerspectiveOrigin() {
  let x = originX.input.value + '%';
  let y = originY.input.value + '%';
  scene.style.perspectiveOrigin = x + ' ' + y;
  originX.display.innerHTML = x;
  originY.display.innerHTML = y;
}

// We batch this up because we can't execute
// updatePerspectiveOrigin untill both x and y are defined.
originX.input.onchange = originX.input.oninput = updatePerspectiveOrigin;
originY.input.onchange = originY.input.oninput = updatePerspectiveOrigin;
updatePerspectiveOrigin(); //Ensure values initialised


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}




let defaultViewBox = new rol.ViewBox(1750, 525, 2, 2500);
let svgs = [
  new rol.SVG("https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1452684.svg", defaultViewBox),
  new rol.SVG("https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1227462.svg", defaultViewBox),
  new rol.SVG("https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1356409.svg", defaultViewBox),
  new rol.SVG("https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1461111.svg", defaultViewBox),
  new rol.SVG("https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1467855.svg", defaultViewBox),
];


let frontPanel = document.createElement("div");
let fps = frontPanel.style;
fps.background = "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0), rgba(0,0,0,0), rgba(0,0,0,0),rgba(0,0,0,0.9))";
fps.position = "absolute";
fps.border = "1px solid black";
fps.width = "100%";
fps.height = "85%";
//fps.zIndex = "10";
fps.transform = `translateZ(${(Number(360)/2)+1}px) translateY(25px)`;
//fps.clipPath = 'url(#clipPath1)';
fps.display = "grid";
fps.gridTemplateColumns="1fr 1fr 1fr";

scene.appendChild(frontPanel);

function addCol(col) {
  let d = document.createElement("div");
  d.style = `
  box-shadow: 10px 5px 5px red;
    background: black;
    grid-row: 1/5;
    grid-column: ${col}`;
  frontPanel.appendChild(d);
}
// addCol("1");
// addCol("3");
// addCol("5");
// addCol("7");

function addRow(row) {
  let d = document.createElement("div");
  d.style = `
    background: black;
    grid-row: ${row};
    grid-column: 1/13`;
  frontPanel.appendChild(d);
}
// addRow("1");
// addRow("4");





let roller = rol.CreateRoller(280, 360, svgs, 5);
scene.appendChild(roller);


svgs = shuffle(svgs);
roller = rol.CreateRoller(280, 360, svgs, 5);
scene.appendChild(roller);

svgs = shuffle(svgs);
roller = rol.CreateRoller(280, 360, svgs, 5);
scene.appendChild(roller);

// animate roller
let style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `@keyframes spin {
  0% { transform: rotateX(0deg); }
100% { transform: rotateX(720deg); }
}`;
document.getElementsByTagName('head')[0].appendChild(style);

let animating = false;
scene.onclick = () => {
  roller.style.animation = animating ? '' : 'spin 4s infinite';
  animating = !animating;
};



// rotate
let rotateY = addRangeControl("Rotate y", 0, 360, 0);
let rotateZ = addRangeControl("Rotate z", 0, 360, 0);
/*
function updateTransform() {
  let y = rotateY.input.value + "deg";
  let z = rotateZ.input.value + "deg";
  roller.style.transform = `
  rotateY(${y})
  rotateZ(${z})`;
  rotateY.display.innerHTML = y;
  rotateZ.display.innerHTML = z;
}

rotateY.input.onchange = rotateY.input.oninput = updateTransform;
rotateZ.input.onchange = rotateZ.input.oninput = updateTransform;
updateTransform(); //Ensure value initialised
*/
document.body.appendChild(scene);
document.body.appendChild(controls);