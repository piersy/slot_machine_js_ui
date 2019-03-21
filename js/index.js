
'use strict';

//import { Roller } from './roller.js';
import * as rol from './roller.js';

// Scene
let scene = document.getElementById("scene");


// Controls
let controls = document.createElement("div");
controls.style.border = '1px dotted black';
controls.style.display = "inline-grid";
controls.style.gridTemplateColumns = "auto auto auto";
controls.style.gridGap = "10px";

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


// @ts-ignore
const maxSceneWidth = 1000;
const minSceneWidth = 300;

let sceneWidth = 0.8 * window.innerWidth;
sceneWidth = sceneWidth < maxSceneWidth ? sceneWidth : maxSceneWidth;
sceneWidth = sceneWidth > minSceneWidth ? sceneWidth : minSceneWidth;

// Convert to vw
sceneWidth = 100 * sceneWidth / window.innerWidth;

scene.style.width = `${sceneWidth}vw`;
let rollerAspectRatio = 1;
let rollerWidth = sceneWidth / 3;
let rollerHeight = rollerWidth / rollerAspectRatio;

// We want to allow space for a sign atop of the rollers
scene.style.height = `${rollerHeight * 2}vw`;
scene.style.margin = `${rollerHeight / 10}vw auto`;

// Add sign
let signHeight = rollerHeight / 2.5;
let sign = document.createElement("div");
sign.style = `
display: flex;
flex-direction: column;
align-items: center;`;
scene.appendChild(sign);

let upperSign = document.createElement("div");
upperSign.style = `
width: ${sceneWidth / 4}vw;
height: ${signHeight / 2}vw;
border-top-left-radius: ${signHeight / 2}vw;
border-top-right-radius: ${signHeight / 2}vw;
background: grey;
text-align: center;
font-size: 2rem;
font-weight: 500;
font-family: Palm;
line-height: ${signHeight/2}vw;`;  // The line height being the same height as the div centers the text vertically
upperSign.innerHTML = "Kitty Slots";
sign.appendChild(upperSign);

let lowerSign = document.createElement("div");
lowerSign.style = `
width: ${sceneWidth}vw;
height: ${signHeight / 2}vw;
border-top-left-radius: ${signHeight / 2}vw;
border-top-right-radius: ${signHeight / 2}vw;
background: grey;`;
sign.appendChild(lowerSign);

// Roller container
let rollerContainer = document.createElement("div");
rollerContainer.style = `
width: ${sceneWidth}vw;
height: ${rollerHeight}vw;`;
scene.appendChild(rollerContainer);

let rollers = [];
let viewHoles = [];
let r = rol.CreateRoller(rollerWidth, rollerHeight, svgs, 5);
rollers.push(r[0]);
viewHoles.push(r[1]);


svgs = shuffle(svgs);
r = rol.CreateRoller(rollerWidth, rollerHeight, svgs, 5);
rollers.push(r[0]);
viewHoles.push(r[1]);

svgs = shuffle(svgs);
r = rol.CreateRoller(rollerWidth, rollerHeight, svgs, 5);
rollers.push(r[0]);
viewHoles.push(r[1]);

for (let i = 0; i < viewHoles.length; i++) {
  const v = viewHoles[i];
  // Position because rollers are absolute;
  v.style.left = `${i * rollerWidth}vw`;
  // Make sure this doesn't catch clicks so we can click the roller
  v.style.pointerEvents = "none";
  rollerContainer.appendChild(v);
}

// Amount by which we push the roller back to sit in the viewHole.
let pushback = rollerHeight * 0.8;

// Roller animation
let style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `@keyframes spin {
  0% { transform: translateZ(${-pushback}vw) rotateX(0deg); }
100% { transform: translateZ(${-pushback}vw) rotateX(720deg); }
}`;
document.getElementsByTagName('head')[0].appendChild(style);


for (let i = 0; i < rollers.length; i++) {
  const r = rollers[i];
  // Position because rollers are absolute;
  r.style.left = `${i * rollerWidth}vw`;
  r.style.transform = `translateZ(${-pushback}vw)`;



  // Add toggleable rotation to the rollers
  r.onclick = () => {
    r.style.animation = r.style.animation == '' ? 'spin 4s 1' : '';
  };
  rollerContainer.appendChild(r);
}


// rotate
let rotateX = addRangeControl("Rotate x", -360, 360, 0);
let rotateY = addRangeControl("Rotate y", -360, 360, 0);
let rotateZ = addRangeControl("Rotate z", -360, 360, 0);

function updateTransform() {
  let x = rotateX.input.value + "deg";
  let y = rotateY.input.value + "deg";
  let z = rotateZ.input.value + "deg";
  // @ts-ignore
  scene.style.transform = `
  rotateX(${x})
  rotateY(${y})
  rotateZ(${z})`;
  rotateX.display.innerHTML = x;
  rotateY.display.innerHTML = y;
  rotateZ.display.innerHTML = z;
}

rotateX.input.onchange = rotateX.input.oninput = updateTransform;
rotateY.input.onchange = rotateY.input.oninput = updateTransform;
rotateZ.input.onchange = rotateZ.input.oninput = updateTransform;
updateTransform(); //Ensure value initialised

document.body.appendChild(controls);
