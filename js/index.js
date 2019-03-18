//import { Roller } from './roller.js';
//import * as rol from './roller.js';
/*jshint esversion: 6 */ 
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
  i.min = min;
  i.max = max;
  i.value = val;
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
let rollerWidth = 200;
let rollerHeight = 400;
let numImgs = 5;
let segsPerImg = 5;
let numSegs = numImgs * segsPerImg;

let zTranslate = rollerHeight/2;

// The angle from the edge of a segment to the centre of the roller. Angle
// inside a regular polygon is (n-2) × PI / n where n is the number of sides. We
// divide by a further 2 since that angle is shared by 2 adjacent segments.
let angle = (numSegs - 2) * Math.PI / 2 / numSegs;

//Ok we need to make sure that the segments divide into the image heights
//perfectly, damn!

// The height of each segment. 
let segHeight = 2 * zTranslate / Math.tan(angle);
//console.log("segHeight", segHeight);

// Helps reduce gaps in rendering to have whole number
segHeight = Math.round(segHeight);

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


let imSrc = "https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1089759.svg";

// This veiwbox neatly encompasses the kitty without too much empty space.
let wholeImgViewBox = {
  top: 500,
  left: 500,
  width: 2000,
  height: 2000
};
 
// we want to maintain the same aspect ratio between segs and imgSegs.
// So widen or lessen the image view to accomodate that.
let aspect = segHeight/rollerWidth;
// let aspect = segHeight/rollerWidth;
//let imgSegWidth = wholeImgViewBox.height*aspect/3;
//let imgSegWidth = 1;


// Now we need to re-center the image
//let diff = wholeImgViewBox.width - imgSegWidth;
//wholeImgViewBox.left += diff/2;
//wholeImgViewBox.width = imgSegWidth;

wholeImgViewBox.width = 1;
wholeImgViewBox.left = 1500;


//let imgSegHeight = wholeImgViewBox.height / segsPerImg;
//let imgSegHeight = wholeImgViewBox.width * aspect;
// We need an integer size
//imgSegHeight = Math.round(imgSegHeight);
// Now calculate the angle based on the integer size, If we want the segs to
// join we need to have an integer sized seg which means maybe recalculating the
// angle?
//angle = imgSegHeight

let imgSegHeight = wholeImgViewBox.height / segsPerImg;




scene.appendChild(roller);

for (let i = 0; i < numSegs; i++) {

  let seg = document.createElement("img");
  seg.setAttribute("width", String(rollerWidth));  //why does this fix it? because the width was too small and was cramping the image thereby causing less than the requred image amount to be cropped
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