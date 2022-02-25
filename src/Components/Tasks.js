import React, { useEffect, useReducer, useRef, useState } from "react";
import './canvas.css'
import './tasks.css'
import SettingsBox, {calculateAngleMatrix, calculateVectors, drawLine, drawLineArrow, initaliseCanvas} from "./canvasComponents";

const Tasks = props => {
    const inherit = props.props.state
    //const [matrix, setMatrix] = state.matrix
    //const [vector, setVector] = state.vector
    const [scaleAngle, setScaleAngle] = inherit.scaleAngle
    const [showEigen, setShowEigen] = inherit.eigen
    // creating local state values
    //const [saveMatrix, setSaveMatrix] = useState()
    const [currentTask, setCurrentTask] = useState(1)
    //const [matrix, setMatrix] = useState( {'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'} )
    //const [vector, setVector] = useState( {'new':{'x':5, 'y':5}, old:{'x':0,'y':0}, 'change': 'done'} ) 

    // tasks
    const tasks = {
        1 : {type:'mat', startMat: [1,0,0,1], endMat: [1,0,0,1], startVec: {'x':1,'y':1}, endVec: {'x':5,'y':5},},
        2 : {type:'vec', startMat: [2,0,1,1], endMat: [1,0,0,1], startVec: {'x':5,'y':5}, endVec: {'x':1,'y':5},},
        3 : {type:'mat', startMat: [3,0,0,1], endMat: [1,0,0,1], startVec: {'x':-5,'y':1}, endVec: {'x':-5,'y':5},},
        4 : {type:'vec', startMat: [4,2,1,1], endMat: [1,0,0,1], startVec: {'x':1,'y':-5}, endVec: {'x':5,'y':-5},},
    }

    

    let initialState = {
        matrixStart: {'new':tasks[1].startMat,'old':tasks[1].startMat, 'change':'done'},
        matrixEnd: {'new':tasks[1].endMat,'old':tasks[1].endMat, 'change':'done'},
        vecStart:{...tasks[1].startVec, 'old':tasks[1].startVec, 'change':'done'},
        vecEnd:{...tasks[1].endVec, 'old':tasks[1].endVec, 'change':'done'},
       // matrix: {'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'},
       // vector: {'x':5, 'y':5, old:{'x':0,'y':0}, 'change': 'done'},
        currentTask:{num:1, type:'mat'},
    }

    const reducer = (state, action) => {
        switch (action.type) {
            case 'matrix':
                return {...state, matrixStart: {...action.data}}
            case 'vector':
                return {...state, vecStart: {...state.vecStart,...action.data}}
            case 'task':
                let nextTaskNo = state.currentTask.num+1
                if (!Object.keys(tasks).includes(nextTaskNo.toString() ) ) nextTaskNo = 1
                let nextTask = tasks[nextTaskNo]
                return {
                    ...state,
                    currentTask:{num:nextTaskNo,type:'mat'},
                    matrixStart:{'new':nextTask.startMat, 'old':nextTask.startMat, 'change':'done'},
                    matrixEnd:{'new':nextTask.endMat, 'old':nextTask.endMat, 'change':'done'},
                    vecStart:{...nextTask.startVec, 'old':nextTask.startVec, 'change':'done'},
                    vecEnd:{...nextTask.endVec, 'old':nextTask.endVec, 'change':'done'},
                }
                
        }
        return {...state}
    }

    const [state, updateState] = useReducer(reducer, initialState)

    const canvas1Ref = useRef(null)
    const canvas2Ref = useRef(null)

    // basic props for the grid
    const gridProps = {
        size : 20, // size of grid squares
        startX: 15,
        startY: 15,
        majorAxColour: inherit.major, // default colours
        minorAxColour: inherit.minor, 
        backgroundColour: inherit.background,
        vectorColour: 'green'
    }

    const selection = inherit.selection // are we in the selection window?

    const grid = (ctx,
        colourMinor=gridProps.minorAxColour,
        colourMajor=gridProps.majorAxColour,
        colourVector=gridProps.vectorColour,
        transform=[1,0,0,1],
        disVector=state.vecStart) => { // creating the grid
        let gridSize = gridProps.size
        let width = ctx.canvas.width
        let height = ctx.canvas.height    
        ctx.save()
        for (let i=-10*Math.max(height/2,width/2); i*gridSize<=0; i++) {
            let colour = i%5 ===0 ? colourMinor : 'grey'
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
        drawLine(ctx, {x:0,y:0}, {x:disVector.x*gridSize, y:disVector.y*gridSize}, colourVector,transform, 2)
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

            grid(context, gridProps.minorAxColour, gridProps.majorAxColour, 'green',mat, vec.new)

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
            mat=[1,0,0,1],
            disVector={'x':0,'y':0},
            backgroundColour=gridProps.backgroundColour, 
            gridColour={minor:gridProps.minorAxColour, major:gridProps.majorAxColour}, 
            ) => {
                initaliseCanvas(context, canvas, backgroundColour)
                grid(context, gridColour.minor, gridColour.major, 'green',mat, disVector)
                //if (showEigen) eigenVector(context,mat)
        }

        let matrix = state.matrixStart

        let mat = (matrix.new[matrix.change] !=='') ? matrix.new
            : matrix.old

        if (matrix.change !== 'done' && matrix.new[matrix.change]!=='') {
            animate(context1, canvas1, matrix, state.vecStart)
        }
        else {
            render(context1, canvas1, mat, state.vecStart)
        }

        render(context2, canvas2,state.matrixEnd, state.vecEnd, 'black', {minor:'white',major:'white'})
        
        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    })

    //const [switchMat, setSwitchMat] = useState(false)
    const [showHelp, setShowHelp] = useState(false)

    const updateMatrix = (e, pos) => {
        e.preventDefault()
        let value = e.target.value
        let position = pos-1
        let matrix = state.matrixStart
        let oldMatrix = [matrix.new[0],matrix.new[1],matrix.new[2],matrix.new[3]]
        oldMatrix[position] = (oldMatrix[position] === '') ? matrix.old[position] : oldMatrix[position]
        let newMatrix = state.matrixStart.new
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
            <input className='matrixInput'  type="number" value={state.matrixStart.new[position-1] } key={position+'matrixInput'}
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

    const html = <>
        {!selection ? 
            <div className={'matrixBox ' + 'boxOpen'}>
                <p>{state.currentTask.num}</p>
                { state.currentTask.type ==='vec' ?
                    <>
                        <p className='boxTitle'>
                            Input Vector
                        </p>
                        <p style={{color:'white'}}>Input test vectors here to match the test vector</p>
                        <p><input className='matrixInput' value={state.vecStart.x} 
                                onChange={e => updateVec(e, 'x') }/></p>
                        <p><input className='matrixInput' value={state.vecStart.y} 
                                onChange={e => updateVec(e, 'y') }/></p>
                            <p>&nbsp;</p>
                    </>
                    : 
                    <>
                        <p className='boxTitle'>Set Matrix</p>
                        <p style={{color:'white'}}>Try changing the matrix to match the vectors</p>                        
                        <p>
                            {
                                [1,2].map(pos => numberInput(pos) )
                            }
                        </p>
                            {
                                [3,4].map(pos => numberInput(pos) )
                            }
                    </>
                }
                <p></p>
                <button className='quickChange' 
                    onClick={e => {nextTask(e)}}>
                    Next Task</button>
                <p>&nbsp;</p>
            </div>
            : <></>}
        <div className='canvas1'>
            <canvas ref={canvas1Ref} {...props}/>
        </div>
        <div className='canvas2'>
            <canvas ref={canvas2Ref} {...props}/>
        </div>
      {showHelp ?
            <div className='help'>
                <h3>Grid view</h3>
                <p> Now you've played around with the basis vector view we can now look 
                    at the grid view</p>
                <p>Here you can see the whole set of grid lines</p>
                <p>And again adjust the whole grid via the matrix set or the sliders (by clicking the angle buttons you can quickly change to set angles)</p>
                <p>But you can also set a vector and see how it gets translated</p>
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