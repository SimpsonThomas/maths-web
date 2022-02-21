import React, { useEffect, useRef, useState } from "react";
import { isCompositeComponentWithType } from "react-dom/cjs/react-dom-test-utils.production.min";
import './canvas.css'
import SettingsBox, {calculateAngleMatrix, calculateVectors, drawLine, drawLineArrow} from "./canvasComponents";

const Canvas = props => {
    const inherit = props.props
    // creating state items 
    const [matrix, setMatrix] = useState({'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'})
    const [vector, setVector] = useState({'x':0, 'y':0})
    const [angle, setAngle] = useState({'x':0, 'y':0})
    const [scale, setScale] = useState({'x':1,'y':1})
    const [showEigen, setShowEigen] = useState(false)

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

    const selection = inherit.selection

    const eigenVector = (ctx, transform) => {
        const [, , eigenVec1, eigenVec2] = calculateVectors(transform)
    
        
        let width = ctx.canvas.width
        let height = ctx.canvas.height
    
        let gridSize = gridProps.size
        drawLineArrow(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*10, y:-eigenVec1[1]*gridSize*10}, 'blue', transform)
        //drawLine(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*10, y:-eigenVec1[1]*gridSize*10}, 'yellow')
        drawLineArrow(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*10, y:-eigenVec2[1]*gridSize*10}, 'blue', transform)
        //drawLine(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*10, y:-eigenVec2[1]*gridSize*10}, 'yellow')
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
            drawLine(ctx, {x:-50*width,y:i*gridSize}, {x:50*width,y:i*gridSize}, colour, transform, lineWidth)
            drawLine(ctx, {x:-50*width,y:-i*gridSize}, {x:50*width,y:-i*gridSize}, colour,transform, lineWidth)

            // y gridlines
            drawLine(ctx, {y:-50*height,x:i*gridSize}, {y:50*height,x:i*gridSize}, colour,transform, lineWidth)
            drawLine(ctx, {y:-50*height,x:-i*gridSize}, {y:50*height,x:-i*gridSize}, colour,transform, lineWidth)
        }

        drawLine(ctx, {x:0,y:0}, {x:vector.x*gridSize, y:vector.y*gridSize}, colourVector,transform, 2)
        ctx.restore()
    }

    /*const detShape = (ctx, colour='red') => {
        ctx.fillStyle = colour
        ctx.fillRect(0,0,gridProps.size+1, gridProps.size+1)
    }*/

    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
        oldSize: undefined,
    })

    useEffect( () => {
        //console.log(matrix)
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
                oldSize: windowSize
            })
        }

        window.addEventListener('resize', handleResize)

        const smallCanvas = smallCanvasRef.current
        const smallContext = smallCanvas.getContext('2d')

        const mainCanvas = mainCanvasRef.current
        const mainContext = mainCanvas.getContext('2d')

        
        smallCanvas.style.width ='100%';
        smallCanvas.style.height='100%';

        mainCanvas.style.width ='100%';
        mainCanvas.style.height='100%';
        // ...then set the internal size to match
        smallCanvas.width  = smallCanvas.offsetWidth;
        smallCanvas.height = smallCanvas.offsetHeight;
        mainCanvas.width  = mainCanvas.offsetWidth;
        mainCanvas.height = mainCanvas.offsetHeight;

        let frameCount = 0
        let animationFrameId

        const animate = (context=mainContext, canvas=mainCanvas, transformMat=[1,0,0,1]) => {
            context.setTransform(1,0,0,-1,canvas.width/2, canvas.height/2)
            
            context.clearRect(-canvas.width, -canvas.height,context.canvas.width,context.canvas.height)
            context.fillStyle = gridProps.backgroundColour
            context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)

            frameCount++
            let position = matrix.change
            let [newVal, oldVal] = [parseInt(matrix.new[position]), parseInt(matrix.old[position])]
            let change = newVal-oldVal
            let mat = [matrix.old[1],matrix.old[2],matrix.old[3],matrix.old[4]]
            mat[position-1] = parseInt(mat[position-1])+(change/5)*frameCount
            grid(context, gridProps.minorAxColour, gridProps.majorAxColour, 'green',mat)
            //if (showEigen) eigenVector(context,mat)
            
            if (frameCount===5) {
                setMatrix({
                    old: matrix.old,
                    new:matrix.new,
                    change:'done'
                })
            }
            animationFrameId = window.requestAnimationFrame(() => {animate(context, canvas)})
        }

        const render = (
            context, 
            canvas, 
            mat=[1,0,0,1],
            backgroundColour=gridProps.backgroundColour, 
            gridColour={minor:gridProps.minorAxColour, major:gridProps.majorAxColour}, ) => {
                context.setTransform(1,0,0,-1,canvas.width/2, canvas.height/2)
                context.clearRect(-canvas.width, -canvas.height,context.canvas.width,context.canvas.height)
                context.fillStyle = backgroundColour
                context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)
                
                grid(context, gridColour.minor, gridColour.major, 'green',mat)
        }

        let [, , transform1, transform2, transform3, transform4] = calculateAngleMatrix(angle,scale)
        let mat = !switchMat ? (
            (matrix.new[matrix.change] !=='') ? [matrix.new[1],matrix.new[2],matrix.new[3],matrix.new[4]] 
            : [matrix.old[1],matrix.old[2],matrix.old[3],matrix.old[4]] 
            )
            : [transform1, transform2, transform3, transform4]


        if ((matrix.change !== 'done' && matrix.new[matrix.change]!=='')) {
            animate(mainContext, mainCanvas)
            
        }
        else {
            render(mainContext, mainCanvas, mat)
        }

        render(smallContext, smallCanvas,saveMatrix, 'black', {minor:'white',major:'white'})
        
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
    settingsProps.angle = [angle, setAngle]
    settingsProps.scale = [scale, setScale]
    settingsProps.switchMat = [switchMat, setSwitchMat]
    settingsProps.eigen = [showEigen, setShowEigen]
    settingsProps.setSaveMatrix = setSaveMatrix

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

export default Canvas