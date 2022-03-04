import React, { useEffect, useRef, useState } from "react";
import './canvas.css'
import SettingsBox, { calculateAngleMatrix, drawLineArrow, initaliseCanvas } from "./canvasComponents";

const Basic = props => {
    const inherit = props.props

    // creating state items 
    let state = inherit.state
    const [matrix, setMatrix] = state.matrix
    const [vector, setVector] = state.vector
    const [scaleAngle, setScaleAngle] = state.scaleAngle
    const [showEigen, setShowEigen] = state.eigen

    const canvasRef = useRef(null)

    // basic props for the grid
    const gridProps = {
        size : 100, // size of grid squares
        majorAxColour: inherit.majorAxColour, // default colours
        minorAxColour: inherit.minorAxColour, 
        backgroundColour: inherit.backgroundColour,
    }

    const selection = inherit.selection

    const grid = (ctx,
        colour=gridProps.majorAxColour,
        transform=[1,0,0,1]) => { // creating the grid
        let gridSize = gridProps.size 

        drawLineArrow(ctx, {x:0,y:0}, {x:gridSize, y:0},colour, transform, 'x')
        drawLineArrow(ctx, {x:0,y:0}, {y:gridSize, x:0},colour, transform, 'y')
    }

    const [windowSize, setWindowSize] = useState({
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

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        let animationFrameId

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
        
        render(context, canvas, mat)

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
                <h3>Welcome to the Linear Algebra Web app</h3>
                <p>
                    This is a site to help show some of the visualisations of linear algebra.
                </p>
                <p>We will start off simply - you can change the matrix in the corner to move the basis vectors</p>

                <p>Or switch to changing the angle and scale to move them instead</p>

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
