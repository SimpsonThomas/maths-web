//import React, { useEffect, useRef, useState } from "react";
import './canvas.css'

const drawLine3D = (ctx, start, end, colour='red', transform=[1,0,0,1],width=1,) => { // drawing a line
    //let width = ctx.canvas.width
    //let height = ctx.canvas.height 
    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.lineWidth = width
    ctx.save()
    ctx.transform(transform[0],transform[1],transform[2],transform[3],0,0)
    ctx.moveTo(start.x, start.y, start.z)
    ctx.lineTo(end.x, end.y, end.z)
    ctx.restore()
    ctx.stroke()
}

const drawLine = (ctx, start, end, colour, transform=[1,0,0,1],width=1,text='') => { // drawing a line
    //let width = ctx.canvas.width
    //let height = ctx.canvas.height 
    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.lineWidth = width
    ctx.save()
    ctx.transform(transform[0],transform[2],transform[1],transform[3],0,0)
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.restore()
    ctx.stroke()
}

const drawLineArrow = (ctx, start, end, colour, transform=[1,0,0,1], text='',width=2) => { // drawing a line
    //let width = ctx.canvas.width
    //let height = ctx.canvas.height 
    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.fillStyle = colour
    ctx.lineWidth = width
    ctx.font = "30px Arial"
    ctx.save()
    ctx.transform(transform[0],transform[2],transform[1],transform[3],0,0)
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    //ctx.transform(1,0,0,-1,0,0)
    let endMat = matVecMult(transform, end)
    let startMat = matVecMult(transform, start)
    ctx.restore()
    ctx.save()
    ctx.translate(endMat.x,endMat.y)
    ctx.rotate(Math.PI*3)
    ctx.scale(-1,1)
    ctx.fillText(text,0,0)
    ctx.stroke()
    ctx.restore()

    
    // creating arrowheads
    if (start.x - end.x || start.y-end.y) {
        var endRadians=Math.atan((endMat.y-startMat.y)/(endMat.x-startMat.x));
        endRadians+=((endMat.x>=startMat.x)?90:-90)*Math.PI/180;

        ctx.beginPath()
        ctx.save()
        //ctx.transform(transform[0],transform[2],transform[1],transform[3],0,0)
        ctx.translate(endMat.x, endMat.y)
        ctx.rotate(endRadians)
        ctx.moveTo(0,0)
        ctx.lineTo(5,10)
        ctx.lineTo(-5,10)
        ctx.closePath()
        ctx.restore()
        ctx.fill()
    }
}

const initaliseCanvas = (context, canvas, background='white') => {
    context.setTransform(1,0,0,-1,canvas.width/2, canvas.height/2)
    context.clearRect(-canvas.width, -canvas.height,context.canvas.width,context.canvas.height)
    context.fillStyle = background
    context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)
}

const calculateVectors = (transform) => {
    let [a,b,c,d] = transform.map(x => parseFloat(x))
    const trace = a+d
    const det = a*d - b*c
    const eigenVal1 = trace/2 + ((trace**2)/4-det)**(1/2)
    const eigenVal2 = trace/2 - ((trace**2)/4-det)**(1/2)
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

const eigenVector = (ctx, transform,gridSize) => {
    const [, , eigenVec1, eigenVec2] = calculateVectors(transform)

    
    let width = ctx.canvas.width
    let height = ctx.canvas.height
    drawLine(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*10, y:-eigenVec1[1]*gridSize*10}, 'yellow')
    // drawLine(ctx, {x:0,y:0}, {x:eigenVec1[0]*gridSize*10, y:-eigenVec1[1]*gridSize*10}, 'yellow')
    drawLine(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*10, y:-eigenVec2[1]*gridSize*10}, 'yellow')
    // drawLine(ctx, {x:0,y:0}, {x:eigenVec2[0]*gridSize*10, y:-eigenVec2[1]*gridSize*10}, 'yellow')
    ctx.setTransform(1,0,0,1,width/2,height/2)
}

const calculateAngleMatrix = (scaleAngle) => {
    let scale = scaleAngle.scale
    let angle = scaleAngle.angle
    let angleRadX = 2*Math.PI*angle.x/360
    let angleRadY = 2*Math.PI*angle.y/360
    let transform1 = Math.cos(angleRadX)*scale.x
    let transform3 = -Math.sin(angleRadX)*scale.x
    let transform2 = Math.sin(angleRadY)*scale.y
    let transform4 = Math.cos(angleRadY)*scale.y

    return [angleRadX, angleRadY, transform1, transform2, transform3, transform4].map(x => parseFloat(x.toFixed(4)))
}

