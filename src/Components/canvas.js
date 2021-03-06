import React, { useEffect, useRef, useState } from "react";
import './canvas.css'
import SettingsBox, {calculateAngleMatrix, calculateVectors, drawLineArrow, initaliseCanvas} from "./canvasComponents";
import { grid } from "./grid";

const Canvas = props => {
    const inherit = props.props

    const selection = inherit.selection // are we in the selection window?

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
        size : selection ? 20 : 20*inherit.scroll, // size of grid squares
        majorAxColour: inherit.majorAxColour, // default colours
        minorAxColour: inherit.minorAxColour,
        minorAxSecColour: inherit.minorAxSecColour,
        backgroundColour: inherit.background,
        vectorColour: inherit.vectorColour,
        colourAxis: inherit.colourAxis,
    }

    const eigenVector = (ctx, transform) => {
        const [val1, val2, eigenVec1, eigenVec2] = calculateVectors(transform)
    
        
        let width = ctx.canvas.width
        let height = ctx.canvas.height
    
        let gridSize = gridProps.size
        
        if (val1) drawLineArrow(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*5, y:eigenVec1[1]*gridSize*5}, 'blue', transform)
        if (val2) drawLineArrow(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*5, y:eigenVec2[1]*gridSize*5}, 'blue', transform)
        ctx.setTransform(1,0,0,1,width/2,height/2)
    }

    useEffect(() => {
        if (showHelp || inherit.activityBox) {
            const inputs = document.querySelectorAll('fieldset')
            for (let i=0; i<inputs.length;i++) inputs[i].disabled = true
        }
        
        else  {
            const inputs = document.querySelectorAll('fieldset')
            for (let i=0; i<inputs.length;i++) inputs[i].disabled = false
        }
    })

    useEffect( () => {

        const smallCanvas = smallCanvasRef.current
        const smallContext = smallCanvas.getContext('2d')
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
        let frameMax = 10
        let animationFrameId

        const animateMat = (context=mainContext, canvas=mainCanvas, transformMat=[1,0,0,1],
            gridColour={minor:gridProps.minorAxColour, major:gridProps.majorAxColour, minorSec:gridProps.minorAxSecColour, vector:gridProps.vectorColour}) => {
            // animating the changes in the matrix

            // initialising the canvas
            initaliseCanvas(context, canvas, gridProps.backgroundColour)

            frameCount++

            let positionMat = matrix.change
            let [newVal, oldVal] = [parseFloat(matrix.new[positionMat]), parseFloat(matrix.old[positionMat])]
            let change = newVal-oldVal

            let mat = [matrix.old[1],matrix.old[2],matrix.old[3],matrix.old[4]]

            mat[positionMat-1] = parseFloat(mat[positionMat-1])+(change/frameMax)*frameCount

            /*let positionVec = vector.change
            let [newVec, oldVec] = [parseFloat(vector[positionVec]), parseFloat(vector.old[positionVec]) ]
            let changeVec = newVec-oldVec

            let vec = {'x':parseFloat(vector.old.x),'y':parseFloat(vector.old.y)}
            vec[positionVec] = oldVal+(changeVec/frameMax)*frameCount
            
            */
            grid(context, gridColour.minor, gridColour.minorSec, gridColour.major, gridColour.vector,mat,vector,true,gridProps.colourAxis,gridProps.size)
            
            if (showEigen) eigenVector(context,mat)
            if (frameCount===frameMax) {
                if (change !== 0) setMatrix({
                    old: matrix.old,
                    new:matrix.new,
                    change:'done'
                })
                //if (changeVec !== 0) setVector(prevVec => ( {...prevVec, 'old':{'x':prevVec.x, 'y':prevVec.y}, 'change':'done' } ))
            }
            animationFrameId = window.requestAnimationFrame(() => {animateMat(context, canvas)})
        }

        const render = (
            context, 
            canvas, 
            mat=[1,0,0,1],
            backgroundColour=gridProps.backgroundColour, 
            gridColour={minor:gridProps.minorAxColour, major:gridProps.majorAxColour, minorSec:gridProps.minorAxSecColour, vector:gridProps.vectorColour, colourAxis:gridProps.colourAxis}, ) => {
                initaliseCanvas(context, canvas, backgroundColour)
                
                grid(context, gridColour.minor, gridColour.minorSec, gridColour.major, gridColour.vector,mat,vector,true,gridColour.colourAxis,gridProps.size)
                if (showEigen) eigenVector(context,mat)
        }

        let [, , transform1, transform2, transform3, transform4] = calculateAngleMatrix(scaleAngle)
        let mat = !switchMat ? (
            (matrix.new[matrix.change] !=='') ? [matrix.new[1],matrix.new[2],matrix.new[3],matrix.new[4]] 
            : [matrix.old[1],matrix.old[2],matrix.old[3],matrix.old[4]] 
            )
            : [transform1, transform2, transform3, transform4]
        
        //let vec = vector[vector.change] !== '' ? {'x':vector.x, 'y':vector.y} : vector.old
        if ((matrix.change !== 'done' && matrix.new[matrix.change]!=='')) {
            animateMat(mainContext, mainCanvas)
        }
        else {
            render(mainContext, mainCanvas, mat)
        }

        render(smallContext, smallCanvas,saveMatrix, '#28282B', {minor:'#FFFEEE',major:'white', colourAxis:'orange'})
        
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    })

    const [switchMat, setSwitchMat] = useState(false)
    
    const helpSaveName = 'helpCanvas'
    let localStore = window.localStorage

    if (!localStore.getItem(helpSaveName)) localStore.setItem(helpSaveName, JSON.stringify(true))

    let initialHelp = JSON.parse( localStore.getItem(helpSaveName))

    const [showHelp, setShowHelp] = useState(initialHelp)

    useEffect(() => {
        window.localStorage.setItem(helpSaveName, JSON.stringify(showHelp))
    }, [showHelp, helpSaveName])

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
      {showHelp && !selection?
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