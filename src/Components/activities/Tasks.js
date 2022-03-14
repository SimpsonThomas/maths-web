import React, { useEffect, useRef, useState } from "react";
import '../canvas.css'
import './tasks.css'
import { calculateAngleMatrix, calculateAngleVec, initaliseCanvas, matMult} from "../canvasComponents";
import { grid } from "../grid";
import { inverseTasks, tasksNormal } from "../constants/tasksList";

const Tasks = props => {
    const inherit = props.props

    const selection = inherit.selection // are we in the selection window?
    const taskType = props.props.taskType ? props.props.taskType : 'none'
    //const [scaleAngle, setScaleAngle] = inherit.scaleAngle
    //const [showEigen, setShowEigen] = inherit.eigen

    const [state, updateState] = inherit.state

    const canvas1Ref = useRef(null)
    const canvas2Ref = useRef(null)

    // basic props for the grid
    const gridProps = {
        size : selection ? 20 : 20*inherit.scroll , // size of grid squares
        startX: 15,
        startY: 15,
        majorAxColour: inherit.majorAxColour, // default colours
        minorAxColour: inherit.minorAxColour, 
        minorAxSecColour: inherit.minorAxSecColour,
        backgroundColour: inherit.backgroundColour,
        vectorColour: inherit.vectorColour,
        colourAxis:  inherit.colourAxis
    }

    useEffect( () => {
        const canvas1 = canvas1Ref.current
        const context1 = canvas1.getContext('2d')
        canvas1.style.width ='100%';
        canvas1.style.height='100%';
        canvas1.width  = canvas1.offsetWidth;
        canvas1.height = canvas1.offsetHeight;

        const canvas2 = canvas2Ref.current
        const context2 = canvas2.getContext('2d')
        // max out height
        canvas2.style.width ='100%';
        canvas2.style.height='100%';
        // ...then set the internal size to match
        canvas2.width  = canvas2.offsetWidth;
        canvas2.height = canvas2.offsetHeight;

        let frameCount = 0
        let frameMax = 10
        let animationFrameId

        const animate = (context=context2, canvas=canvas2, matrix, vec) => {
            // animating the changes in the matrix
            // initialising the canvas
            initaliseCanvas(context, canvas, gridProps.backgroundColour)

            frameCount++

            let position = matrix.change
            let [newVal, oldVal] = [parseInt(matrix.new[position]), parseInt(matrix.old[position])]
            let change = newVal-oldVal

            let mat = [matrix.old[0],matrix.old[1],matrix.old[2],matrix.old[3]]
            mat[position] = parseInt(mat[position])+(change/frameMax)*frameCount

            let vector={x:0,y:0}

            switch (taskType){
                case 'normal':
                    vector = vec
                    break;
                case 'inverse':
                    mat = matMult(state.matrixStart.new, mat)
                    break;
                default:
                    break;
            }

            grid(context, gridProps.minorAxColour, gridProps.minorAxSecColour,gridProps.majorAxColour, gridProps.vectorColour,mat, vector,true,gridProps.colourAxis,gridProps.size)

            //if (showEigen) eigenVector(context,mat)
            if (frameCount===frameMax) {
                updateState({
                    type: 'matrix',
                    data:{
                        new: matrix.new,
                        old: matrix.new,
                        change: 'done',
                    }
                })
            }
            animationFrameId = window.requestAnimationFrame(() => {animate(context, canvas, matrix, vec)})
        }

        const render = (
            context, 
            canvas, 
            mat,
            disVector={'x':0,'y':0},
            backgroundColour=gridProps.backgroundColour, 
            gridColour={minor:gridProps.minorAxColour, major:gridProps.majorAxColour,minorSec:gridProps.minorAxSecColours,axis:gridProps.colourAxis}, 
            ) => {
                initaliseCanvas(context, canvas, backgroundColour)
                grid(context, gridColour.minor, gridColour.minorSec, gridColour.major,gridColour.vector,mat, disVector,true,gridColour.axis,gridProps.size)
                //if (showEigen) eigenVector(context,mat)
        }

        let matrix = state.matrix

        let matNorm = (matrix.new[matrix.change] !=='') ? matrix.new
            : matrix.old

        let matAngle = calculateAngleMatrix(state.matrix).slice(-4)

        let mat = state.matrix.angleMat ? matAngle : matNorm

        
        let vec = (taskType === 'inverse') ? state.vecStart  
        : !state.vecStart.angleVec ? state.vecStart : calculateAngleVec(state.vecStart)
        
        if (taskType === 'inverse') mat = matMult(state.matrixStart.new, mat)
        if (matrix.change !== 'done' && matrix.new[matrix.change]!=='') {
            animate(context1, canvas1, matrix, vec)
        }
        else {
            render(context1, canvas1, mat, vec)
        }
        render(context2, canvas2,state.matrixEnd.new, state.vecEnd, '#28282B', {minor:'#FFFEEE',major:'white',minorSec:'grey',axis:'orange'})
        
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    })

    let helpSaveName = 'helpTask'+taskType
    let localStore = window.localStorage

    if (!localStore.getItem(helpSaveName)) localStore.setItem(helpSaveName, JSON.stringify(true))

    let initialHelp = JSON.parse( localStore.getItem(helpSaveName))

    const [showHelp, setShowHelp] = useState(initialHelp)

    useEffect(() => {
        window.localStorage.setItem(helpSaveName, JSON.stringify(showHelp))
    }, [showHelp,helpSaveName])

    useEffect(() => {

        if (showHelp || inherit.activityBox || state.solve) {
            const inputs = document.querySelectorAll('fieldset')
            for (let i=0; i<inputs.length;i++) inputs[i].disabled = true
        }
        
        else  {
            const inputs = document.querySelectorAll('fieldset')
            for (let i=0; i<inputs.length;i++) inputs[i].disabled = false
        }
    })

    const updateMatrix = (e, pos, dir=false) => {
        e.preventDefault()
        let value = e.target.value
        let position = pos-1
        let matrix = state.matrix
        let oldMatrix = [matrix.new[0],matrix.new[1],matrix.new[2],matrix.new[3]]
        oldMatrix[position] = (oldMatrix[position] === '') ? matrix.old[position] : oldMatrix[position]
        let newMatrix = state.matrix.new
        newMatrix[position] = !dir ? value
            : dir === 'up' ? parseFloat(newMatrix[position]) + 1
            :parseFloat(newMatrix[position])- 1
        updateState({
            type: 'matrix',
            data:{
                new: newMatrix,
                old: oldMatrix,
                change: position,
            }
        })
    }
    const numberInput = (position, other={type:'set'}) =>{
        let value = other.type === 'set' ? state.matrix.new[position-1]
            : Math.round(other.data*100)/100
        let disabled = other.type !=='set' || state.currentTask.type ==='vec'
        return (
            <span className="buttonGroup matrixGroup" key={position+'matrixInput'+other.type}>
                <button className="matrixButton" style={{visibility: disabled ? 'hidden' : ''}} disabled={disabled} onClick={e => updateMatrix(e, position, 'down')}>-</button>
                <input className={disabled ? 'matrixInputNormal':'matrixInput'}  type="number" 
                    value={value} key={position+'matrixInput'+other.type} disabled={disabled}
                    onChange={e => other.type==='set' ? updateMatrix(e, position) : console.log('Silly you')}/>
                <button className="matrixButton" disabled={disabled} style={{visibility: disabled ? 'hidden' : ''}} onClick={e => updateMatrix(e, position, 'up')}>+</button>
            </span>
        )
    }


    const nextTask = (e) => {
        e.preventDefault()
        updateState({type:'task'})
    }

    const updateVec = (e, direct, arrow=false) => {
        e.preventDefault()
        let value = e.target.value
        let oldVec = {'x':state.vecStart.x, 'y':state.vecStart.y}
        let newVec = {...state.vecStart.new, [direct]:value}
        oldVec[direct] = (oldVec[direct] === '') ? state.vecStart.old[direct] : oldVec[direct]
        newVec[direct] = !arrow ? value
            : arrow ==='up' ?( parseFloat(state.vecStart[direct])*10 + 1)/10
            :  (parseFloat(state.vecStart[direct])*10 - 1)/10
        console.log(state.vecStart[direct])
        updateState({
            type: 'vector',
            data: {
                ...newVec,
                'old': oldVec,
                'change': direct
            }
        })
    }

    const vecInput = (position, other={type:'set'}) =>{
        let value = state.vecStart[position]
        let disabled = other.type !=='set' || !vec
        return (
            <p className="buttonGroup matrixGroup" key={position+'matrixInput'+other.type}>
                <button className="matrixButton" style={{visibility: disabled ? 'hidden' : ''}} disabled={disabled} onClick={e => updateVec(e, position, 'down')}>-</button>
                <input className={disabled ? 'matrixInputNormal':'matrixInput'}  type="number" 
                    value={value} key={position+'matrixInput'+other.type} disabled={disabled}
                    onChange={e => other.type==='set' ? updateVec(e, position) : console.log('Silly you')}/>
                <button className="matrixButton" disabled={disabled} style={{visibility: disabled ? 'hidden' : ''}} onClick={e => updateVec(e, position, 'up')}>+</button>
            </p>
        )
    }

    const slider = (type,axis,range) => {
        const updateMatAng = (e) => {
            e.preventDefault()
            let value = e.target.value
            updateState({
                type: 'matrix',
                data: {
                    [type] : {
                        ...state.matrix[type],
                        [axis] : value/10
                    }
                }
            })
        }

        return (
            <input type="range" min={-range*10} max={range*10} value={state.matrix[type][axis]*10} disabled={vec ? 'disabled':''} className="slider" id="myRange"
                onChange={e => updateMatAng(e) }/>
        )
    }

    const sliderVec = (type,range) => {
        const updateVecAng = (e) => {
            e.preventDefault()
            let value = e.target.value
            updateState({
                type: 'vector',
                data: {
                    [type] : value
                }
            })
        }

        return (
            <input type="range" min={-range} max={range} value={state.vecStart[type]} className="slider" id="myRange"
                onChange={e => updateVecAng(e) }/>
        )
    }

    const quickSetAngle = (change, keep) => {
        const setAngles = [-180,-150,-135,-90,-60,-45,-30,0,30,45,60,90,135,150,180]
        const current = state.matrix.angle[change]
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
        updateState( {type:'matrix',data:{angle:{...state.matrix.angle,[change]:newAngle, } } } )
    }

    const vec = state.currentTask.type==='vec'

    const scaleAngleMatrix = calculateAngleMatrix(state.matrix)
    const [,,transform1,transform2,transform3,transform4] = scaleAngleMatrix

    const taskList = taskType === 'inverse' ? inverseTasks : tasksNormal

    const html = <>
        {!selection ? 
            <fieldset className='controlBox'>
            <div className={'matrixBox boxOpen'}>
                <p style={{color:'white'}}>{state.currentTask.description}</p>
                    {taskType !== 'inverse' ? <>
                        <p className='boxTitle'>
                            Input Vector
                        </p>
                        {/*<label className="switch">
                            <input type="checkbox" checked={state.vecStart.angleVec}
                                onChange={e=> updateState({type:'switchVec'})}/>
                            <span className="sliderToggle round"></span>
                        </label>*/}
                        <p style={{color:'white'}}>{vec ? 'Input test vectors here to match the test vector' : 'Currently set vector'}</p>
                        { !state.vecStart.angleVec ?
                        <>
                            {['x','y'].map(axis => vecInput(axis))}
                        </>
                        :
                        <>                                
                            <div className='boxTitle'>
                                <p>Scale: &nbsp; &nbsp; <span className='sliderDisplay'>{state.vecStart.scale}</span></p>
                                {sliderVec('scale', 5)}
                            </div>                        
                            <div className='boxTitle'>
                                <p>Angle: &nbsp; &nbsp; <span className='sliderDisplay'>{state.vecStart.angle}</span></p>
                                {sliderVec('angle', 180)}
                            </div>
                        </>
                        }
                    </>
                    : <>
                        <p className='boxTitle'>
                            Start Matrix
                        </p>
                        <p className='matrixDisplay'>
                            {state.matrixStart.new[0]} &nbsp; &nbsp; &nbsp; {state.matrixStart.new[1]}
                        </p>
                        <p className='matrixDisplay'>
                            {state.matrixStart.new[2]} &nbsp; &nbsp; &nbsp; {state.matrixStart.new[3]}
                        </p>
                    </>}
                    <>
                    <>
                    
                        <p className='boxTitle'>{state.matrix.angleMat ? 'Matrix Sliders' : 'Set Matrix'}</p>
                        {!vec ? <label className="switch">
                            <input type="checkbox" checked={state.matrix.angleMat} disabled={vec ? 'disabled':''}
                                onChange={e=> updateState({type:'switchMat'})}/>
                            <span className="sliderToggle round"></span>
                        </label> : <></>}
                    </>
                    <div style={{display : !state.matrix.angleMat ? '' : 'none'}}>
                        <p style={{color:'white'}}>{!vec || taskType === 'inverse' ? 'Try changing the matrix to match the start vector to the end vector' : 'Currently set matrix'}</p>                        
                        <p>
                            {
                                [1,2].map(pos => numberInput(pos) )
                            }
                        </p>
                            {
                                [3,4].map(pos => numberInput(pos) )
                            }
                    </div>
                    </>
                    <>
                        <div style={{display : state.matrix.angleMat ? '' : 'none'}} >
                        <p style={{color:'white'}}>{!vec || taskType === 'inverse' ? 'Try changing the matrix to match the start vector to the end vector' : 'Currently set matrix'}</p> 
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
                                <button className='quickChange' disabled={vec ? 'disabled':''}
                                    onClick={e => {e.preventDefault(); quickSetAngle('x','y')}}>
                                        Angle X:</button>
                                &nbsp; &nbsp; <span className='sliderDisplay'>{state.matrix.angle.x}</span></p>
                            {slider('angle', 'x', 180)}
                        </div>
                        
                        <div className='boxTitle'>
                            <p>
                                <button className='quickChange' disabled={vec ? 'disabled':''}
                                    onClick={e => {e.preventDefault(); quickSetAngle('y','x')}}>
                                        Angle Y:</button>
                                &nbsp; &nbsp; <span className='sliderDisplay'>{state.matrix.angle.y}</span></p>
                            {slider('angle', 'y', 180)}
                        </div>
                        <div className='boxTitle'>
                            <p>Scale X: &nbsp; &nbsp; <span className='sliderDisplay'>{state.matrix.scale.x}</span></p>
                            {slider('scale', 'x', 5)}
                        </div>
                        <div className='boxTitle'>
                            <p>Scale Y: &nbsp; &nbsp; <span className='sliderDisplay'>{state.matrix.scale.y}</span></p>
                            {slider('scale', 'y', 5)}
                        </div>
                </div>
                    </>
                <p></p>
                {process.env.NODE_ENV === 'development' ?<button className='quickChange' 
                    onClick={e => {nextTask(e)}}>
                    Next Task</button> : <></>}
            </div>
            </fieldset>
            : <></>}
        {!selection ? 
            <div className='taskEndBox'>
                <p className='boxTitle'>End State</p>
                <p className='boxTitle'>Matrix</p>
                <p className='matrixDisplay'>
                    {state.matrixEnd.new[0]} &nbsp; &nbsp; &nbsp; {state.matrixEnd.new[1]}
                </p>
                <p className='matrixDisplay'>
                    {state.matrixEnd.new[2]} &nbsp; &nbsp; &nbsp; {state.matrixEnd.new[3]}
                </p>
                
                {taskType !== 'inverse' ? <>
                    <p className='boxTitle'>Vector</p>
                    <p className='matrixDisplay'>
                        {state.vecEnd.x}
                    </p>
                    <p className='matrixDisplay'>
                        {state.vecEnd.y}
                    </p>
                </> : <></>
                }
            </div>
        : <></>}
        <div className='canvas1'>
            <canvas ref={canvas1Ref} {...props}/>
        </div>
        <div className='canvas2'>
            <canvas ref={canvas2Ref} {...props}/>
        </div>
        {
        state.solve  && !selection ?
        (state.currentTask.num >= Object.keys(taskList).length ?
        <div className='help'>
            <h3>Well done you have completed all the tasks</h3>
            <p> Now you can go onto the next set of activites</p>
            <p>You can either click next in the stop right to go onto the next set of activites or click below to start again</p>
            <button className='hideHelp'  style={{ height:'50px', bottom:'-25px', left:'calc(50%-40px)'}}
                onClick={e => {/*inherit.setActivity({set:'Matrix Multiply', selection:false})*/ nextTask(e)}}>
                Start over</button>
        </div>
        : 
        
        <div className='help'>
                <h3>Well done you have completed this task</h3>
                <p>{state.currentTask.endCard}</p>
                <p> Now you can take on the next one! </p>
                <button className='hideHelp' 
                    onClick={e => {nextTask(e)}}>
                    Next</button>
            </div> 
        ) : <></>
        }
    
      {showHelp && !selection ?
            <div className='help'>
                { 
                
                taskType === 'normal' ?
                <>
                    <h3>Vector Tasks</h3>
                    <p>Here you get to play around with vectors and matrices to get them to match</p>
                    <p>You need to adjust either your starting vector or matrix to get the two sides to match</p>
                    <p>The aim is to get the two vectors to match</p>
                    <p></p>
                </>

                : 
                <>
                    <h3>Multiply Matrices</h3>
                    <p>Here you get to play around with matrices to get them to match</p>
                    <p>Adjust the matrix you control to make the two sides match</p>
                    <p>The two matrices on the left are multipled and them aim is to get them to match the one on the right</p>
                </>
                }
                <button className='hideHelp' onClick={e => {e.preventDefault(); setShowHelp(false)}}>
                    Hide
                </button>
            </div> 
        : <></>
      }
    </>

    return html
}

export default Tasks