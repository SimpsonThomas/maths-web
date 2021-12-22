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

        let ticksX = {number: 2, suffix: '\u03a0'}
        let ticksY = {number: 1, suffix: ''}

        
        let width = ctx.canvas.width
        let height = ctx.canvas.height

        let linesX = Math.floor(height/gridSize)
        let linesY = Math.floor(width/gridSize)

        let X = {lines:linesX, startOther: startY, ticks: ticksX, axis:'X'}
        let Y = {lines:linesY, startOther: startX, ticks: ticksY, axis:'Y'}

        

        for (const j in [X,Y]) {
            let ax = [X,Y][j]
            for (let i =0; i<=ax.lines; i++){
                ctx.beginPath()
                ctx.lineWidth=1;

                if (i== ax.startOther) {
                    ctx.strokeStyle = gridProps.majorAxColour
                }
                else ctx.strokeStyle = gridProps.minorAxColour
                
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
                        ctx.lineTo(gridSize*i,height)
                    } else {
                        ctx.moveTo(gridSize*i+0.5,0)
                        ctx.lineTo(gridSize*i+0.5,height)
                    }
                }
                ctx.stroke()
            }
        }

       // ctx.translate(startY*gridSize, startX*gridSize)

        /*for (let i=1; i<linesY; i++) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black'

            ctx.moveTo(gridSize*i+0.5+startY*gridSize, -3+startX*gridSize)
            ctx.lineTo(gridSize*i+0.5+startY*gridSize, 3+startX*gridSize)
            ctx.stroke();

            ctx.font = 'bold 13px Arial'
            ctx.textAlign = 'start'
            ctx.fillText(i,gridSize*i-2+startY*gridSize,15+startX*gridSize)
        }*/

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

                /*if (ax.axis === 'X') {
                    ctx.strokeStyle  = 'yellow'
                    if (i==ax.lines) {
                        ctx.moveTo(0,2*gridSize*i)
                        ctx.lineTo(width, 2*gridSize*i+width*Math.tan(angle))
                    } else {
                        ctx.moveTo(0,2*gridSize*i+0.5)
                        ctx.lineTo(width, 2*gridSize*i+0.5+width*Math.tan(angle))
                    }
                } else {
                    ctx.strokeStyle = 'red'
                    if (i==ax.lines) {
                        ctx.moveTo(2*gridSize*i,0)
                        ctx.lineTo(2*gridSize*i-height*Math.tan(angle),width)
                    } else {
                        ctx.moveTo(2*gridSize*i+0.5,0)
                        ctx.lineTo(2*gridSize*i+0.5-height*Math.tan(angle),height)
                    }
                }
                ctx.stroke()*/
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