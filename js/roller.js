/**
 * ViewBox is a simple container for the 4 vlaues that make up a view box.
 */
export class ViewBox {
    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     */
    constructor(x, y, width, height) {
        Object.assign(this, { x, y, width, height });
    }
}

/**
 * SVG serves as a container for an svg url and an associated ViewBox.
 */
export class SVG {
    /**
     * @param {String} url
     * @param {ViewBox} viewBox
     */
    constructor(url, viewBox) {
        Object.assign(this, { url, viewBox });
    }
}

/**
 * CreateRoller creates an element that contains a 3d roller of the desired
 * height and width with the provided svgs stacked on top of each other and
 * wrapped around the roller. For each image provided there will be segsPerImage
 * segments.
 *
 * The roller is formed from a collection of segments, each segment is rotated
 * around the X axis by an amount inversely proportional to the total number of
 * segments, and then each segment is Z translated by height/2 such that the
 * edges of these segments or are aligned and just touching. The function will
 * determine the segment height such that the translation required to line up
 * the edges will be equal height/2.
 * 
 * @param {Number} width
 * @param {Number} height
 * @param {Array}  svgs - an array of @link{SVG} objects.
 * @param {Number} segsPerImage
 * @returns {HTMLElement}
 */
export function CreateRoller(width, height, svgs, segsPerImage) {

    let numSegs = svgs.length * segsPerImage;
    let zTranslate = height / 2;

    // Find the angle between adjacent segments.
    // Angle inside a regular polygon is (n-2) × PI / n where n is the number of
    // sides.
    let betweenSides = (numSegs - 2) * Math.PI / numSegs;

    // Find seg height, it will be twice the adjacent side of the triangle with
    // opposite side of length zTranslate and angle betweenSides/2;
    let segHeight = 2 * zTranslate / Math.tan(betweenSides / 2);

    // Helps reduce gaps in rendering to just bridge the gap between components
    // but also borks the images a bit when more segs per image are used.
    // could look into overlapping segments, sounds promising.
    segHeight = Math.trunc(segHeight) + 1;

    let roller = document.createElement("div");

    // @ts-ignore
    roller.style = `
    width: ${width}px;
    height: ${height}px;
    position: relative;
    transform-origin: 50% 50%;
    transform-style: preserve-3d;
    /**
     *  margin auto only works for horizontal alignment,
     * for vertical align we need to use top
     * and negative margin
     */
    top: 50%;
    margin:${-height / 2}px auto;`;

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

    for (let i = 0; i < svgs.length; i++) {
        let s = svgs[i];
        let imgSegHeight = s.viewBox.height / segsPerImage;

        for (let j = 0; j < segsPerImage; j++) {

            let seg = document.createElement("img");
            seg.setAttribute("width", String(width));
            seg.setAttribute("height", String(segHeight));

            let imgOffset = j * imgSegHeight;

            let svgView = s.url +
                `#svgView(viewBox(${s.viewBox.x}, 
                              ${s.viewBox.y + imgOffset}, 
                              ${s.viewBox.width}, 
                              ${imgSegHeight}))`;

            seg.setAttribute("src", svgView);
            console.log(svgView);

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

                /* border: 1px solid red;*/`;

            seg.style.transform = `rotateX(-${360 * (i * segsPerImage + j) / numSegs}deg) translateZ(${zTranslate}px)`;

            roller.appendChild(seg);
        }

    }
    return roller;
}