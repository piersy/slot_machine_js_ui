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
let perspective = addRangeControl("Perspective", 1, 1000, 400);

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

let roller = document.createElement("div");

// rotate
let rotateY = addRangeControl("Rotate y", 0, 365, 0);
let rotateZ = addRangeControl("Rotate z", 0, 365, 0);

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




/*
  // create a new div element and give it some content 
  var newDiv = document.createElement("div"); 
  var newContent = document.createTextNode("Hi there and greetings!");
  // add the text node to the newly created div.
  newDiv.appendChild(newContent);
  // add the newly created element and its content into the DOM 
  var currentDiv = document.getElementById("div1"); 
  // document.body.insertBefore(newDiv, currentDiv);
  currentDiv.appendChild(newDiv);

*/
let numImgs = 5;
let numSegs = 50;
let segHeight = 20;
let segWidth = 200;
let imSrc = "https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1089759.svg";
let wholeImgViewBox = {
  top: 500,
  left: 500,
  width: 2000,
  height: 2000
};

let imgLength = numImgs * wholeImgViewBox.height;
let imgSegHeight = imgLength / numSegs;
let segLength = numSegs * segHeight;

/* Determine the "radius"...
we know the side length divide by 2 to get the (adjacent)
and we need to find the length to centre point (opposite)
We find the inner angle of an intersection further divided by 2 since each corner
is shared by 2 adjacent segments.
*/

// Angle inside a regular polygon is (n-2) × PI / n
// where n is the number of sides

let angle = (numSegs - 2) * Math.PI / 2 / numSegs;
let zTranslate = segHeight / 2 * Math.tan(angle);


// @ts-ignore
roller.style = `
    width: 200px;
    height: 200px;
    position: relative;
    transform-origin: 50% 50%;
    transform-style: preserve-3d;
border: 1px solid red;
margin: 100px;
`;



scene.appendChild(roller);

for (let i = 0; i < numSegs; i++) {

  let seg = document.createElement("img");
  seg.setAttribute("width", String(segWidth));
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
`;


  seg.style.transform = `rotateX(-${365 * i / numSegs}deg) translateZ(${zTranslate - 10}px)`;


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