
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


/**
 * @param {any[] | rol.SVG[]} array
 */
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
let leverWidth = rollerWidth * 0.6;
let rollersWidth = rollerWidth * 3;
let rollerHeight = rollerWidth / rollerAspectRatio;

// We want to allow space for a sign atop of the rollers
scene.style.height = `${rollerHeight * 2}vw`;
scene.style.margin = `${rollerHeight / 10}vw auto`;

// box container, everything except the lever
let boxContainer = document.createElement("div");
boxContainer.style = `
width: ${rollersWidth}vw;
height: ${rollerHeight * 2}vw;`;
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
line-height: ${signHeight / 2}vw;
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
  boxContainer.appendChild(v);
}

// Amount by which we push the roller back to sit in the viewHole.
let pushback = rollerHeight * 0.8;

// Roller animation base element
let style = document.createElement('style');
style.type = 'text/css';
document.getElementsByTagName('head')[0].appendChild(style);


for (let i = 0; i < rollers.length; i++) {
  const r = rollers[i];
  // Position because rollers are absolute;
  r.style.left = `${i * rollerWidth}vw`;
  r.style.transform = `translateZ(${-pushback}vw)`;


  boxContainer.appendChild(r);
}

// Add lever

let strut = document.createElement("div");

let sides = 6;
let strutWidth = leverWidth / 7;
let zTranslate = strutWidth/2;

strut.style = `
position: absolute;
width: ${strutWidth}vw;
height: ${rollerHeight}vw;
transform-style: preserve-3d;
transform-origin: 50% 100%;
/* border: 1px solid red; */`;



// Find the angle between adjacent segments.
// Angle inside a regular polygon is (n-2) × PI / n where n is the number of
// sides.
let betweenSides = (sides - 2) * Math.PI / sides;

// Find seg height, it will be twice the adjacent side of the triangle with
// opposite side of length zTranslate and angle betweenSides/2;
let segWidth = 2 * zTranslate / Math.tan(betweenSides / 2);

// create strut
for (let i = 0; i < 6; i++) {

  let seg = document.createElement("div");

  let shade = 80 + ((20*(i+2))%60);
  // @ts-ignore
  seg.style = `
  position: absolute;
  width: calc(${segWidth}vw + 1px); /* The added pixel closes the gaps in rendering */
  height: calc(${rollerHeight}vw); 
  background: grey;

  /* ensure transforms happen around the center of the segment */
  transform-origin: 50% 50%;

  /*
  position the segment in the center of it's parent, so push
  it half the height of its parent down and then pull it
  up by half of its height
  */
  background: rgb(${shade},${shade},${shade});
  left: 50%;
  margin-left: ${-segWidth / 2}vw;
  

  /* border: 1px solid red; */`;

  seg.style.transform = `rotateY(${360 * i / sides}deg) translateZ(${zTranslate}vw)`;
  strut.appendChild(seg);
}


let leverLean = 30;

let lever = document.createElement("div");
lever.style = `
position: absolute;
width: ${strutWidth}vw;
height: ${rollerHeight}vw;
left: ${(rollerWidth * 3) - strutWidth}vw;
top: ${signHeight-rollerHeight/2}vw;
transform-style: preserve-3d;
transform-origin: 50% 100%;
/* border: 1px solid red; */`;
lever.appendChild(strut);


scene.appendChild(lever);

let knob = document.createElement("div");
knob.style = `
position: absolute;
width: ${strutWidth * 4}vw;
height: ${strutWidth *4}vw;
border-radius: 50%;
background: radial-gradient(circle at top 0 right 25%,
  rgb(255, 235, 235) 10%,
  rgb(255, 0, 0) 15%,
  rgb(255, 0, 0) 20%,
  rgb(200, 0, 0) 25%,
  rgb(200, 0, 0) 50%,
  rgb(131, 0, 0) 70%);
  transform-origin: 50% 50%;`;
  scene.appendChild(knob);


let rotateAngle;
let verticalLeverHeight;
/**
 * Positions the lever with respect to where the user has dragged it.
 * @param {number} yoffset
 */
function positionLever(yoffset) {
  // ignore negative offsets
  yoffset = yoffset < 0 ? 0 : yoffset;

  // convert offset to vw as opposed to pixels
  yoffset = yoffset*100/window.innerWidth;

  verticalLeverHeight = rollerHeight * Math.cos(leverLean * Math.PI/180);
  let currentHeight = verticalLeverHeight - yoffset;
  rotateAngle = -Math.acos(currentHeight/verticalLeverHeight);

  strut.style.transform = `rotateZ(${leverLean}deg)`;
  lever.style.transform = `translateZ(${-pushback}vw) rotateX(${rotateAngle*180/Math.PI}deg)`;


  knob.style.left = `${(rollerWidth * 3)-strutWidth*2.5 + rollerHeight*Math.sin(leverLean * Math.PI/180)}vw`;
  knob.style.top = `${signHeight-rollerHeight/2-strutWidth*2 + rollerHeight - verticalLeverHeight + yoffset}vw`;
  knob.style.transform = `translateZ(${-pushback + strutWidth + verticalLeverHeight * Math.sin(-rotateAngle)}vw)`;
}
// Set initial lever position
positionLever(0);


let startPull;
knob.onmousedown = (ev) => {
  startPull = ev.clientY;
  window.onmousemove = (ev) => {
    positionLever(ev.clientY - startPull);
  };
};

let deltaRotate = Math.PI/1000;


window.onmouseup = () => {
  window.onmousemove = null;
  let timer = setInterval(()=>{
    if(rotateAngle+deltaRotate > 0){
      positionLever(0);
      deltaRotate = Math.PI/1000;
      clearInterval(timer);
      return;
    }
    let currentHeight = verticalLeverHeight - verticalLeverHeight * Math.cos(rotateAngle+deltaRotate);
    //convert to pixels.
    currentHeight = currentHeight* window.innerWidth/100;
    deltaRotate += deltaRotate*1.1;

    positionLever(currentHeight);
  },20);

  // set roller animations up
  
  let rollDegreesBase = 3600;
  let rollTimes = [];
  let animCss = "";
  for (let i = 0; i < rollers.length; i++) {
    let rollTimeSeconds = 2+2*Math.random();
    rollTimes.push(rollTimeSeconds);
    animCss += `@keyframes spin${i} {
      0% { transform: translateZ(${-pushback}vw) rotateX(0deg); }
    100% { transform: translateZ(${-pushback}vw) rotateX(${rollDegreesBase * rollTimeSeconds/4}deg); }
    }
    `;
  }

  style.innerHTML = animCss;

  for (let i = 0; i < rollers.length; i++) {
    const r = rollers[i];
    // Add toggleable rotation to the rollers
    r.style.animation = r.style.animation == '' ? `spin${i} ${rollTimes[i]}s 1` : '';
  }
};

// Let us pull the lever we will need the lever in a single div for this

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
