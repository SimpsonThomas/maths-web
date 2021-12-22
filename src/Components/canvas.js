import React, { useEffect, useRef } from "react";

const Canvas = props => {

    const canvasRef = useRef(null)

    const draw = (ctx, frameCount) => {
        ctx.fillStyle = 'green'
        ctx.beginPath()
        ctx.arc(50,100,20*Math.sin(frameCount*0.05)**2,0,2*Math.PI)
        ctx.fill()
    }

    const grid = (ctx) => {
        ctx.fillStyle = 'black'

        //ctx.drawRect(0,0)
        let gridSize = 40
        var startX = 10
        let startY = 10

        let ticksX = {number: 2, suffix: '\u03a0'}
        let ticksY = {number: 1, suffix: ''}

        
        let width = ctx.canvas.width
        let height = ctx.canvas.height

        let linesX = Math.floor(height/gridSize)
        let linesY = Math.floor(width/gridSize)

        let X = {lines:linesX, startOther: startY, ticks: ticksX, axis:'X'}
        let Y = {lines:linesY, startOther: startX, ticks: ticksY, axis:'Y'}

        for (const i in [X,Y]) {
            let ax = [X,Y][i]
            for (let i =0; i<=ax.lines; i++){
                console.log(i)
                ctx.beginPath()
                ctx.lineWidth=1;

                if (i== ax.startOther) ctx.strokeStyle = 'blue'
                else ctx.strokeStyle = 'red'
                
                if (ax.axis === 'X') {
                    if (i==ax.lines) {
                        ctx.moveTo(0,gridSize*i)
                        ctx.lineTo(width, gridSize*i)
                    } else {
                        ctx.moveTo(0,gridSize*i+0.5)
                        ctx.lineTo(width, gridSize*i+0.5)
                    }
                } else {
                    if (i==ax.lines) {
                        ctx.moveTo(gridSize*i,0)
                        ctx.lineTo(gridSize*i,width)
                    } else {
                        ctx.moveTo(gridSize*i+0.5,0)
                        ctx.lineTo(gridSize*i+0.5,width)
                    }
                }
                ctx.stroke()
            }
        }

        ctx.translate(startY*gridSize, startX*gridSize)

        for (let i=1; i<linesY; i++) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black'

            ctx.moveTo(gridSize*i+0.5, -3)
            ctx.lineTo(gridSize*i+0.5, 3)
            ctx.stroke();

            ctx.font = 'bold 13px Arial'
            ctx.textAlign = 'start'
            ctx.fillText(i,gridSize*i-2,15)
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
            grid(context)
            draw(context,frameCount)

            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }

    }, [])

    return <canvas ref={canvasRef} {...props}/>
}

export default Canvas