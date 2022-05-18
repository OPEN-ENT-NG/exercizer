/* 
In Exercizer, <placed-block> positions that are stored in the database, 
are the coordinates of the upper-left corner of the block (in pixels), 
when placed on a 760x600 pixels background image.
That is, the origin (x=0 and y=0) is the upper-left corner of the background image.

When rendered on-screen, the background image may be resized for responsive purposes.
=> The following methods are used to convert the values from the DB to the screen coordinates.

Computing the onscreen upper-left coordinate of a block may not be accurate if the background image is resized,
since the block may not follow the same homothety (magnification or reduction).
To address this problem, the algorithm below translates the coordinates to the "center" of the block.
*/

import { setTimeout } from "core-js";
import { ui } from "entcore";

// Compute X coordinate for text blocks
export function getResizedTextZoneX(selector: string, x: number, reverseTransform: boolean): number {
    // Model and view offsets of the center of the block.
    const offsets = [80,75];
    const idxFrom = reverseTransform!=true ? 0 : 1;
    return transformX(selector, x+offsets[idxFrom], reverseTransform) - offsets[(idxFrom+1)%2];
};
// Compute Y coordinate for text blocks
export function getResizedTextZoneY(selector: string, y: number, reverseTransform: boolean): number {
    // Model and view offsets of the center of the block.
    //const offsets = [20,20];
    //const idxFrom = reverseTransform!=true ? 0 : 1;
    return transformY(selector, y+20, reverseTransform) - 20;
};

// Compute X coordinate for image blocks (squares, 70x70 or 100x100 pixels)
export function getResizedIconZoneX(selector: string, x: number, reverseTransform: boolean): number {
    // Model and view offsets of the center of the block, depending on the CSS breakpoints.
    const offsets = ui.breakpoints.checkMaxWidth("wideScreen") ? [50,35] : [50,50];
    const idxFrom = reverseTransform!=true ? 0 : 1;
    return transformX(selector, x+offsets[idxFrom], reverseTransform) - offsets[(idxFrom+1)%2];
};
// Compute Y coordinate for image blocks (squares, 70x70 or 100x100 pixels)
export function getResizedIconZoneY(selector: string, y: number, reverseTransform: boolean): number {
    // Model and view offsets of the center of the block, depending on the CSS breakpoints.
    const offsets = ui.breakpoints.checkMaxWidth("wideScreen") ? [50,35] : [50,50];
    const idxFrom = reverseTransform!=true ? 0 : 1;
    return transformY(selector, y+offsets[idxFrom], reverseTransform) - offsets[(idxFrom+1)%2];
};

/** 
 * Preloads the src of an <img> element.
 * Once loaded, its naturalWidth and naturalHeight will be available - even in the source element. 
 */
export function preloadImage( selector: string ):Promise<{w:number, h:number, vw:number, vh:number}> {
    return new Promise( (resolve, reject) => {
        // Create a pseudo img outside of the DOM, and load the source image.
        // 
        setTimeout( function() {
            try {
                const viewport = $(selector);
                $("<img>").attr("src", viewport.attr("src"))
                .on( 'load', function() {
                    //console.log( `loaded : ${this.width} x ${this.height}` );
                    resolve( {w: this.width, h: this.height, vw: viewport.width(), vh: viewport.height()} );
                });
            } catch(e) {
                reject( e );
            }
        }, 300 );
    });
}

function computeMarginsForImgToFitViewport( imgWidth, imgHeight, viewWidth, viewHeight ):{bt:number, lr:number} {
    if( imgWidth==0 || imgHeight==0 || viewHeight==0 )
        return {bt:0, lr:0};

    const ratio = imgWidth / imgHeight;
    if( ratio > viewWidth/viewHeight ) {
        // image is flatter than viewport => top and bottom margins will fill the gap.
        return {
            bt: Math.round( (viewHeight - (viewWidth * imgHeight/imgWidth)) / 2 ),
            lr: 0
        }
    } else {
        // image is thinner than viewport => left and right margins will fill the gap.
        return {
            bt: 0,
            lr: Math.round( (viewWidth - (viewHeight * imgWidth/imgHeight)) / 2 )
        }
    }
}

export function transformX(selector: string, x: number, reverseTransform: boolean): number {
    const $img = $(selector);
    const img = $img[0] as HTMLImageElement;
    const width = $img.width() || 0;
    const height = $img.height() || 0;

//    console.log( `img="${img}", width=${width}, naturalWidth=${img.naturalWidth}, naturalHeight=${img.naturalHeight}` );

    if(width == 0)
        return null;
    
    // Compute margins when img is rendered without deformation.
    const margins = computeMarginsForImgToFitViewport( img.naturalWidth, img.naturalHeight, width, height );
    return Math.round( reverseTransform!=true ? (x * width/760) + margins.lr : (x - margins.lr) * 760/width );
}

export function transformY(selector: string, y: number, reverseTransform: boolean): number {
    const $img = $(selector);
    const img = $img[0] as HTMLImageElement;
    const width = $img.width() || 0;
    const height = $img.height() || 0;

//    console.log( `img="${img}", width=${width}, naturalWidth=${img.naturalWidth}, naturalHeight=${img.naturalHeight}` );

    if(height == 0)
        return null;
    
    // Compute margins when img is rendered without deformation.
    const margins = computeMarginsForImgToFitViewport( img.naturalWidth, img.naturalHeight, width, height );
    return Math.round( reverseTransform!=true ? (y * height/600) + margins.bt : (y - margins.bt) * 600/height );
}

//TODO apply offsets + margins ?
export function transformW(selector: string, w: number, reverseTransform: boolean): number
{
    let img = $(selector);
    let width = img.width();

    if(width == 0)
        return null;

    let trans;
    if(reverseTransform != true)
        trans = w * (width / 760);
    else
        trans = w / (width / 760);
    return Math.round(trans);
}