//import { Roller } from './roller.js';
//import * as rol from './roller.js';
/*jshint esversion: 6 */
/* jshint -W097 */ // Disable warning for using strict on file.
/*jshint browser: true */ // Disable warning of document undefined.
'use strict';

// Scene
let scene = document.createElement("div");
// @ts-ignore
scene.style = `
    width: 400px;
    height: 400px;
    border: 1px solid black;
    grid-column: 2`;

// Controls
let controls = document.createElement("div");
controls.style.border = '1px dotted black';
controls.style.display = "inline-grid";
controls.style.gridTemplateColumns = "auto auto auto";
controls.style.gridGap = "10px";
controls.style.gridColumn = "3";

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
let perspective = addRangeControl("Perspective", 1, 2000, 1000);

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


/* 
The roller is formed from a collection of segments, each segment is rotated
around the X axis by an amount inversely proportional to the total number of
segments, and then each segment is Z translated such that the edges of these
segments or are aligned and just touching this means the height of the roller
will be double the Z translation of each element. Given that we know the
required height of the roller, we know that the Z translation will be half the
roller height. We need to calculate the segment height such that the translation
required to line up the edges will be equal to half the roller height. We can
find the angle in between each segment and we know the opposite side which is
half the roller height so we just need to calculate the adjacent which will be
equal to half the segment height.
 */
let rollerWidth = 250;
let rollerHeight = 400;
let numImgs = 5;
let segsPerImg = 4;
let numSegs = numImgs * segsPerImg;

let zTranslate = rollerHeight / 2;

// The angle from the edge of a segment to the centre of the roller. Angle
// inside a regular polygon is (n-2) × PI / n where n is the number of sides. We
// divide by a further 2 since that angle is shared by 2 adjacent segments.
let angle = (numSegs - 2) * Math.PI / 2 / numSegs;

// The height of each segment. 
let segHeight = 2 * zTranslate / Math.tan(angle);
//console.log("segHeight", segHeight);

// Helps reduce gaps in rendering to just bridge the gap between components
// but also borks the images a bit when more segs per image are used.
// could look into overlapping segments, sounds promising.
segHeight = Math.trunc(segHeight) + 1;

let roller = document.createElement("div");


// @ts-ignore
roller.style = `
    width: ${rollerWidth}px;
    height: ${rollerHeight}px;
    position: relative;
    transform-origin: 50% 50%;
    transform-style: preserve-3d;
    border: 1px solid red;
    margin:auto;
`;

// rotate
let rotateY = addRangeControl("Rotate y", 0, 360, 0);
let rotateZ = addRangeControl("Rotate z", 0, 360, 0);

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

scene.appendChild(roller);

let imSrc = "https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1089759.svg";


/*
The default approach taken by fragment identifiers to mapping the viewbox to
the viewport(the img tag) is that the viewbox center will be aligned with the
viewport center, and it will be scaled maintaining its aspect ratio such that
it fills the viewport as far as it can without extending any edges past the
viewport. At that point any edges not at the extent of the viewport will be
extended to touch the viewport edges. This means if we have defined a square
viewbox that we put in a rectangular viewport we will see a rectangular
section of the svg.

The original kitty viewbox is (0,0,3000,3000) with quite a lot of empty space
around the kitty so we want to cut about 500 off each edge. We also want to
ensure that each image slice fills the viewport fully vertically, this ensures
that segments will align. We are not bothered about the horizontal aspect of our
viewbox as long as it is centered. By setting the width to be very small and
setting the left offset to the center of the image we ensure that the viewport
is fully vertically filled and leave it up to the SVG system to extend the
viewbox to the horizontal segment edges.
*/

// Original kitty viewbox (0,0,3000,3000)
let wholeImgViewBox = {
  height: 2000, // Shave 1000 off total height
  top: 500,     // Offset vertically so viewbox is centered  
  width: 2,     // Tiny width, allow svg system to extend as needed
  left: 1499,   // Center our viewbox horizontally
};

let imgSegHeight = wholeImgViewBox.height / segsPerImg;



for (let i = 0; i < numSegs; i++) {

  let seg = document.createElement("img");
  seg.setAttribute("width", String(rollerWidth));
  seg.setAttribute("height", String(segHeight));

  let imgOffset = (i * imgSegHeight) % wholeImgViewBox.height;

  let svgView = imSrc +
    `#svgView(viewBox(${wholeImgViewBox.left}, 
    ${wholeImgViewBox.top + imgOffset}, 
    ${wholeImgViewBox.width}, 
    ${imgSegHeight}))`;

  seg.setAttribute("src", svgView);

  // @ts-ignore
  seg.style = `
    position: absolute;
    background: grey;

    /* ensure transforms happen around the center of the segment */
    transform-origin: 50% 50%;

    /*
    position the segment in the center of it's parent, so push
    it half the height of its parent down and then pull it
    up by half of its height
    */
    top: 50%;
    margin-top: ${-segHeight / 2}px;

   /* border: 1px solid red;*/
`;

  seg.style.transform = `rotateX(-${360 * i / numSegs}deg) translateZ(${zTranslate}px)`;

  roller.appendChild(seg);

}

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



document.body.appendChild(scene);
document.body.appendChild(controls);