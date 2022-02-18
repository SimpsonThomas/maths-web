import React, { useEffect, useRef, useState } from "react";
import './canvas.css'
import { drawLineArrow } from "./canvasComponents";

const Basic = props => {
    const inherit = props.props
    // creating state items 
    const [matrix, setMatrix] = useState({1:1,2:0,3:0,4:1})
    const [angle, setAngle] = useState({'x':0, 'y':0})
    const [scale, setScale] = useState({'x':1,'y':1})

    const canvasRef = useRef(null)

    // basic props for the grid
    const gridProps = {
        size : 100, // size of grid squares
        startX: 15,
        startY: 15,
        majorAxColour: inherit.major, // default colours
        minorAxColour: inherit.minor, 
        backgroundColour: inherit.background,
    }

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

        const render = () => {
            context.setTransform(1,0,0,-1,canvas.width/2, canvas.height/2)
            context.clearRect(-canvas.width, -canvas.height,context.canvas.width,context.canvas.height)
            context.fillStyle = gridProps.backgroundColour
            context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)

            let angleRadX = 2*Math.PI*angle.x/360
            let angleRadY = 2*Math.PI*angle.y/360
            let transform1 = Math.cos(angleRadX)*scale.x
            let transform2 = -Math.sin(angleRadX)*scale.x
            let transform3 = Math.sin(angleRadY)*scale.y
            let transform4 = Math.cos(angleRadY)*scale.y

            let mat = !switchMat ? [matrix[1],matrix[2],matrix[3],matrix[4]] 
                : [transform1, transform2, transform3, transform4] 

            grid(context, gridProps.majorAxColour,mat)

            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    })

    //const [collapse, setCollapse] = useState(true) // set to true for testing purposes
    //const [showSlide, setShowSlide] = useState(false)
    let collapse = true
    const [switchMat, setSwitchMat] = useState(false)

    const [showHelp, setShowHelp] = useState(true)

    let angleRadX = 2*Math.PI*angle.x/360
    let angleRadY = 2*Math.PI*angle.y/360
    let transform1 = Math.cos(angleRadX)*scale.x
    let transform2 = -Math.sin(angleRadX)*scale.x
    let transform3 = Math.sin(angleRadY)*scale.y
    let transform4 = Math.cos(angleRadY)*scale.y

    const html = <>
        <div className={'matrixBox ' + (collapse ? 'boxOpen' : 'boxClosed')}>
            <p className='boxTitle'>
                Settings
            </p>
            <div className={'settings ' + (collapse ? 'settingsOpen' : 'settingsClosed')}>
                <label className="switch">
                    <input type="checkbox" checked={switchMat}
                        onChange={e=> setSwitchMat(e.target.checked)}/>
                    <span className="sliderToggle round"></span>
                </label>
                <div style={{display : !switchMat ? '' : 'none'}}s>
                    <p className='boxTitle'>Set Matrix</p>
                    <p>
                        <input className='matrixInput' value={matrix[1]} 
                            onChange={e => setMatrix({1:e.target.value,2:matrix[2], 3:matrix[3], 4:matrix[4]})}/>
                        <input className='matrixInput' value={matrix[2]}
                            onChange={e => setMatrix({1:matrix[1],2:e.target.value, 3:matrix[3], 4:matrix[4]})}/>
                    </p>
                    <input className='matrixInput' value={matrix[3]} 
                        onChange={e => setMatrix({1:matrix[1],2:matrix[2], 3:e.target.value, 4:matrix[4]})}/>
                    <input className='matrixInput' value={matrix[4]} 
                        onChange={e => setMatrix({1:matrix[1],2:matrix[2], 3:matrix[3], 4:e.target.value})}/>
                    <p>&nbsp;</p>
                </div>
                <div style={{display : switchMat ? '' : 'none'}} >
                    <p className='boxTitle'>Matrix</p>
                    <p className='matrixDisplay'>
                        {Math.round(transform1*100)/100} &nbsp; &nbsp; &nbsp; {Math.round(transform2*100)/100}
                    </p>
                    <p className='matrixDisplay'>
                        {Math.round(transform3*100)/100} &nbsp; &nbsp; &nbsp; {Math.round(transform4*100)/100}
                    </p>
                    <p>
                        <p className='boxTitle'>Angle X: &nbsp; &nbsp; {angle.x}</p>
                        <input type="range" min="-180" max="180" value={angle.x} className="slider" id="myRange" onChange={e => setAngle({'x':e.target.value,'y':angle.y})}/>
                    </p>
                    
                    <p className='boxTitle'>
                        <p>Angle Y: &nbsp; &nbsp; {angle.y}</p>
                        <input type="range" min="-180" max="180" value={angle.y} className="slider" id="myRange" onChange={e => setAngle({'y':e.target.value,'x':angle.x})}/>
                    </p>
                    <p className='boxTitle'>
                        <p>Scale X: &nbsp; &nbsp; {scale.x}</p>
                        <input type="range" min="-10" max="10" value={scale.x} className="slider" id="myRange" onChange={e => setScale({'x':e.target.value,'y':scale.y})}/>
                    </p>
                    <p className='boxTitle'>
                        <p>Scale Y: &nbsp; &nbsp; <span className='sliderDisplay'>{scale.y}</span></p>
                        <input type="range" min="-10" max="10" value={scale.y} className="slider" id="myRange" onChange={e => setScale({'y':e.target.value,'x':scale.x})}/>
                    </p>
                </div>
            </div>
        </div>
        <canvas ref={canvasRef} {...props}/>

        
      {showHelp ?
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
