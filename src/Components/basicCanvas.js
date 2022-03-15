import React, { useEffect, useRef, useState } from "react";
import './canvas.css'
import SettingsBox, { calculateAngleMatrix, drawLineArrow, initaliseCanvas } from "./canvasComponents";

const Basic = props => {
    const inherit = props.props
    const selection = inherit.selection

    // creating state items 
    let state = inherit.state
    const [matrix, setMatrix] = state.matrix
    const [vector, setVector] = state.vector
    const [scaleAngle, setScaleAngle] = state.scaleAngle
    const [showEigen, setShowEigen] = state.eigen

    const canvasRef = useRef(null)

    // basic props for the grid
    const gridProps = {
        size : selection ? 100 : 100*inherit.scroll, // size of grid squares
        majorAxColour: inherit.majorAxColour, // default colours
        minorAxColour: inherit.minorAxColour, 
        backgroundColour: inherit.backgroundColour,
    }

    const grid = (ctx,
        colour=gridProps.majorAxColour,
        transform=[1,0,0,1]) => { // creating the grid
        let gridSize = gridProps.size

        drawLineArrow(ctx, {x:0,y:0}, {x:gridSize, y:0},colour, transform, 'x')
        drawLineArrow(ctx, {x:0,y:0}, {y:gridSize, x:0},colour, transform, 'y')
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
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        let animationFrameId

        let frameCount = 0
        let frameMax = 10

        const animateMat = (context, canvas, transformMat=[1,0,0,1],
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
            grid(context, gridColour.major, mat)
            
            if (frameCount===frameMax) {
                if (change !== 0) setMatrix({
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
                grid(context, gridColour.major,mat)
        }

        let [, , transform1, transform2, transform3, transform4] = calculateAngleMatrix(scaleAngle)
        let mat = !switchMat ? (
            (matrix.new[matrix.change] !=='') ? [matrix.new[1],matrix.new[2],matrix.new[3],matrix.new[4]] 
            : [matrix.old[1],matrix.old[2],matrix.old[3],matrix.old[4]] 
            )
            : [transform1, transform2, transform3, transform4]
        
        if ((matrix.change !== 'done' && matrix.new[matrix.change]!=='')) {
            animateMat(context, canvas)
        }
        else {
            render(context, canvas, mat)
        }

        //render(context, canvas, mat)

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    })

    //const [showSlide, setShowSlide] = useState(false)
    const [switchMat, setSwitchMat] = useState(false)

    let helpSaveName = 'helpBasic'
    let localStore = window.localStorage

    if (!localStore.getItem(helpSaveName)) localStore.setItem(helpSaveName, JSON.stringify(true))

    let initialHelp = JSON.parse( localStore.getItem(helpSaveName))

    const [showHelp, setShowHelp] = useState(initialHelp)

    useEffect(() => {
        window.localStorage.setItem(helpSaveName, JSON.stringify(showHelp))
    }, [showHelp,helpSaveName])

    let settingsProps = {}
    settingsProps.matrix = [matrix, setMatrix]
    settingsProps.vector = [vector, setVector]
    settingsProps.scaleAngle = [scaleAngle, setScaleAngle]
    settingsProps.switchMat = [switchMat, setSwitchMat]
    settingsProps.eigen = [showEigen, setShowEigen]
    settingsProps.setSaveMatrix = null
    settingsProps.type = 'basic'
    const html = <>
        {!selection ? <SettingsBox {...settingsProps}/>
        : <></>
        }
        <canvas ref={canvasRef} {...props}/>
        
      {(showHelp && !selection) ?
            <div className='help'>
                <h3>Welcome!</h3>
                <p>
                    This is a site to help you visualise some of the linear algebra you've been learning
                </p>
                <p></p>
                <p>We will start off simply - you can change the matrix in the corner to move the x and y vectors</p>

                <p>Or use the toggle switch to change the angle and scale of the vectors instead</p>

                <p>Once you're done click the next button in the top right to move onto the next activity</p>
                <button className='hideHelp' onClick={e => {e.preventDefault(); setShowHelp(false)}}>
                    Hide
                </button>
            </div> 
        : <></>
      }
    </>

    return html
}

export default Basic
