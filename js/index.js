
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
let rollerWidth = sceneWidth / 4; // scene is 3 rollers + a lever
let leverWidth = rollerWidth*0.6;
let rollersWidth = rollerWidth * 3;
let rollerHeight = rollerWidth / rollerAspectRatio;

// We want to allow space for a sign atop of the rollers
scene.style.height = `${rollerHeight * 2}vw`;
scene.style.margin = `${rollerHeight / 10}vw auto`;

// box container, everything except the lever
let boxContainer = document.createElement("div");
boxContainer.style = `
width: ${rollersWidth}vw;
height: ${rollerHeight*2}vw;`;
scene.appendChild(boxContainer);

// Add sign
let signHeight = rollerHeight / 2.5;
let sign = document.createElement("div");
sign.style = `
display: flex;
flex-direction: column;
align-items: center;`;
boxContainer.appendChild(sign);


let upperSign = document.createElement("div");
upperSign.style = `
width: ${rollersWidth / 4}vw;
height: ${signHeight / 2}vw;
border-top-left-radius: ${signHeight / 2}vw;
border-top-right-radius: ${signHeight / 2}vw;
background: grey;
text-align: center;
font-size: 3vw;
font-weight: 500;
font-family: Palm;
line-height: ${signHeight/2}vw;
`;  // The line height being the same height as the div centers the text vertically
upperSign.innerHTML = "Kitty Slots";
sign.appendChild(upperSign);

let lowerSign = document.createElement("div");
lowerSign.style = `
width: ${rollersWidth}vw;
height: ${signHeight / 2}vw;
border-top-left-radius: ${signHeight / 2}vw;
border-top-right-radius: ${signHeight / 2}vw;
background: grey;`;
sign.appendChild(lowerSign);

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
  boxContainer.appendChild(v);
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
  boxContainer.appendChild(r);
}

// Add lever
let leverBase = document.createElement("div");
leverBase.style = `
position: absolute;
width: ${leverWidth/2}vw;
height: ${leverWidth}vw;
background: radial-gradient(circle at top 0 right 25%,
  white 10%,
  rgb(231, 100, 100) 30%,
  rgb(201, 70, 70) 40%,
  rgb(131, 0, 0) 65%);
left: ${rollerWidth*3}vw;
top: ${signHeight + rollerHeight/2 - leverWidth/2}vw;
border-top-right-radius: ${leverWidth}vw;
border-bottom-right-radius: ${leverWidth}vw;
transform: translateZ(${-pushback}vw)`;
scene.appendChild(leverBase);

let lever = document.createElement("div");
lever.style = `
position: absolute;
width: ${leverWidth/4}vw;
height: ${signHeight + rollerHeight/2}vw;
background: linear-gradient(0.25turn, 
rgb(120,120,120) 0%, 
rgb(120,120,120) 33%, 
rgb(100,100,100) 33%,
rgb(100,100,100) 66%,
rgb(80,80,80) 66%);
rgb(80,80,80) 100%);
left: ${rollerWidth*2.98}vw;
top: 0vw;
z-index: -1;
transform-origin: 50% 100%;
transform: translateZ(${-pushback}vw) rotateZ(25deg) translateY(${-leverWidth/3}vw);`;
scene.appendChild(lever);

let knob = document.createElement("div");
knob.style = `
position: absolute;
width: ${leverWidth/1.5}vw;
height: ${leverWidth/1.5}vw;
border-radius: 50%;
background: radial-gradient(circle at top 0 right 25%,
  white 10%,
  rgb(231, 100, 100) 30%,
  rgb(201, 70, 70) 40%,
  rgb(131, 0, 0) 65%);


left: ${rollerWidth*2.98}vw;
top: 0vw;
z-index: -1;
transform-origin: 50% 50%;
transform: translateZ(${-pushback}vw) rotateZ(25deg) translateY(${-leverWidth/1.5}vw) translateX(${leverWidth/3.2}vw);`;
scene.appendChild(knob);

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
