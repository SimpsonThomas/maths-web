import React, { useEffect, useRef, useState } from "react";
import './canvas.css'

const Canvas = props => {
    // creating state items 
    const [matrix, setMatrix] = useState({1:1,2:0,3:0,4:1})
    const [vector, setVector] = useState({'x':0, 'y':0})
    const [angle, setAngle] = useState({'x':0, 'y':0})
    const [scale, setScale] = useState({'x':1,'y':1})

    const canvasRef = useRef(null)

    // basic props for the grid
    const gridProps = {
        size : 30, // size of grid squares
        startX: 15,
        startY: 15,
        majorAxColour: 'blue', // default colours
        minorAxColour: 'white', 
        backgroundColour: '#161617',
        vectorColour: 'green'
    }

    /*const draw = (ctx, frameCount) => { // animated bubble thing
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(50,100,20*Math.sin(frameCount*0.05)**2,0,2*Math.PI)
        ctx.fill()
    }*/

    const drawLine = (ctx, start, end, colour, transform=[1,0,0,1]) => { // drawing a line
        //let width = ctx.canvas.width
        //let height = ctx.canvas.height 
        ctx.beginPath()
        ctx.strokeStyle = colour
        ctx.save()
        ctx.transform(transform[0],transform[1],transform[2],transform[3],0,0)
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.restore()
        ctx.stroke()
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

        for (let i=-1000; i*gridSize<=100*Math.max(height/2,width/2); i++) {
            let colour = i===0 ? colourMajor : colourMinor

            // x gridlines
            drawLine(ctx, {x:-50*width,y:i*gridSize}, {x:50*width,y:i*gridSize}, colour, transform)
            drawLine(ctx, {x:-50*width,y:-i*gridSize}, {x:50*width,y:-i*gridSize}, colour,transform)

            // y gridlines
            drawLine(ctx, {y:-50*height,x:i*gridSize}, {y:50*height,x:i*gridSize}, colour,transform)
            drawLine(ctx, {y:-50*height,x:-i*gridSize}, {y:50*height,x:-i*gridSize}, colour,transform)
        }

        ctx.lineWidth = 2
        drawLine(ctx, {x:0,y:0}, {x:vector.x*gridSize, y:vector.y*gridSize}, colourVector,transform)
        ctx.restore()
    }

    const shiftGrid = (ctx) => {
        //let gridSize = gridProps.size
        let width = ctx.canvas.width
        let height = ctx.canvas.height 
        let angleRadX = 2*Math.PI*angle.x/360
        let angleRadY = 2*Math.PI*angle.y/360
        let transform1 = Math.cos(angleRadX)*scale.x
        let transform2 = -Math.sin(angleRadX)*scale.x
        let transform3 = Math.sin(angleRadY)*scale.y
        let transform4 = Math.cos(angleRadY)*scale.y

        if (!switchMat) grid(ctx,gridProps.minorAxColour, gridProps.majorAxColour, 'green',[matrix[1],matrix[2],matrix[3],matrix[4]])
        //ctx.setTransform(matrix[1],matrix[2],matrix[3],matrix[4],width/2,height/2)

        if (switchMat) grid(ctx,gridProps.minorAxColour, gridProps.majorAxColour, 'green',[transform1,transform2,transform3,transform4])
        ctx.setTransform(1,0,0,1,width/2,height/2)
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

        //let frameCount = 0
        let animationFrameId

        const render = () => {
            context.setTransform(1,0,0,-1,canvas.width/2, canvas.height/2)
            //frameCount++
            context.clearRect(-canvas.width, -canvas.height,context.canvas.width,context.canvas.height)
            context.fillStyle = gridProps.backgroundColour
            context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)
            //grid(context)
            shiftGrid(context)
            //draw(context,frameCount)

            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    })

    const [collapse, ] = useState(true) // set to true for testing purposes
    //const [showSlide, setShowSlide] = useState(false)

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

                <p className='boxTitle'>Vector Input</p>
                <p><input className='matrixInput' value={vector.x} 
                        onChange={e => setVector({'x':e.target.value,'y':vector.y})}/></p>
                <p><input className='matrixInput' value={vector.y} 
                        onChange={e => setVector({'y':e.target.value,'x':vector.x})}/></p>
                <p>&nbsp;</p>
            </div>
            {/*<button className='collapseButton' onClick={e => {e.preventDefault(); setCollapse(!collapse)}}>
                {!collapse ? '+' : '-' }
            </button>*/}
        </div>
        <canvas ref={canvasRef} {...props}/>

        
      {showHelp ?
            <div className='help'>
                <h3>Grid view</h3>
                <p> Now you've played around with the basis vector view we can now look 
                    at the grid view</p>
                <p>Here you can see the whole set of grid lines</p>
                <p>And again adjust the whole grid via the matrix set or the sliders</p>
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
