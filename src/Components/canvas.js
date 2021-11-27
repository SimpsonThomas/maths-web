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
        let gridSize = 25
        var x_dis = 5
        let y_dis = 5

        let x_start = {number: 1, suffix: '\u03a0'}
        let y_start
    }

    const axis = (ctx) => {
        let intGridWidth = 46
        let width = ctx.canvas.width
        let height = ctx.canvas.height

        ctx.fillStyle='black'
        ctx.fillRect(0,0,width,height)
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 0.1

        var half = Math.round(width / intGridWidth/2)

        ctx.strokeStyle='white'
        ctx.lineWidth=1
        ctx.moveTo(0,half*intGridWidth)
        ctx.lineTo(width,half*intGridWidth)
        ctx.stroke()

        ctx.moveTo(half*intGridWidth, 0)
        ctx.lineTo(half*intGridWidth,height)
        ctx.stroke()

        
        ctx.strokeStyle = 'black'
    }

    useEffect( () => {
        
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        
        canvas.style.width ='100%';
        canvas.style.height='100%';
        // ...then set the internal size to match
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        let frameCount =0
        let animationFrameId

        const render = () => {
            context.clearRect(0,0,context.canvas.width,context.canvas.height)
            frameCount++
            //grid(context)
            //axis(context)

            draw(context, frameCount)
            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }

    }, [draw])

    return <canvas ref={canvasRef} {...props}/>
}

export default Canvas