import React, { useEffect, useRef, useState } from "react";
import '../canvas.css'
import './tasks.css'
import { calculateAngleMatrix, initaliseCanvas, matMult} from "../canvasComponents";
import { grid } from "../grid";

const Tasks = props => {
    const inherit = props.props
    const taskType = props.props.taskType ? props.props.taskType : 'none'
    //const [scaleAngle, setScaleAngle] = inherit.scaleAngle
    //const [showEigen, setShowEigen] = inherit.eigen

    const [state, updateState] = inherit.state

    const canvas1Ref = useRef(null)
    const canvas2Ref = useRef(null)

    // basic props for the grid
    const gridProps = {
        size : 20, // size of grid squares
        startX: 15,
        startY: 15,
        majorAxColour: inherit.majorAxColour, // default colours
        minorAxColour: inherit.minorAxColour, 
        minorAxSecColour: inherit.minorAxSecColour,
        backgroundColour: inherit.backgroundColour,
        vectorColour: inherit.vectorColour,
        colourAxis:  inherit.colourAxis
    }

    const selection = inherit.selection // are we in the selection window?

    const [windowSize, setWindowSize] = useState({ // resize the canvas when the window resizes via state
        width: undefined,
        height: undefined,
        oldSize: undefined,
    })

    useEffect( () => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
                oldSize: windowSize
            })
        }

        window.addEventListener('resize', handleResize)

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

            grid(context, gridProps.minorAxColour, gridProps.minorAxSecColour,gridProps.majorAxColour, gridProps.vectorColour,mat, vector,true,gridProps.colourAxis)

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
                grid(context, gridColour.minor, gridColour.minorSec, gridColour.major,gridColour.vector,mat, disVector,true,gridColour.axis)
                //if (showEigen) eigenVector(context,mat)
        }

        let matrix = state.matrix

        let mat = (matrix.new[matrix.change] !=='') ? matrix.new
            : matrix.old

        if (taskType === 'inverse') mat = matMult(state.matrixStart.new, mat)
        if (matrix.change !== 'done' && matrix.new[matrix.change]!=='') {
            animate(context1, canvas1, matrix, state.vecStart)
        }
        else {
            render(context1, canvas1, mat, state.vecStart)
        }
        render(context2, canvas2,state.matrixEnd.new, state.vecEnd, 'black', {minor:'white',major:'white',minorSec:'grey',axis:'pink'})
        
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    })

    //const [switchMat, setSwitchMat] = useState(false)

    let helpSaveName = 'helpTask'+taskType
    let localStore = window.localStorage

    if (!localStore.getItem(helpSaveName)) localStore.setItem(helpSaveName, JSON.stringify(true))

    let initialHelp = JSON.parse( localStore.getItem(helpSaveName))

    const [showHelp, setShowHelp] = useState(initialHelp)

    useEffect(() => {
        window.localStorage.setItem(helpSaveName, JSON.stringify(showHelp))
    }, [showHelp,helpSaveName])

    const updateMatrix = (e, pos) => {
        e.preventDefault()
        let value = e.target.value
        let position = pos-1
        let matrix = state.matrix
        let oldMatrix = [matrix.new[0],matrix.new[1],matrix.new[2],matrix.new[3]]
        oldMatrix[position] = (oldMatrix[position] === '') ? matrix.old[position] : oldMatrix[position]
        let newMatrix = state.matrix.new
        newMatrix[position] = value
        updateState({
            type: 'matrix',
            data:{
                new: newMatrix,
                old: oldMatrix,
                change: position,
            }
        })
    }

    const numberInput = (position) =>{
        return (
            <input className='matrixInput'  type="number" value={state.matrix.new[position-1] } disabled={vec ? 'disabled':''} key={position+'matrixInput'}
                onChange={e => updateMatrix(e, position)}/>
        )
    }

    const nextTask = (e) => {
        e.preventDefault()
        updateState({type:'task'})
    }

    const updateVec = (e, direct) => {
        e.preventDefault()
        let value = e.target.value
        let oldVec = {'x':state.vecStart.x, 'y':state.vecStart.y}
        let newVec = {...state.vecStart.new, [direct]:value}
        oldVec[direct] = (oldVec[direct] === '') ? state.vecStart.old[direct] : oldVec[direct]
        newVec[direct] = value
        updateState({
            type: 'vector',
            data: {
                ...newVec,
                'old': oldVec,
                'change': direct
            }
        })
    }

    const slider = (type,axis,range) => {
        const updateMatAng = (e, value) => {
            e.preventDefault()
            updateState({
                type: 'matrix',
                data: {

                }
            })
        }

        return (
            <input type="range" min={-range} max={range} value={state.matrix[type][axis]} className="slider" id="myRange"
                onChange={e => updateMatAng(prevState => ( { ...prevState, [type]:{...prevState[type],[axis]:e.target.value} })) }/>
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
        updateState( {type:'matrix',data:{scale:{...state.matrix.angle,[change]:newAngle, } } } )
    }

    const vec = state.currentTask.type==='vec'

    const scaleAngleMat = calculateAngleMatrix(state.matrix)
    const [,,transform1,transform2,transform3,transform4] = scaleAngleMat(state.matrix)
    console.log(scaleAngleMat)

    const html = <>
        {!selection ? 
            <div className={'matrixBox boxOpen'}>
                <p className='boxTitle'>Current Task: {state.currentTask.num}</p>
                <p style={{color:'white'}}>{state.currentTask.description}</p>
                    {taskType !== 'inverse' ? <>
                        <p className='boxTitle'>
                            Input Vector
                        </p>
                        <p style={{color:'white'}}>{vec ? 'Input test vectors here to match the test vector' : 'Currently set vector'}</p>
                        <p><input className='matrixInput' disabled={!vec ? 'disabled':''} value={state.vecStart.x} 
                                onChange={e => updateVec(e, 'x') }/></p>
                        <p><input className='matrixInput' disabled={!vec ? 'disabled':''} value={state.vecStart.y} 
                                onChange={e => updateVec(e, 'y') }/></p>
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
                        <label className="switch">
                            <input type="checkbox" checked={state.matrix.angle}
                                onChange={e=> updateState({type:'switchMat'})}/>
                            <span className="sliderToggle round"></span>
                        </label>
                    </>
                        <p className='boxTitle'>Set Matrix</p>
                        <p style={{color:'white'}}>{!vec || taskType === 'inverse' ? 'Try changing the matrix to match the start vector to the end vector' : 'Currently set matrix'}</p>                        
                        <p>
                            {
                                [1,2].map(pos => numberInput(pos) )
                            }
                        </p>
                            {
                                [3,4].map(pos => numberInput(pos) )
                            }
                    </>
                    <>
                        <div style={{selection : state.matrix.angle ? '' : 'none'}} >
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
                                &nbsp; &nbsp; <span className='sliderDisplay'>{state.matrix.angle.x}</span></p>
                            {slider('angle', 'x', 180)}
                        </div>
                        
                        <div className='boxTitle'>
                            <p>
                                <button className='quickChange' 
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
                    <p>&nbsp;</p>
                <p></p>
                <button className='quickChange' 
                    onClick={e => {nextTask(e)}}>
                    Next Task</button>
                <p>&nbsp;</p>
            </div>
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
        {state.solve  && !selection ?
            <div className='help'>
                <h3>Well done you have completed this task</h3>
                <p>{state.currentTask.endCard}</p>
                <p> Now you can take on the next one! </p>
                <button className='hideHelp' 
                    onClick={e => {nextTask(e)}}>
                    Next</button>
            </div> 
        : <></>
        }
    
      {showHelp && !selection ?
            <div className='help'>
                { taskType === 'normal' ?
                <>
                    <h3>Tasks</h3>
                    <p>Here you get to play around with vectors and matrices to get them to match</p>
                    <p>Adjust either the matrix or vector to solve the task</p>
                    <p>The aim is to get the two vectors to match</p>
                </>

                : 
                <>
                    <h3>Multiply Matrices</h3>
                    <p>Here you get to play around with matrices to get them to match</p>
                    <p>Adjust the matrice you control to make the two sides match</p>
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