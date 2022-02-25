//import React, { useEffect, useRef, useState } from "react";
import './canvas.css'
import { gridProps } from './props'

const drawLine = (ctx, start, end, colour='red', transform=[1,0,0,1],width=1) => { // drawing a line
    //let width = ctx.canvas.width
    //let height = ctx.canvas.height 
    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.lineWidth = width
    ctx.save()
    //ctx.transform(transform[0],transform[1],transform[2],transform[3],0,0)
    ctx.moveTo(start.x, start.y, start.z)
    ctx.lineTo(end.x, end.y, end.z)
    ctx.restore()
    ctx.stroke()
}

const drawLine3D = (ctx, start, end, colour, transform=[1,0,0,1],width=1) => { // drawing a line
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

const initaliseCanvas = (context, canvas, background='white') => {
    context.setTransform(1,0,0,-1,canvas.width/2, canvas.height/2)
    context.clearRect(-canvas.width, -canvas.height,context.canvas.width,context.canvas.height)
    context.fillStyle = background
    context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)
}

const calculateVectors = (transform) => {
    let [a,b,c,d] = transform
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
    drawLine(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*10, y:-eigenVec1[1]*gridSize*10}, 'yellow')
    //drawLine(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*10, y:-eigenVec1[1]*gridSize*10}, 'yellow')
    drawLine(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*10, y:-eigenVec2[1]*gridSize*10}, 'yellow')
    //drawLine(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*10, y:-eigenVec2[1]*gridSize*10}, 'yellow')
    ctx.setTransform(1,0,0,1,width/2,height/2)
}

const calculateAngleMatrix = (scaleAngle) => {
    let scale = scaleAngle.scale
    let angle = scaleAngle.angle
    let angleRadX = 2*Math.PI*angle.x/360
    let angleRadY = 2*Math.PI*angle.y/360
    let transform1 = Math.cos(angleRadX)*scale.x
    let transform2 = -Math.sin(angleRadX)*scale.x
    let transform3 = Math.sin(angleRadY)*scale.y
    let transform4 = Math.cos(angleRadY)*scale.y

    return [angleRadX, angleRadY, transform1, transform2, transform3, transform4]
}

const matVecMult = (mat, vec) => {
    let [a,b,c,d] = mat.map(x => parseInt(x))
    let [x, y] = [vec.x, vec.y].map(i => parseInt(i))
    let x_new = x*a+x*c
    let y_new = y*b+y*d
    return ({'x':x_new, 'y':y_new})
}

const checkSolve = (mat, endMat, vec, endVec) => {
    let startReal = matVecMult(mat,vec)
    let endReal = matVecMult(endMat,endVec)
    let x_solve = (startReal.x === endReal.x) ? true : false
    let y_solve = (startReal.y === endReal.y) ? true : false
    return {'x':x_solve, 'y':y_solve}
}

