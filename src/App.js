import './App.css';
import Canvas from './Components/canvas';
import Basic from './Components/basicCanvas';
import React, { useEffect, useReducer, useState } from "react";
import Tasks from './Components/activities/Tasks';
import { gridProps } from './Components/constants/constants';
import { inverseTasks, tasksNormal } from './Components/constants/tasksList';
import { calculateAngleMatrix, checkSolve, matMult } from './Components/canvasComponents';
//import Canvas3D from './Components/3dcanvas';

const App = props => {
  let localStore = window.localStorage

  const APP_VERSION = process.env.REACT_APP_CURRENT_GIT_SHA;

  if (typeof localStorage.APP_VERSION === 'undefined' || localStorage.APP_VERSION === null) {
      localStorage.setItem('APP_VERSION', APP_VERSION);
  }

  if (localStorage.APP_VERSION !== APP_VERSION) {
      localStorage.clear();
  }


  // changes canvas when we resize the window
  const [windowSize, setWindowSize] = useState({ // resize the canvas when the window resizes via state
    width: undefined,
    height: undefined,
    oldSize: undefined,
  })

  // useEffect for resizging
  useEffect(() => {
    function handleResize() {
      setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
          oldSize: windowSize
      })
  }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize',handleResize)
  })


  // scroll state
  const [scrollLevel, setScroll] = useState(1)

  // scroll setter
  useEffect(() => {
    function handleScroll(e) {
      let delta = e.wheelDeltaY*0.001
      let current = scrollLevel
      let newScroll = current + delta
      newScroll = Math.min(Math.max(0.1, newScroll), 4)
      setScroll(newScroll)
    }

    var canvasLists = document.getElementsByClassName("canvas")
    for (let i =0;i<canvasLists.length;i++) {
      canvasLists[i].addEventListener('wheel', handleScroll)
    }

    return () => {
      for (let i =0;i<canvasLists.length;i++) {
        canvasLists[i].removeEventListener('wheel', handleScroll)
      }
    }
  })

  // touch input detecter - Not currently used
  /*useEffect(() => {
    function touchHandler(e) {
    }
    window.addEventListener("touchstart", touchHandler, false);
  })*/

  // activity selector
  let activityStart
  // change activity depending on where we are running the app
  switch(process.env.NODE_ENV){
    case 'production':
      activityStart = {set:'Introduction', selection: false}
      break;
    case 'development':
      activityStart = {set:'Introduction', selection: false}
      break;
    default:
      activityStart = {set:'Introduction', selection: false}
  }
  // storing the current display activity in localstorage
  if (!window.localStorage.getItem('screen')) window.localStorage.setItem('screen', JSON.stringify(activityStart))
  activityStart = JSON.parse( localStore.getItem('screen'))
  const [activity, setActivity] = useState(activityStart)
  useEffect(() => {
    window.localStorage.setItem('screen', JSON.stringify(activity))
  }, [activity])
  

  // leaving the activity menu when esc is pressed
  useEffect(() => {
    function handleKeypress(e) {
      if (e.key === 'Escape') {
        setActivity({...activity,
          selection: false
        })
      }
    }
    if (activity.selection) window.addEventListener('keydown', handleKeypress)
    return () => window.removeEventListener('keydown', handleKeypress)
  })

  let initialStateCanvas = {
    matrix: {'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'},
    vector: {'x':0, 'y':0, old:{'x':0,'y':0}, 'change': 'done'},
    angle: { 'angle':{'x':0, 'y':0}, 'scale' : {'x':1, 'y':1} },
    eigen: false
  }

  if (!window.localStorage.getItem('canvasState')) window.localStorage.setItem('canvasState', JSON.stringify(initialStateCanvas))

  initialStateCanvas = JSON.parse( localStore.getItem('canvasState'))

  const [matrix, setMatrix] = useState( initialStateCanvas.matrix )
  const [vector, setVector] = useState( initialStateCanvas.vector ) 
  const [scaleAngle, setScaleAngle] = useState( initialStateCanvas.angle )
  const [showEigen, setShowEigen] = useState(initialStateCanvas.eigen)

  useEffect(() => {
    let saveState = {
      matrix: matrix,
      vector: vector,
      angle: scaleAngle,
      eigen: showEigen,
    }
    window.localStorage.setItem('canvasState', JSON.stringify(saveState))
  }, [matrix, vector, scaleAngle, showEigen])

  let canvasState = {'matrix': [matrix, setMatrix], 'vector': [vector, setVector], 'scaleAngle':[scaleAngle, setScaleAngle], 'eigen': [showEigen, setShowEigen],}

  // creating tasks reducer state
  const reducerTask = (state, action) => {
    let solve = false
    let taskType = state.taskType
    let tasks =  taskType === 'normal' ? tasksNormal : inverseTasks
    let mat
    if (!['task', 'switchMat'].includes(action.type)) {
        switch (taskType) {
            case 'normal' :
                let vec_start = {...state.vecStart, ...action.data}
                let vec_end = {'x':state.vecEnd.x,'y':state.vecEnd.y}
                mat = !state.matrix.angleMat ? state.matrix.new
                  : calculateAngleMatrix({...state.matrix, ...action.data}).slice(-4)
                solve = checkSolve(mat, state.matrixEnd.new, vec_start, vec_end)
                tasks = tasksNormal
                break;
            case 'inverse':
                mat = !state.matrix.angleMat ? action.data.new
                  : calculateAngleMatrix({...state.matrix, ...action.data}).slice(-4)
                let mult = matMult(state.matrixStart.new, mat)
                solve = mult.every((x, i) => state.matrixEnd.new[i] === x)
                tasks = inverseTasks
                break;
            default:
                solve = false;
                break;
        }
    }
    switch (action.type) {
        case 'switchMat':
          return {...state, matrix: {...state.matrix, angleMat:!state.matrix.angleMat}}
        case 'matrix':
            return {...state, matrix: {...state.matrix, ...action.data}, solve:solve}
        case 'matrixAng':
            return {...state, matrix: {...action.data}, solve:solve}
        case 'switchVec':
          return {...state, vecStart: {...state.vecStart, angleVec:!state.vecStart.angleVec}, solve:solve}
        case 'vector':
            return {...state, vecStart: {...state.vecStart,...action.data}, solve:solve}
        case 'task':
            let nextTaskNo = state.currentTask.num+1
            if (!Object.keys(tasks).includes(nextTaskNo.toString() ) ) nextTaskNo = 1
            let nextTask = tasks[nextTaskNo]
            let newState = {
                ...state,
                currentTask:{num:nextTaskNo,type:nextTask.type, description:nextTask.description,endCard:nextTask.endCard},
            }
            switch (taskType) {
                case 'normal':
                    newState = {...newState,
                        matrix:{...state.matrix,'new':nextTask.startMat, 'old':nextTask.startMat, 'change':'done', angle: {x:0,y:0}, scale:{x:1,y:1},
                         angleMat: nextTask.type === 'vec' ? false : state.matrix.angleMat},
                        matrixEnd:{'new':nextTask.endMat, 'old':nextTask.endMat, 'change':'done'},
                        vecStart:{...nextTask.startVec, 'old':nextTask.startVec, 'change':'done', angle:45, scale:1},
                        vecEnd:{...nextTask.endVec, 'old':nextTask.endVec, 'change':'done'},
                        solve:false,
                    }
                    break;
                case 'inverse':
                    newState = {...newState,
                        matrixStart: {'new':nextTask.startMat, 'old':nextTask.startMat, 'change':'done', },
                        matrixEnd:{'new':nextTask.endMat, 'old':nextTask.endMat, 'change':'done'},
                        matrix:{'new':[1,0,0,1],'old':[1,0,0,1], 'change':'done',angle: {x:0,y:0}, scale:{x:1,y:1},
                        angleMat: nextTask.type === 'vec' ? false : state.matrix.angleMat},
                        //vecStart:{...nextTask.startVec, 'old':nextTask.startVec, 'change':'done'},
                        //vecEnd:{...nextTask.endVec, 'old':nextTask.endVec, 'change':'done'},
                        solve:false,
                    }
                    break;
                default:
                    break;
            }
            return newState
          case 'full':
            return {...action.data}
        default:
            return {...state}
    }
  }

  let initialStateNormal = {
    taskType: 'normal',
    matrix: {'new':tasksNormal[1].startMat,'old':tasksNormal[1].startMat, 'change':'done', angleMat: false, angle: {x:0,y:0}, scale:{x:1,y:1}},
    matrixEnd: {'new':tasksNormal[1].endMat,'old':tasksNormal[1].endMat, 'change':'done'},
    vecStart:{...tasksNormal[1].startVec, 'old':tasksNormal[1].startVec, 'change':'done', angleVec: false, angle:45, scale:1},
    vecEnd:{...tasksNormal[1].endVec, 'old':tasksNormal[1].endVec, 'change':'done'},
   // matrix: {'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'},
   // vector: {'x':5, 'y':5, old:{'x':0,'y':0}, 'change': 'done'},
    currentTask:{num:1, type:tasksNormal[1].type, description:tasksNormal[1].description,endCard:tasksNormal[1].endCard},
    solve: false
  }

  let initialStateInverse = {
    taskType: 'inverse',
    matrixStart: {'new':inverseTasks[1].startMat,'old':inverseTasks[1].startMat, 'change':'done',},
    matrix: {'new':[1,0,0,1],'old':[1,0,0,1], 'change':'done', angleMat: false, angle: {x:0,y:0}, scale:{x:1,y:1}},
    matrixEnd: {'new':inverseTasks[1].endMat,'old':inverseTasks[1].endMat, 'change':'done'},
    currentTask:{num:1, type:inverseTasks[1].type, description:inverseTasks[1].description,endCard:tasksNormal[1].endCard},
    solve: false
  }

  if (!window.localStorage.getItem('inverseState')) window.localStorage.setItem('inverseState', JSON.stringify(initialStateInverse))
  if (!window.localStorage.getItem('normalState')) window.localStorage.setItem('normalState', JSON.stringify(initialStateNormal))

  const [stateNormal, updateStateNormal] = useReducer(reducerTask, JSON.parse( localStore.getItem('normalState')))
  const [stateInverse, updateStateInverse] = useReducer(reducerTask, JSON.parse( localStore.getItem('inverseState')))

  useEffect(() => {
    window.localStorage.setItem('inverseState', JSON.stringify(stateInverse))
    window.localStorage.setItem('normalState', JSON.stringify(stateNormal))
  }, [stateNormal, stateInverse])

  let selectionProps = {...gridProps, state:canvasState, scroll:scrollLevel, activityBox:activity.selection, setActivity:setActivity}
  let canvasProps = {...gridProps, state:canvasState, scroll:scrollLevel, activityBox:activity.selection,setActivity:setActivity}
  selectionProps.selection = true
  canvasProps.selection = false

  const selectActivty = (e, type, select=false) => {
    e.preventDefault()
    setActivity({
      set: type,
      selection: select
    })
  }

  const activityButton = (Activity=Basic, name='Main', description='Testing testing testing 1231234', extraProps={}) => {
    return (
      <div className='selectionCanvas' key={name}>
        <button onClick={e => {selectActivty(e, name)}} className='selectionButton'>
          {name}
          <p className='activityDescription'>{description}</p>
          {React.createElement(
            Activity,
            {className: 'selectionCanvas', props:{...selectionProps, ...extraProps}, key:{name}},
            'Click Me'
          )}
        </button>
      </div>
    )
  }

  const activities = {
    'Introduction':{activityCanvas: Basic, name:'Introduction', description: 'The introduction task - here you see the effect the matrix has on the x and y vectors',},
    'Vector Tasks':{activityCanvas: Tasks, name:'Vector Tasks', description: 'Match the two vectors!',props:{taskType:'normal', state:[stateNormal, updateStateNormal]}},
   // '3D':{activityCanvas: Canvas3D, name:'3D', description: '3D Canvas'},
    'Matrix Multiply':{activityCanvas: Tasks, name:'Matrix Multiply', description: 'Get the two sides to match by multiplying matrices', props:{taskType:'inverse', state:[stateInverse, updateStateInverse]}},
    'Free play':{activityCanvas: Canvas, name:'Free play', description: 'Take your time and have some fun!'},
  }

  const nextActivity =  (e, type) => {
    e.preventDefault()
    let list = Object.keys(activities)
    let pos = list.indexOf(activity.set)
    setActivity({
      set: list[pos+(type === 'next' ? 1 : -1)],
      selection: false
    })
  }

  const zoomButton =(e, type) => {
    e.preventDefault()
    let newZoom = scrollLevel*100
    newZoom = type === 'out' ? newZoom + 10
      : type === 'in' ? newZoom - 10
      : type === 'reset' ? 100
      : newZoom
    newZoom = newZoom > 400 ? 400 
      : newZoom < 0 ? 0
      : newZoom
    setScroll(newZoom/100)
  }

  return (
    <div className="App">
      <div className='navBar'>
        <span className='buttonGroup zoomGroup'>
          <button className='zoomButton' onClick={(e => zoomButton(e,'in'))}>-</button>
          <button className='zoomButton' onClick={(e => zoomButton(e,'reset'))}>{Math.round(scrollLevel*100)}%</button>
          <button className='zoomButton' onClick={(e => zoomButton(e,'out'))}>+</button>
        </span>
        
        <button onClick={e => selectActivty(e, activity.set, !activity.selection)} className='navButton'>{activity.set}</button>
        <span className='buttonGroup navGroup'>
          {Object.keys(activities).indexOf(activity.set) > 0 ? 
            <button onClick={e => nextActivity(e, 'prev')} className='zoomButton'>Back</button>
            : <></>}
          {Object.keys(activities).indexOf(activity.set) < Object.keys(activities).length-1 ? 
            <button onClick={e => nextActivity(e, 'next')} className='zoomButton'>Next</button>
            : <></>}
        </span>
        {/*<button onClick={e => {window.localStorage.clear(); window.location.reload()}} className='navButton clear'>Reset App</button>*/}
      </div>
      { activity.selection ?
        <center className='selectionDiv'>
          <p className='selectionTitle'>Activity Selection</p>
          <div className='selectionMain'>
            {Object.keys(activities).map(key => {
              let act = activities[key]
              return(
                activityButton(act.activityCanvas, act.name, act.description, act.props)
              )
            })} 
          <br/>
          <a href='https://forms.gle/SubhWXcNm4yr3ia97' target="_blank" rel="noopener noreferrer" className='feedbackLink'><div className='selectionCanvas selectionButton' style={{width:'300px'}}>
              Feedback form
              <p className='activityDescription'>Click here to go through to the feedback form once the session is over</p>
          </div></a>   
          </div>
        </center>
        : <></>
      }
      <span className='mainSelection'>{(activity.set) ? 
        React.createElement(
          activities[activity.set].activityCanvas,
          {className:'canvas', props:{...canvasProps, ...activities[activity.set].props}, key:activity.set}
        )
        : <></>
      }</span>
    </div>
  );
}

export default App;