import './App.css';
import Canvas from './Components/canvas';
import Basic from './Components/basicCanvas';
import React, { useReducer, useState } from "react";
import Tasks from './Components/activities/Tasks';
import { gridProps } from './Components/constants/constants';
import { inverseTasks, tasksNormal } from './Components/constants/tasksList';
import { checkSolve, matMult } from './Components/canvasComponents';
//import Canvas3D from './Components/3dcanvas';

const App = props => {
  const [matrix, setMatrix] = useState( {'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'} )
  const [vector, setVector] = useState( {'x':0, 'y':0, old:{'x':0,'y':0}, 'change': 'done'} ) 
  const [scaleAngle, setScaleAngle] = useState( { 'angle':{'x':0, 'y':0}, 'scale' : {'x':1, 'y':1} } )
  const [showEigen, setShowEigen] = useState(true)

  let canvasState = {'matrix': [matrix, setMatrix], 'vector': [vector, setVector], 'scaleAngle':[scaleAngle, setScaleAngle], 'eigen': [showEigen, setShowEigen]}

  console.log(process.env.NODE_ENV)

  let activityStart

  switch(process.env.NODE_ENV){
    case 'production':
      activityStart = {set:'Initial', selection: false}
      break;
    case 'development':
      activityStart = {set:'Inverse', selection: false}
      break;
    default:
      activityStart = {set:'Initial', selection: false}
  }

  // creating tasks reducer state
  const reducer = (state, action) => {
    let solve = false
    let tasks = {}
    let taskType = state.taskType
    if (action.type !== 'task') {
        switch (taskType) {
            case 'normal' :
                let vec_start = {...state.vecStart, ...action.data}
                let vec_end = {'x':state.vecEnd.x,'y':state.vecEnd.y}
                solve = checkSolve(state.matrix.new, state.matrixEnd.new, vec_start, vec_end)
                tasks = tasksNormal
                break;
            case 'inverse':
                let mult = matMult(state.matrixStart.new, action.data.new)
                solve = mult.every((x, i) => state.matrixEnd.new[i] === x)
                tasks = inverseTasks
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

  let initialStateNormal = {
    taskType: 'normal',
    matrix: {'new':tasksNormal[1].startMat,'old':tasksNormal[1].startMat, 'change':'done'},
    matrixEnd: {'new':tasksNormal[1].endMat,'old':tasksNormal[1].endMat, 'change':'done'},
    vecStart:{...tasksNormal[1].startVec, 'old':tasksNormal[1].startVec, 'change':'done'},
    vecEnd:{...tasksNormal[1].endVec, 'old':tasksNormal[1].endVec, 'change':'done'},
   // matrix: {'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'},
   // vector: {'x':5, 'y':5, old:{'x':0,'y':0}, 'change': 'done'},
    currentTask:{num:1, type:tasksNormal[1].type, description:tasksNormal[1].description},
    solve: false
  }

  let initialStateInverse = {
    taskType: 'inverse',
    matrixStart: {'new':inverseTasks[1].startMat,'old':inverseTasks[1].startMat, 'change':'done'},
    matrix: {'new':[1,0,0,1],'old':[1,0,0,1], 'change':'done'},
    matrixEnd: {'new':inverseTasks[1].endMat,'old':inverseTasks[1].endMat, 'change':'done'},
    currentTask:{num:1, type:inverseTasks[1].type, description:inverseTasks[1].description},
    solve: false
  }

  const [stateNormal, updateStateNormal] = useReducer(reducer, initialStateNormal)
  const [stateInverse, updateStateInverse] = useReducer(reducer, initialStateInverse)

  let selectionProps = {...gridProps, state:canvasState}
  let canvasProps = {...gridProps, state:canvasState}
  selectionProps.selection = true
  canvasProps.selection = false

  const [activity, setActivity] = useState(activityStart)

  const selectActivty = (e, type, select=false) => {
    e.preventDefault()
    setActivity({
      set: type,
      selection: select
    })
  }

  const activityButton = (Activity=Basic, name='Main', description='Testing testing testing 1231234', extraProps={}) => {
    return (
      <>
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
      </>
    )
  }

  const activities = {
    'Initial':{activityCanvas: Basic, name:'Initial', description: 'The initial basis vector changing calculator',},
    'Tasks':{activityCanvas: Tasks, name:'Tasks', description: 'Move the vector',props:{taskType:'normal', state:[stateNormal, updateStateNormal]}},
   // '3D':{activityCanvas: Canvas3D, name:'3D', description: '3D Canvas'},
    'Inverse':{activityCanvas: Tasks, name:'Inverse', description: 'Find the inverse of the matrix', props:{taskType:'inverse', state:[stateInverse, updateStateInverse]}},
    'Main':{activityCanvas: Canvas, name:'Main', description: 'Free play calculator'},
  }

  return (
    <div className="App">
      <div className='navBar'>
        <button onClick={e => selectActivty(e, activity.set, !activity.selection)} className='navButton'>Select Activity</button>
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
          </div>     
        </center>
        : <></>
      }
      {(activity.set) ? 
        React.createElement(
          activities[activity.set].activityCanvas,
          {className:'canvas', props:{...canvasProps, ...activities[activity.set].props}, key:activity.set}
        )
        : <></>
      }
    </div>
  );
}

export default App;
