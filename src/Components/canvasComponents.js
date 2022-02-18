//import React, { useEffect, useRef, useState } from "react";
import './canvas.css'

const drawLine = (ctx, start, end, colour, transform=[1,0,0,1],width=1) => { // drawing a line
    //let width = ctx.canvas.width
    //let height = ctx.canvas.height 
    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.lineWidth = width
    ctx.save()
    ctx.transform(transform[0],transform[1],transform[2],transform[3],0,0)
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.restore()
    ctx.stroke()
}

const drawLineArrow = (ctx, start, end, colour, transform=[1,0,0,1], text='') => { // drawing a line
    //let width = ctx.canvas.width
    //let height = ctx.canvas.height 
    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.fillStyle = colour
    ctx.font = "30px Arial"
    ctx.save()
    ctx.transform(transform[0],transform[1],transform[2],transform[3],0,0)
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    //ctx.transform(1,0,0,-1,0,0)
    ctx.translate(end.x,end.y)
    ctx.rotate(Math.PI*3)
    ctx.scale(-1,1)
    ctx.fillText(text,0,0)
    ctx.restore()
    ctx.stroke()

    // creating arrowheads

    var endRadians=Math.atan((end.y-start.y)/(end.x-start.x));
    endRadians+=((end.x>=start.x)?90:-90)*Math.PI/180;

    ctx.beginPath()
    ctx.save()
    ctx.transform(transform[0],transform[1],transform[2],transform[3],0,0)
    ctx.translate(end.x, end.y)
    ctx.rotate(endRadians)
    ctx.moveTo(0,0)
    ctx.lineTo(5,10)
    ctx.lineTo(-5,10)
    ctx.closePath()
    ctx.restore()
    ctx.fill()

}

export {drawLine, drawLineArrow}