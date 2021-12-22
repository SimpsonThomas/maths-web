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

    const grid = (ctx) => {
        ctx.fillStyle = 'black'

        //ctx.drawRect(0,0)
        let gridSize = gridProps.size
        var startX = gridProps.startX
        let startY = gridProps.startY

        
        let width = ctx.canvas.width
        let height = ctx.canvas.height

        let linesX = Math.floor(height/gridSize)
        let linesY = Math.floor(width/gridSize)

        let X = {lines:linesX, startOther: startY, axis:'X'}
        let Y = {lines:linesY, startOther: startX, axis:'Y'}

        for (const j in [X,Y]) {
            let ax = [X,Y][j]
            for (let i =-100; i<=100*ax.lines; i++){
                ctx.beginPath()
                ctx.lineWidth=1;

                let start, end

                if (ax.axis == 'X') {
                    start ={x: 0, y: gridSize*i+0.5}
                    end = {x:width, y:gridSize*i+0.5}
                } else {
                    start = {x:gridSize*i+0.5,y:0}
                    end = {x:gridSize*i+0.5,y:height}
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


        const render = () => {
            frameCount++
            context.clearRect(0,0,context.canvas.width,context.canvas.height)
            context.fillStyle = gridProps.backgroundColour
            context.fillRect(0, 0, canvas.width+1, canvas.height+1)
            grid(context)
            offSetGrid(context)
            draw(context,frameCount)

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