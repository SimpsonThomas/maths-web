import React, { useEffect, useRef } from "react";

const Canvas = props => {

    const gridProps = {
        size : 30,
        startX: 15,
        startY: 15,
        majorAxColour: 'white',
        minorAxColour: '#9a9ca1',
        backgroundColour: '#161617'
    }

    const canvasRef = useRef(null)

    const draw = (ctx, frameCount) => {
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(50,100,20*Math.sin(frameCount*0.05)**2,0,2*Math.PI)
        ctx.fill()
    }

    const drawLine = (ctx, start, end, colour) => {
        ctx.beginPath()
        ctx.strokeStyle = colour
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()
    }

    const grid = (ctx) => {
        let gridSize = gridProps.size        
        let width = ctx.canvas.width
        let height = ctx.canvas.height    

        for (let i=0; i*gridSize<=Math.max(height/2,width/2); i++) {
            let colour = i==0 ? gridProps.majorAxColour : gridProps.minorAxColour

            // x gridlines
            drawLine(ctx, {x:-width/2,y:i*gridSize}, {x:width/2,y:i*gridSize}, colour)
            drawLine(ctx, {x:-width/2,y:-i*gridSize}, {x:width/2,y:-i*gridSize}, colour)

            // y gridlines
            drawLine(ctx, {y:-height/2,x:i*gridSize}, {y:height/2,x:i*gridSize}, colour)
            drawLine(ctx, {y:-height/2,x:-i*gridSize}, {y:height/2,x:-i*gridSize}, colour)
        }
    }

    const offSetGrid = (ctx) => {
        const angle = Math.PI*1/4
        

        ctx.fillStyle = 'black'
        let gridSize = gridProps.size
        var startX = gridProps.startX
        let startY = gridProps.startY
        
        let width = ctx.canvas.width
        let height = ctx.canvas.height

        let linesX = Math.floor(height/gridSize)
        let linesY = Math.floor(width/gridSize)

        let X = {lines:linesX, startOther: startY, axis:'X'}
        let Y = {lines:linesY, startOther: startX, axis:'Y'}

        //ctx.translate(startY*gridSize, startX*gridSize)

        for (const j in [X,Y]) {
            let ax = [X,Y][j]
            for (let i =-100; i<=100*ax.lines; i++){
                ctx.beginPath()
                ctx.lineWidth=1;

                let start, end

                if (ax.axis == 'X') {
                    start ={x: 0, y: 2*gridSize*i+0.5}
                    end = {x:width, y:2*gridSize*i+0.5+width*Math.tan(angle)}
                } else {
                    start = {x:2*gridSize*i+0.5,y:0}
                    end = {x:2*gridSize*i+0.5-height*Math.tan(angle),y:height}
                }

                if (i== ax.startOther) {
                    ctx.strokeStyle = gridProps.majorAxColour
                }
                else ctx.strokeStyle = gridProps.minorAxColour
                
                ctx.moveTo(start.x, start.y)
                ctx.lineTo(end.x, end.y)
                ctx.stroke()
            }
        }
    } 

    useEffect( () => {
        
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        let frameCount = 0
        let animationFrameId

        
        context.translate(canvas.width/2, canvas.height/2)


        const render = () => {
            frameCount++
            context.clearRect(-canvas.width, -canvas.height,context.canvas.width,context.canvas.height)
            context.fillStyle = gridProps.backgroundColour
            context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)
            grid(context)
            //offSetGrid(context)
            //draw(context,frameCount)

            animationFrameId = window.requestAnimationFrame(render)
        }
        
        window.addEventListener('resize', render, false)
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }

    }, [])

    return <canvas ref={canvasRef} {...props}/>
}

export default Canvas