const calculateAngleVec = (vec) => {
    let angle = vec.angle
    let angleRad = Math.PI*(angle/180)
    let scale = vec.scale
    let x_coord = scale*parseFloat(Math.cos(angleRad).toFixed(4))
    let y_coord = scale*parseFloat(Math.sin(angleRad).toFixed(4))
    return {x:x_coord, y:y_coord}
}

const matVecMult = (mat, vec) => {
    let [a,b,c,d] = mat.map(x => parseFloat(x))
    let [x, y] = [vec.x, vec.y].map(i => parseFloat(i))
    let x_new = x*a+y*b
    let y_new = y*d+x*c
    return ({'x':x_new, 'y':y_new})
}

const matMult = (mat1, mat2) => {
    let [a,b,c,d] = mat1.map(x => parseFloat(x))
    let [e,f,g,h] = mat2.map(x => parseFloat(x))
    let newMat = [a*e+b*g,a*f+b*h, c*e+d*g, c*f+d*h]
    return newMat
}


const checkSolve = (mat, endMat, vec, endVec) => {
    let startReal = matVecMult(mat,vec)
    let endReal = matVecMult(endMat,endVec)
    let x_solve = (startReal.x === endReal.x) ? true : false
    let y_solve = (startReal.y === endReal.y) ? true : false
    return x_solve && y_solve
}

