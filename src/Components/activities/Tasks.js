import React, { useEffect, useReducer, useRef, useState } from "react";
import '../canvas.css'
import './tasks.css'
import { checkSolve, drawLine, initaliseCanvas, matMult} from "../canvasComponents";

const Tasks = props => {
    const inherit = props.props
    const taskType = props.props.taskType ? props.props.taskType : 'none'
    //const [scaleAngle, setScaleAngle] = inherit.scaleAngle
    //const [showEigen, setShowEigen] = inherit.eigen

    // list of tasks to complete
    const tasksNormal = {
        1 : {type:'mat', startMat: [1,0,0,1], endMat: [1,0,0,1], startVec: {'x':1,'y':1}, endVec: {'x':5,'y':5}, 
            description: 'Can you scale the vector to match? ',
            endCard: 'Congratualations! Well done on completing the first task'},
        2 : {type:'vec', startMat: [2,0,0,2], endMat: [-1,0,0,-1], startVec: {'x':5,'y':5}, endVec: {'x':5,'y':5},
            description: 'Here you have both a scale and a reflection',
            endCard: ''},
        3 : {type:'mat', startMat: [3,0,0,1], endMat: [1,0,0,1], startVec: {'x':-5,'y':1}, endVec: {'x':-5,'y':5}, 
            description: 'Can you figure out the matrix to map this vector ',
            endCard: ''},
        4 : {type:'vec', startMat: [4,1,1,4], endMat: [1,0,0,1], startVec: {'x':1,'y':-5}, endVec: {'x':5,'y':-5}, 
            description: 'Can you figure out the matrix to map this vector ',
            endCard: ''},
    }

    // inverse tasks to be implemented
    const inverseTasks = {
        1 : {type:'inverse', startMat: [5,0,0,5], endMat: [1,0,0,1], 
            description: 'Can you inverse this matrix? ',
            endCard: 'Congratualations! Well done on completing the first task'},
        2 : {type:'inverse', startMat: [-4,0,0,4], endMat: [1,0,0,1], 
            description: '',
            endCard: ''},
        3 : {type:'inverse', startMat: [1,1,1,1], endMat: [1,0,0,1],
            description: 'Can you figure out the matrix to map this vector ',
            endCard: ''},
    }

    let tasks = taskType === 'normal' ? tasksNormal 
        : taskType === 'inverse' ? inverseTasks
        : tasksNormal

    let initialState = {}

    switch (taskType) {
        case 'normal':
            tasks = tasksNormal
            initialState = {
                matrix: {'new':tasks[1].startMat,'old':tasks[1].startMat, 'change':'done'},
                matrixEnd: {'new':tasks[1].endMat,'old':tasks[1].endMat, 'change':'done'},
                vecStart:{...tasks[1].startVec, 'old':tasks[1].startVec, 'change':'done'},
                vecEnd:{...tasks[1].endVec, 'old':tasks[1].endVec, 'change':'done'},
               // matrix: {'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'},
               // vector: {'x':5, 'y':5, old:{'x':0,'y':0}, 'change': 'done'},
                currentTask:{num:1, type:tasks[1].type, description:tasks[1].description},
                solve: false
            }
            break;
        case 'inverse':
            tasks = inverseTasks
            initialState = {
                matrixStart: {'new':tasks[1].startMat,'old':tasks[1].startMat, 'change':'done'},
                matrix: {'new':[1,0,0,1],'old':[1,0,0,1], 'change':'done'},
                matrixEnd: {'new':tasks[1].endMat,'old':tasks[1].endMat, 'change':'done'},
                currentTask:{num:1, type:tasks[1].type, description:tasks[1].description},
                solve: false
            }
            break;
        default:
            break
    }

    const reducer = (state, action) => {
        let solve = false
        if (action.type !== 'task') {
            switch (taskType) {
                case 'normal' :
                    let vec_start = {...state.vecStart, ...action.data}
                    let vec_end = {'x':state.vecEnd.x,'y':state.vecEnd.y}
                    solve = checkSolve(state.matrix.new, state.matrixEnd.new, vec_start, vec_end)
                    break;
                case 'inverse':
                    let mult = matMult(state.matrixStart.new, action.data.new)
                    solve = mult.every((x, i) => state.matrixEnd.new[i] === x)
                    break;
                default:
                    solve = false;
                    break;
            }
        }
        switch (action.type) {
            case 'matrix':
                return {...state, matrix: {...action.data}, solve:solve}
            case 'vector':
                return {...state, vecStart: {...state.vecStart,...action.data}, solve:solve}
            case 'task':
                let nextTaskNo = state.currentTask.num+1
                if (!Object.keys(tasks).includes(nextTaskNo.toString() ) ) nextTaskNo = 1
                let nextTask = tasks[nextTaskNo]
                let newState = {
                    ...state,
                    currentTask:{num:nextTaskNo,type:nextTask.type, description:nextTask.description},
                }
                switch (taskType) {
                    case 'normal':
                        newState = {...newState,
                            matrix:{'new':nextTask.startMat, 'old':nextTask.startMat, 'change':'done'},
                            matrixEnd:{'new':nextTask.endMat, 'old':nextTask.endMat, 'change':'done'},
                            vecStart:{...nextTask.startVec, 'old':nextTask.startVec, 'change':'done'},
                            vecEnd:{...nextTask.endVec, 'old':nextTask.endVec, 'change':'done'},
                            solve:false,
                        }
                        break;
                    case 'inverse':
                        newState = {...newState,
                            matrixStart: {'new':nextTask.startMat, 'old':nextTask.startMat, 'change':'done'},
                            matrixEnd:{'new':nextTask.endMat, 'old':nextTask.endMat, 'change':'done'},
                            matrix:{'new':[1,0,0,1],'old':[1,0,0,1], 'change':'done'},
                            //vecStart:{...nextTask.startVec, 'old':nextTask.startVec, 'change':'done'},
                            //vecEnd:{...nextTask.endVec, 'old':nextTask.endVec, 'change':'done'},
                            solve:false,
                        }
                        break;
                    default:
                        break;
                }
                return newState
            default:
                return {...state}
        }
    }

    const [state, updateState] = useReducer(reducer, initialState)

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
    }

    const selection = inherit.selection // are we in the selection window?

    const grid = (ctx,
        colourMinor=gridProps.minorAxColour,
        colourMinorSec=gridProps.minorAxSecColour,
        colourMajor=gridProps.majorAxColour,
        colourVector=gridProps.vectorColour,
        transform,
        disVector=state.vecStart) => { // creating the grid
            let gridSize = gridProps.size
            let width = ctx.canvas.width
            let height = ctx.canvas.height    
            ctx.save()
            for (let i=-10*Math.max(height/2,width/2); i*gridSize<=0; i++) {
                let colour = i%5 ===0 ? colourMinor : colourMinorSec
                colour = i===0 ? colourMajor : colour
                let lineWidth = i%5===0 ? 1.2 : 0.35
                lineWidth = i===0 ? 2 : lineWidth

                // x gridlines
                drawLine(ctx, {x:-50*width,y:i*gridSize}, {x:50*width,y:i*gridSize}, colour, transform, lineWidth)
                drawLine(ctx, {x:-50*width,y:-i*gridSize}, {x:50*width,y:-i*gridSize}, colour,transform, lineWidth)
                // y gridlines
                drawLine(ctx, {y:-50*height,x:i*gridSize}, {y:50*height,x:i*gridSize}, colour,transform, lineWidth)
                drawLine(ctx, {y:-50*height,x:-i*gridSize}, {y:50*height,x:-i*gridSize}, colour,transform, lineWidth)
            }

            // draw the vector
            drawLine(ctx, {x:0,y:0}, {x:disVector.x*gridSize, y:disVector.y*gridSize}, colourVector,transform, 2, 'test')
            ctx.restore()
    }

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
            mat[position] = parseInt(mat[position])+(change/5)*frameCount

            let vector={x:0,y:0}

            switch (taskType){
                case 'normal':
                    vector = vec.new
                    break;
                case 'inverse':
                    mat = matMult(state.matrixStart.new, mat)
                    break;
            }

            grid(context, gridProps.minorAxColour, gridProps.minorAxSecColour,gridProps.majorAxColour, gridProps.vectorColour,mat, vector)

            //if (showEigen) eigenVector(context,mat)
            if (frameCount===5) {
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
            gridColour={minor:gridProps.minorAxColour, major:gridProps.majorAxColour,minorSec:gridProps.minorAxSecColours}, 
            ) => {
                initaliseCanvas(context, canvas, backgroundColour)
                grid(context, gridColour.minor, gridColour.minorSec, gridColour.major, 'green',mat, disVector)
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
        render(context2, canvas2,state.matrixEnd.new, state.vecEnd, 'black', {minor:'white',major:'white',minorSec:'grey'})
        
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    })

    //const [switchMat, setSwitchMat] = useState(false)
    const [showHelp, setShowHelp] = useState(true)

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

    const vec = state.currentTask.type==='vec'

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
                <p>{state.currentTask.description}</p>
                <p> Now you can take on the next one! </p>
                <button className='hideHelp' 
                    onClick={e => {nextTask(e)}}>
                    Next</button>
            </div> 
        : <></>
        }
    
      {showHelp && !selection ?
            <div className='help'>
                <h3>Tasks</h3>
                <p>Here you get to play around with vectors and matrices to get them to match</p>
                <p>Adjust either the matrix or vector to solve the task</p>
                <p>The aim is to get the two vectors to match</p>
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