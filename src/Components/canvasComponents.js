//import React, { useEffect, useRef, useState } from "react";
import './canvas.css'
import { gridProps } from './props'

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

const calculateVectors = (transform) => {
    let [a,b,c,d] = transform
    console.log(a+d)
    const trace = a+d
    const det = a*d - b*c
    const eigenVal1 = trace/2 + ((trace^2)/4-det)^(1/2)
    const eigenVal2 = trace/2 - ((trace^2)/4-det)^(1/2)
    let eigenVec1 = [1,0]
    let eigenVec2 = [0,1]
    if (c !== 0) {
        eigenVec1 = [eigenVal1-d,c]
        eigenVec2 = [eigenVal2-d,c]
    } else if (b !== 0) {
        eigenVec1 = [b,eigenVal1-a]
        eigenVec2 = [b,eigenVal2-a]
    }
    return [eigenVal1, eigenVal2, eigenVec1, eigenVec2]
}

const eigenVector = (ctx, transform) => {
    const [, , eigenVec1, eigenVec2] = calculateVectors(transform)

    
    let width = ctx.canvas.width
    let height = ctx.canvas.height

    let gridSize = gridProps.size
    drawLine(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*10, y:-eigenVec1[1]*gridSize*10}, 'yellow',transform, 2)
    //drawLine(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*10, y:-eigenVec1[1]*gridSize*10}, 'yellow')
    drawLine(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*10, y:-eigenVec2[1]*gridSize*10}, 'yellow',transform, 2)
    //drawLine(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*10, y:-eigenVec2[1]*gridSize*10}, 'yellow')
    //ctx.setTransform(1,0,0,1,width/2,height/2)
}

const SettingsBox = props => {
    const [[matrix, setMatrix], [vector, setVector], [angle, setAngle], [scale, setScale]] 
        = [props.matrix, props.vector, props.angle, props.scale]
    const [switchMat, setSwitchMat] = props.switchMat
    const [showEigen, setShowEigen] = props.eigen
    let collapse = true
    //const [switchMat, setSwitchMat] = useState(false)

    let angleRadX = 2*Math.PI*angle.x/360
    let angleRadY = 2*Math.PI*angle.y/360
    let transform1 = Math.cos(angleRadX)*scale.x
    let transform2 = -Math.sin(angleRadX)*scale.x
    let transform3 = Math.sin(angleRadY)*scale.y
    let transform4 = Math.cos(angleRadY)*scale.y

    //const [switchMat, setSwitchMat] = useState(false)

    //const [showHelp, setShowHelp] = useState(true)
    //const [showEigen, setShowEigenp] = useState(false)

    let mat = !switchMat ? [matrix[1],matrix[2],matrix[3],matrix[4]] 
        : [transform1, transform2, transform3, transform4] 

    const quickSetAngle = (change, keep) => {
        const setAngles = [-180,-150,-135,-90,-60,-45,-30,0,30,45,60,90,135,150,180]
        const current = angle[change]
        let newAngle = current
        if (setAngles.includes(current)) {
            let nextIndex = setAngles.indexOf(current)+1
            newAngle = setAngles[(nextIndex < setAngles.length) ? nextIndex : 0]
        }
        else {
            newAngle = setAngles.reduce((a, b) => {
                return Math.abs(b - current) < Math.abs(a - current) ? b : a;
            });
        }
        if (change==='x') setAngle({'x':newAngle, 'y':angle[keep]})
        else setAngle({'y':newAngle, 'x':angle[keep]})
    }

    let [eigenVal1, eigenVal2, eigenVec1, eigenVec2] = calculateVectors(mat)


    return (
        <div className={'matrixBox ' + (collapse ? 'boxOpen' : 'boxClosed')}>
            <p className='boxTitle'>
                Settings2
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
                        <input className='matrixInput'  type="number" value={matrix[1]} 
                            onChange={e => setMatrix({1:parseInt(e.target.value),2:matrix[2], 3:matrix[3], 4:matrix[4]})}/>
                        <input className='matrixInput' type="number"  value={matrix[2]}
                            onChange={e => setMatrix({1:matrix[1],2:parseInt(e.target.value), 3:matrix[3], 4:matrix[4]})}/>
                    </p>
                    <input className='matrixInput' type="number"  value={matrix[3]} 
                        onChange={e => setMatrix({1:matrix[1],2:matrix[2], 3:parseInt(e.target.value), 4:matrix[4]})}/>
                    <input className='matrixInput' type="number"  value={matrix[4]} 
                        onChange={e => setMatrix({1:matrix[1],2:matrix[2], 3:matrix[3], 4:parseInt(e.target.value)})}/>
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
                        <p className='boxTitle'>
                            <button className='quickChange' 
                                onClick={e => {e.preventDefault(); quickSetAngle('x','y')}}>
                                    Angle X:</button>
                             &nbsp; &nbsp; <span className='sliderDisplay'>{angle.x}</span></p>
                        <input type="range" min="-180" max="180" value={angle.x} className="slider" id="myRange" onChange={e => setAngle({'x':e.target.value,'y':angle.y})}/>
                    </p>
                    
                    <p className='boxTitle'>
                        <p>
                            <button className='quickChange' 
                                onClick={e => {e.preventDefault(); quickSetAngle('y','x')}}>
                                    Angle Y:</button>
                             &nbsp; &nbsp; <span className='sliderDisplay'>{angle.y}</span></p>
                        <input type="range" min="-180" max="180" value={angle.y} className="slider" id="myRange" onChange={e => setAngle({'y':e.target.value,'x':angle.x})}/>
                    </p>
                    <p className='boxTitle'>
                        <p>Scale X: &nbsp; &nbsp; <span className='sliderDisplay'>{scale.x}</span></p>
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
                <p>
                    <button className='quickChange' 
                        onClick={e => {e.preventDefault(); setShowEigen(!showEigen)}}>
                        {showEigen ? 'Hide Eigenvectors' : 'Show Eigenvectors'}</button>
                </p>
                {
                    showEigen ?
                        <>
                        <p className='matrixDisplay'>Value: {eigenVal1} &nbsp;&nbsp; [{Math.round(eigenVec1[0]*100)/100} , {Math.round(eigenVec1[1]*100)/100}] </p>
                        <p className='matrixDisplay'>Value: {eigenVal2} &nbsp;&nbsp; [{Math.round(eigenVec2[0]*100)/100} , {Math.round(eigenVec2[1]*100)/100}] </p>
                        </>
                    : <></>
                }
                <p>&nbsp;</p>
            </div>
        </div>
    )
}

export {drawLine, drawLineArrow, calculateVectors, eigenVector}

export default SettingsBox