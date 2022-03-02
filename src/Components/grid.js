import { drawLine, drawLineArrow } from "./canvasComponents"
import { gridProps } from "./constants"

const grid = (ctx,
    colourMinor=gridProps.minorAxColour,
    colourSecMinor=gridProps.minorAxSecColour,
    colourMajor=gridProps.majorAxColour,
    colourVector=gridProps.vectorColour,
    transform=[1,0,0,1],
    vector={x:0,y:0}) => { // creating the grid
    let gridSize = gridProps.size
    let width = ctx.canvas.width
    let height = ctx.canvas.height    
    ctx.save()

    for (let i=-10*Math.max(height/2,width/2); i*gridSize<=0; i++) {
        let colour = i%5 ===0 ? colourMinor : colourSecMinor
        colour = i===0 ? colourMajor : colour
        let lineWidth = i%5===0 ? 1.2 : 0.35
        lineWidth = i===0 ? 2 : lineWidth

        // x gridlines
        drawLine(ctx, {x:-50*width,y:i*gridSize}, {x:50*width,y:i*gridSize}, colour, transform, lineWidth)
        drawLine(ctx, {x:-50*width,y:-i*gridSize}, {x:50*width,y:-i*gridSize}, colour,transform, lineWidth)
        // y gridlines
        drawLine(ctx, {y:-50*height,x:i*gridSize}, {y:50*height,x:i*gridSize}, colour,transform, lineWidth)
        drawLine(ctx, {y:-50*height,x:-i*gridSize}, {y:50*height,x:-i*gridSize}, colour,transform, lineWidth)
    }

    // draw the vector
    drawLineArrow(ctx, {x:0,y:0}, {x:vector.x*gridSize, y:vector.y*gridSize}, colourVector,transform)
    ctx.restore()
}

export {grid}