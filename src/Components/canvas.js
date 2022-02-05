import React, { useEffect, useRef, useState } from "react";
import './canvas.css'

const Canvas = props => {
    // creating state items 
    const [matrix, setMatrix] = useState({1:2,2:2,3:-1,4:1})
    const [vector, setVector] = useState({'x':0, 'y':0})

    const canvasRef = useRef(null)

    // basic props for the grid
    const gridProps = {
        size : 30, // size of grid squares
        startX: 15,
        startY: 15,
        majorAxColour: 'white', // default colours
        minorAxColour: '#9a9ca1', 
        backgroundColour: '#161617',
        vectorColour: 'green'
    }

    const draw = (ctx, frameCount) => { // animated bubble thing
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(50,100,20*Math.sin(frameCount*0.05)**2,0,2*Math.PI)
        ctx.fill()
    }

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

        for (let i=-10; i*gridSize<=2*Math.max(height/2,width/2); i++) {
            let colour = i===0 ? colourMajor : colourMinor

            // x gridlines
            drawLine(ctx, {x:-width/2,y:i*gridSize}, {x:width/2,y:i*gridSize}, colour, transform)
            drawLine(ctx, {x:-width,y:-i*gridSize}, {x:width,y:-i*gridSize}, colour,transform)

            // y gridlines
            drawLine(ctx, {y:-2*height,x:i*gridSize}, {y:2*height,x:i*gridSize}, colour,transform)
            drawLine(ctx, {y:-2*height,x:-i*gridSize}, {y:2*height,x:-i*gridSize}, colour,transform)
        }

        drawLine(ctx, {x:0,y:0}, {x:vector.x*gridSize, y:vector.y*gridSize}, colourVector,transform)
    }

    const shiftGrid = (ctx) => {
        //let gridSize = gridProps.size
        let width = ctx.canvas.width
        let height = ctx.canvas.height 
        grid(ctx,'red', 'blue', 'green',[matrix[1],matrix[2],matrix[3],matrix[4]])
        ctx.setTransform(matrix[1],matrix[2],matrix[3],matrix[4],width/2,height/2)
        detShape(ctx, 'yellow')
        ctx.setTransform(1,0,0,1,width/2,height/2)
    }

    const detShape = (ctx, colour='red') => {
        ctx.fillStyle = colour
        ctx.fillRect(0,0,gridProps.size+1, gridProps.size+1)
    }

    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    })

    useEffect( () => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
            console.log(windowSize)
        }

        window.addEventListener('resize', handleResize)

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        let frameCount = 0
        let animationFrameId

        const render = () => {
            context.setTransform(1,0,0,-1,canvas.width/2, canvas.height/2)
            frameCount++
            context.clearRect(-canvas.width, -canvas.height,context.canvas.width,context.canvas.height)
            context.fillStyle = gridProps.backgroundColour
            context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)
            grid(context)
            detShape(context, 'blue')
            shiftGrid(context)
            draw(context,frameCount)

            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    })

    const [collapse, setCollapse] = useState(false)

    const html = <>
        <div className={'matrixBox ' + (collapse ? 'boxOpen' : 'boxClosed')}>
            <p className='boxTitle'>
                Settings
            </p>
            <div className={'settings ' + (collapse ? 'settingsOpen' : 'settingsClosed')}>
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

                <p className='boxTitle'>Vector Input</p>
                <p><input className='matrixInput' value={vector.x} 
                        onChange={e => setVector({'x':e.target.value,'y':vector.y})}/></p>
                <p><input className='matrixInput' value={vector.y} 
                        onChange={e => setVector({'y':e.target.value,'x':vector.x})}/></p>
                <p>&nbsp;</p>
            </div>
            <button className='collapseButton' onClick={e => {e.preventDefault(); setCollapse(!collapse)}}>
                {!collapse ? '+' : '-' }
            </button>
        </div>
        <canvas ref={canvasRef} {...props}/>
    </>

    return html
}

export default Canvas