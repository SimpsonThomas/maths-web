import React, { useEffect, useRef, useState } from "react";
import './canvas.css'
import SettingsBox, {calculateAngleMatrix, calculateVectors, drawLine, drawLine3D, drawLineArrow, initaliseCanvas} from "../canvasComponents";

const Canvas3D = props => {
    const inherit = props.props


    // inheriting state values from App
    let state = inherit.state
    const [matrix, setMatrix] = state.matrix
    const [vector, setVector] = state.vector
    const [scaleAngle, setScaleAngle] = state.scaleAngle
    const [showEigen, setShowEigen] = state.eigen

    // creating local state values
    const [saveMatrix, setSaveMatrix] = useState()

    const smallCanvasRef = useRef(null)
    const mainCanvasRef = useRef(null)

    // basic props for the grid
    const gridProps = {
        size : 20, // size of grid squares
        startX: 15,
        startY: 15,
        majorAxColour: inherit.major, // default colours
        minorAxColour: inherit.minor, 
        backgroundColour: inherit.background,
        vectorColour: 'green'
    }

    const selection = inherit.selection // are we in the selection window?

    const eigenVector = (ctx, transform) => {
        const [, , eigenVec1, eigenVec2] = calculateVectors(transform)
    
        
        let width = ctx.canvas.width
        let height = ctx.canvas.height
    
        let gridSize = gridProps.size
        drawLineArrow(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*10, y:-eigenVec1[1]*gridSize*10}, 'blue', transform)
        drawLineArrow(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*10, y:-eigenVec2[1]*gridSize*10}, 'blue', transform)
        ctx.setTransform(1,0,0,1,width/2,height/2)
    }

    const grid = (ctx,
        colourMinor=gridProps.minorAxColour,
        colourMajor=gridProps.majorAxColour,
        colourVector=gridProps.vectorColour,
        transform=[1,0,0,1]) => { // creating the grid
        let gridSize = gridProps.size
        let width = ctx.canvas.width
        let height = ctx.canvas.height    
        ctx.save()

        for (let i=-10*Math.max(height/2,width/2); i*gridSize<=0; i++) {
            let colour = i%5 ===0 ? colourMinor : 'grey'
            colour = i===0 ? colourMajor : colour
            let lineWidth = i%5===0 ? 1.2 : 0.35
            lineWidth = i===0 ? 2 : lineWidth

            // x gridlines
            drawLine3D(ctx, {x:-50*width,y:i*gridSize,z:0}, {x:50*width,y:i*gridSize,z:0}, colour, transform, lineWidth)
            drawLine3D(ctx, {x:-50*width,y:-i*gridSize,z:0}, {x:50*width,y:-i*gridSize,z:0}, colour,transform, lineWidth)
            // y gridlines
            drawLine3D(ctx, {y:-50*height,x:i*gridSize,z:0}, {y:50*height,x:i*gridSize,z:0}, colour,transform, lineWidth)
            drawLine3D(ctx, {y:-50*height,x:-i*gridSize,z:2}, {y:50*height,x:-i*gridSize,z:2}, colour,transform, lineWidth)
        }

        // draw the vector
        //drawLine(ctx, {x:0,y:0}, {x:vector.x*gridSize, y:vector.y*gridSize}, colourVector,transform, 2)
        ctx.restore()
    }

    /*const detShape = (ctx, colour='red') => {
        ctx.fillStyle = colour
        ctx.fillRect(0,0,gridProps.size+1, gridProps.size+1)
    }*/

    const [windowSize, setWindowSize] = useState({ // resize the canvas when the window resizes via state
        width: undefined,
        height: undefined,
        oldSize: undefined,
    })

    useEffect( () => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
                oldSize: windowSize
            })
        }

        window.addEventListener('resize', handleResize)

        const smallCanvas = smallCanvasRef.current
        const smallContext = smallCanvas.getContext('3d')
        smallCanvas.style.width ='100%';
        smallCanvas.style.height='100%';
        smallCanvas.width  = smallCanvas.offsetWidth;
        smallCanvas.height = smallCanvas.offsetHeight;

        const mainCanvas = mainCanvasRef.current
        const mainContext = mainCanvas.getContext('2d')
        // max out height
        mainCanvas.style.width ='100%';
        mainCanvas.style.height='100%';
        // ...then set the internal size to match
        mainCanvas.width  = mainCanvas.offsetWidth;
        mainCanvas.height = mainCanvas.offsetHeight;

        let frameCount = 0
        let animationFrameId

        const animateMat = (context=mainContext, canvas=mainCanvas, transformMat=[1,0,0,1]) => {
            // animating the changes in the matrix

            // initialising the canvas
            initaliseCanvas(context, canvas, gridProps.backgroundColour)

            frameCount++

            let position = matrix.change
            let [newVal, oldVal] = [parseInt(matrix.new[position]), parseInt(matrix.old[position])]
            let change = newVal-oldVal

            let mat = [matrix.old[1],matrix.old[2],matrix.old[3],matrix.old[4]]

            mat[position-1] = parseInt(mat[position-1])+(change/5)*frameCount

            grid(context, gridProps.minorAxColour, gridProps.majorAxColour, 'green',mat)

            if (showEigen) eigenVector(context,mat)
            if (frameCount===5) {
                setMatrix({
                    old: matrix.old,
                    new:matrix.new,
                    change:'done'
                })
            }
            animationFrameId = window.requestAnimationFrame(() => {animateMat(context, canvas)})
        }

        const render = (
            context, 
            canvas, 
            mat=[1,0,0,1],
            backgroundColour=gridProps.backgroundColour, 
            gridColour={minor:gridProps.minorAxColour, major:gridProps.majorAxColour}, ) => {
                initaliseCanvas(context, canvas, backgroundColour)
                
                grid(context, gridColour.minor, gridColour.major, 'green',mat)
                if (showEigen) eigenVector(context,mat)
        }

        let [, , transform1, transform2, transform3, transform4] = calculateAngleMatrix(scaleAngle)
        let mat = !switchMat ? (
            (matrix.new[matrix.change] !=='') ? [matrix.new[1],matrix.new[2],matrix.new[3],matrix.new[4]] 
            : [matrix.old[1],matrix.old[2],matrix.old[3],matrix.old[4]] 
            )
            : [transform1, transform2, transform3, transform4]


        /*if ((matrix.change !== 'done' && matrix.new[matrix.change]!=='')) {
            animateMat(mainContext, mainCanvas)
        }
        else {
            render(mainContext, mainCanvas, mat)
        }

        render(smallContext, smallCanvas,saveMatrix, 'black', {minor:'white',major:'white'})*/

        grid(mainContext)
        
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    })

    const [switchMat, setSwitchMat] = useState(false)
    const [showHelp, setShowHelp] = useState(false)

    let settingsProps = {}
    settingsProps.matrix = [matrix, setMatrix]
    settingsProps.vector = [vector, setVector]
    settingsProps.scaleAngle = [scaleAngle, setScaleAngle]
    settingsProps.switchMat = [switchMat, setSwitchMat]
    settingsProps.eigen = [showEigen, setShowEigen]
    settingsProps.setSaveMatrix = setSaveMatrix
    settingsProps.type = 'main'

    const html = <>
        {!selection ? <SettingsBox {...settingsProps}/> : <></>}
        <canvas ref={mainCanvasRef} {...props}/>
        <div className={(saveMatrix) ? 'smallCanvas' : 'hideCanvas'}>
            <canvas ref={smallCanvasRef} {...props}/>
        </div>
      {showHelp ?
            <div className='help'>
                <h3>Grid view</h3>
                <p> Now you've played around with the basis vector view we can now look 
                    at the grid view</p>
                <p>Here you can see the whole set of grid lines</p>
                <p>And again adjust the whole grid via the matrix set or the sliders (by clicking the angle buttons you can quickly change to set angles)</p>
                <p>But you can also set a vector and see how it gets translated</p>
                <button className='hideHelp' onClick={e => {e.preventDefault(); setShowHelp(false)}}>
                    Hide
                </button>
            </div> 
        : <></>
      }
    </>

    return html
}

export default Canvas3D