const SettingsBox = props => {
    const [[matrix, setMatrix], [vector, setVector]] 
        = [props.matrix, props.vector]
    const [switchMat, setSwitchMat] = props.switchMat
    const [showEigen, setShowEigen] = props.eigen
    const [scaleAngle, setScaleAngle] = props.scaleAngle
    const type = props.type
    const setSaveMatrix = type !== 'basic' ? props.setSaveMatrix : null
    let collapse = true

    let [, , transform1, transform2, transform3, transform4] = calculateAngleMatrix(scaleAngle)

    let mat = !switchMat ? [matrix.new[1],matrix.new[2],matrix.new[3],matrix.new[4]] 
        : [transform1, transform2, transform3, transform4] 

    const quickSetAngle = (change, keep) => {
        const setAngles = [-180,-150,-135,-90,-60,-45,-30,0,30,45,60,90,135,150,180]
        const current = scaleAngle.angle[change]
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
        if (change==='x') setScaleAngle(prevState => ( { ...prevState, 'angle':{...prevState.angle,'x':newAngle} } ))
        else setScaleAngle(prevState => ( { ...prevState, 'angle':{...prevState.angle, 'y':newAngle } } ) )
    }

    let [eigenVal1, eigenVal2, eigenVec1, eigenVec2] = calculateVectors(mat)

    const updateMatrix = (e, position) => {
        e.preventDefault()
        let value = e.target.value
        let oldMatrix = {1:matrix.new[1],2:matrix.new[2],3:matrix.new[3],4:matrix.new[4]}
        oldMatrix[position] = (oldMatrix[position] === '') ? matrix.old[position] : oldMatrix[position]
        let newMatrix = matrix.new
        newMatrix[position] = value
        setMatrix({
            'old' : oldMatrix,
            'new' : newMatrix,
            'change' : position
        })
    }

    const updateSave = (e) => {
        e.preventDefault()
        let [, , transform1, transform2, transform3, transform4] = calculateAngleMatrix(scaleAngle)
        let mat = (!switchMat) ? [matrix.new[1],matrix.new[2],matrix.new[3],matrix.new[4]]
            :[transform1, transform2, transform3, transform4]
        setSaveMatrix(mat)
    }

    const numberInput = (position) =>{
        return (
            <input className='matrixInput'  type="number" value={matrix.new[position] } key={position+'matrixInput'}
                onChange={e => updateMatrix(e, position)}/>
        )
    }

    const angleScaleInput = (type, axis, range) => {
        return (
            <input type="range" min={-range} max={range} value={scaleAngle[type][axis]} className="slider" id="myRange"
                onChange={e => setScaleAngle(prevState => ( { ...prevState, [type]:{...prevState[type],[axis]:e.target.value} })) }/>
        )
    }

    return (
        <div className={'matrixBox ' + (collapse ? 'boxOpen' : 'boxClosed')}>
            <p className='boxTitle'>
                Settings
            </p>
            <div className={'settings ' + 'settingsOpen'}>
                <label className="switch">
                    <input type="checkbox" checked={switchMat}
                        onChange={e=> setSwitchMat(e.target.checked)}/>
                    <span className="sliderToggle round"></span>
                </label>
                <div style={{display : !switchMat ? '' : 'none'}}s>
                    <p className='boxTitle'>Set Matrix</p>
                    <p>
                        {
                            [1,2].map(pos => numberInput(pos) )
                        }
                    </p>
                        {
                            [3,4].map(pos => numberInput(pos) )
                        }
                </div>
                <div style={{display : switchMat ? '' : 'none'}} >
                    <p className='boxTitle'>Matrix</p>
                    <p className='matrixDisplay'>
                        {Math.round(transform1*100)/100} &nbsp; &nbsp; &nbsp; {Math.round(transform2*100)/100}
                    </p>
                    <p className='matrixDisplay'>
                        {Math.round(transform3*100)/100} &nbsp; &nbsp; &nbsp; {Math.round(transform4*100)/100}
                    </p>
        
                    <div>
                        <p className='boxTitle'>
                            <button className='quickChange' 
                                onClick={e => {e.preventDefault(); quickSetAngle('x','y')}}>
                                    Angle X:</button>
                             &nbsp; &nbsp; <span className='sliderDisplay'>{scaleAngle.angle.x}</span></p>
                        {angleScaleInput('angle', 'x', 180)}
                    </div>
                    
                    <div className='boxTitle'>
                        <p>
                            <button className='quickChange' 
                                onClick={e => {e.preventDefault(); quickSetAngle('y','x')}}>
                                    Angle Y:</button>
                             &nbsp; &nbsp; <span className='sliderDisplay'>{scaleAngle.angle.y}</span></p>
                        {angleScaleInput('angle', 'y', 180)}
                    </div>
                    <div className='boxTitle'>
                        <p>Scale X: &nbsp; &nbsp; <span className='sliderDisplay'>{scaleAngle.scale.x}</span></p>
                        {angleScaleInput('scale', 'x', 5)}
                    </div>
                    <div className='boxTitle'>
                        <p>Scale Y: &nbsp; &nbsp; <span className='sliderDisplay'>{scaleAngle.scale.y}</span></p>
                        {angleScaleInput('scale', 'y', 5)}
                    </div>
                </div>

                { type!=='basic' ?
                    <>
                        <p className='boxTitle'>Vector Input</p>
                        <p><input className='matrixInput' value={vector.x} 
                                onChange={e => setVector(prevVec => ( {...prevVec,'x':e.target.value, 'old':prevVec.old, 'change':'x' } ))  }/></p>
                        <p><input className='matrixInput' value={vector.y} 
                                onChange={e => setVector(prevVec => ( {...prevVec,'y':e.target.value, 'old':prevVec.old, 'change':'y' } )) }/></p>
                        <p>
                            <button className='quickChange' 
                                onClick={e => {e.preventDefault(); setShowEigen(prev => (!prev) );} }>
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
                            <button className='quickChange' 
                                onClick={e => {updateSave(e)}}>
                                Save</button>
                    </> : <></>
                }
                <p>&nbsp;</p>
            </div>
        </div>
    )
}

export {drawLine, drawLineArrow,drawLine3D ,calculateVectors, eigenVector, calculateAngleMatrix, initaliseCanvas, checkSolve}

export default SettingsBox