const checkSingular = (mat) => {
    let [a,b,c,d] = mat.map(x => parseFloat(x))
    const det = a*d - b*c
    return det === 0
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

    const updateMatrix = (e, position, dir=false) => {
        e.preventDefault()
        let value = e.target.value
        let oldMatrix = {1:matrix.new[1],2:matrix.new[2],3:matrix.new[3],4:matrix.new[4]}
        oldMatrix[position] = (oldMatrix[position] === '') ? matrix.old[position] : oldMatrix[position]
        let newMatrix = matrix.new
        newMatrix[position] = !dir ? value
            : dir === 'up' ? parseFloat(newMatrix[position]) + 1
            :parseFloat(newMatrix[position])- 1
        setMatrix({
            new: newMatrix,
            old: oldMatrix,
            change: position,
        })
    }

    const updateSave = (e) => {
        e.preventDefault()
        let [, , transform1, transform2, transform3, transform4] = calculateAngleMatrix(scaleAngle)
        let mat = (!switchMat) ? [matrix.new[1],matrix.new[2],matrix.new[3],matrix.new[4]]
            :[transform1, transform2, transform3, transform4]
        setSaveMatrix(mat)
    }

    const numberInput = (position, other={type:'set'}) =>{
        let value = other.type === 'set' ? matrix.new[position]
            : Math.round(other.data*100)/100
        return (
            <span className="buttonGroup matrixGroup" key={position+'matrixInput'+other.type}>
                <button className="matrixButton" style={{visibility: other.type !== 'set' ? 'hidden' : ''}} onClick={e => updateMatrix(e, position, 'down')}>-</button>
                <input className={other.type !== 'set' ? 'matrixInputNormal':'matrixInput'}  type="number" 
                    value={value} key={position+'matrixInput'+other.type} disabled={other.type !=='set'}
                    onChange={e => other.type==='set' ? updateMatrix(e, position) : console.log('Silly you')}/>
                <button className="matrixButton" style={{visibility: other.type !== 'set' ? 'hidden' : ''}} onClick={e => updateMatrix(e, position, 'up')}>+</button>
            </span>
        )
    }

    const angleScaleInput = (type, axis, range, step=0.01) => {
        // e => setScaleAngle(prevState => ( { ...prevState, [type]:{...prevState[type],[axis]:e.target.value/10} }))
        const updateMatAng = (e) => {
            e.preventDefault()
            let value = e.target.value
            const setAngles = [-180,-150,-135,-90,-60,-45,-30,0,30,45,60,90,135,150,180]
            const setScales = [0,0.1,0.2,0.25,0.5,0.75]
            if (type === 'angle') {
                const nearAngle = setAngles.reduce((a, b) => {
                    return Math.abs(b - value) < Math.abs(a - value) ? b : a;
                });
                if (Math.abs(nearAngle-value) < 5) value = nearAngle
            } else {
                const modScale = value % 1
                const nearScale = setScales.reduce((a, b) => {
                    return Math.abs(b - modScale) < Math.abs(a - modScale) ? b : a;
                });
                if (Math.abs(nearScale-modScale) < 0.1) value = value <= 0 ? (Math.ceil(value) + nearScale)
                    : (Math.floor(value) + nearScale)
            }
            setScaleAngle(prevState => ( {...prevState, [type]: {...prevState[type], [axis]: value}} ))
        }
        return (
            <input type="range" min={-range} max={range} value={scaleAngle[type][axis]} step={step} className="slider" id="myRange"
                onChange={e => updateMatAng(e) }/>
        )
    }

    const vecInput = (position, other={type:'set'}) =>{
        let value = vector[position]
        let disabled = other.type !=='set'
        return (
            

            <p className="buttonGroup matrixGroup" key={position+'matrixInput'+other.type}>

                <button className="matrixButton" style={{visibility: disabled ? 'hidden' : ''}} disabled={disabled} 
                    onClick={e => setVector(prevVec => ( {...prevVec,[position]:(parseFloat(prevVec[position])*10 -1)/10, 'old':prevVec.old, 'change':position }))} >-</button>
                    <input className={disabled ? 'matrixInputNormal':'matrixInput'}  type="number" 
                        value={value} key={position+'matrixInput'+other.type} disabled={disabled}
                        onChange={e => setVector(prevVec => ( {...prevVec,[position]:e.target.value, 'old':prevVec.old, 'change':'x' } ))  }/>

                <button className="matrixButton" disabled={disabled} style={{visibility: disabled ? 'hidden' : ''}} 
                    onClick={e => setVector(prevVec => ( {...prevVec,[position]:(parseFloat(prevVec[position])*10 +1)/10, 'old':prevVec.old, 'change':position } ))  }>+</button>
            </p>
        )
    }

    return (
        <fieldset>
        <div className={'matrixBox ' + (collapse ? 'boxOpen' : 'boxClosed')}>
            <p className='boxTitle'>
                Settings
            </p>

            
                { type!=='basic' ?
                    <>
                        <p className='boxTitle'>Vector Input</p>
                        {['x','y'].map(axis => vecInput(axis))}
                    </> : <></>
                }

            <div className={'settings settingsOpen'}>
                <p className='boxTitle'>Matrix</p>
                <label className="switch">
                    <input type="checkbox" checked={switchMat}
                        onChange={e=> setSwitchMat(e.target.checked)}/>
                    <span className="sliderToggle round"></span>
                </label>
                <div style={{display : !switchMat ? '' : 'none'}}>
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
                    <p>
                        {
                            [{no:1, data:transform1},{no:2, data:transform2}].map(dic => numberInput(dic.no, {type:'other', data:dic.data}) )
                        }
                    </p>
                        {
                            [{no:3, data:transform3},{no:4, data:transform4}].map(dic => numberInput(dic.no, {type:'other', data:dic.data}) )
                        }
        
                    <div>
                        <p className='boxTitle'>
                            <button className='quickChange' 
                                onClick={e => {e.preventDefault(); quickSetAngle('x','y')}}>
                                    Angle X:</button>
                             &nbsp; &nbsp; <span className='sliderDisplay'>{scaleAngle.angle.x}</span></p>
                        {angleScaleInput('angle', 'x', 180,0.1)}
                    </div>
                    
                    <div className='boxTitle'>
                        <p>
                            <button className='quickChange' 
                                onClick={e => {e.preventDefault(); quickSetAngle('y','x')}}>
                                    Angle Y:</button>
                             &nbsp; &nbsp; <span className='sliderDisplay'>{scaleAngle.angle.y}</span></p>
                        {angleScaleInput('angle', 'y', 180,0.1)}
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

                {type === 'basic' ? <p></p> 
                    : <>
                    
                { type!=='basic' ?
                    <>
                            <p><button className='quickChange' 
                                onClick={e => {e.preventDefault(); setShowEigen(prev => (!prev) );} }>
                                {showEigen ? 'Hide Eigenvectors' : 'Show Eigenvectors'}</button></p>
                        {
                            showEigen ?
                                <>
                                <p className='matrixDisplay'>Value: {Math.round(eigenVal1*100)/100} &nbsp;&nbsp; [{Math.round(eigenVec1[0]*100)/100} , {Math.round(eigenVec1[1]*100)/100}] </p>
                                <p className='matrixDisplay'>Value: {Math.round(eigenVal2*100)/100} &nbsp;&nbsp; [{Math.round(eigenVec2[0]*100)/100} , {Math.round(eigenVec2[1]*100)/100}] </p>
                                </>
                            : <></>
                        }
                            <p><button className='quickChange' 
                                onClick={e => {updateSave(e)}}>
                                Save</button></p>
                    </> : <></>
                }
                    </>}
            </div>
        </div>
        </fieldset>
    )
}

export {drawLine, drawLineArrow,drawLine3D ,calculateVectors, eigenVector, calculateAngleMatrix, initaliseCanvas, 
    checkSolve, matMult, matVecMult, checkSingular, calculateAngleVec}

export default SettingsBox