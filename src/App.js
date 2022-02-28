import './App.css';
import Canvas from './Components/canvas';
import Basic from './Components/basicCanvas';
import React, { useState } from "react";
import Tasks from './Components/activities/Tasks';
//import Canvas3D from './Components/3dcanvas';
import Inverse from './Components/activities/Inverse';

const App = props => {
  const [matrix, setMatrix] = useState( {'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'} )
  const [vector, setVector] = useState( {'x':0, 'y':0, old:{'x':0,'y':0}, 'change': 'done'} ) 
  const [scaleAngle, setScaleAngle] = useState( { 'angle':{'x':0, 'y':0}, 'scale' : {'x':1, 'y':1} } )
  const [showEigen, setShowEigen] = useState(true)

  let canvasState = {'matrix': [matrix, setMatrix], 'vector': [vector, setVector], 'scaleAngle':[scaleAngle, setScaleAngle], 'eigen': [showEigen, setShowEigen]}

  //let canvasProps = {background:'white',major:'red',minor:'black', selection:false, state: canvasState}

  let gridProps = {
    size : 20, // size of grid squares
    majorAxColour: 'red', // default colours
    minorAxColour: 'black', 
    minorAxSecColour: 'grey',
    backgroundColour: 'white',
    vectorColour: 'yellow',
    state: canvasState,
}

  let selectionProps = {...gridProps}
  let canvasProps = {...gridProps}
  selectionProps.selection = true
  canvasProps.selection = false

  const [activity, setActivity] = useState({set:'Initial', selection: false})

  const selectActivty = (e, type, select=false) => {
    e.preventDefault()
    setActivity({
      set: type,
      selection: select
    })
  }

  const activityButton = (Activity=Basic, name='Main', description='Testing testing testing 1231234') => {
    return (
      <>
        <div className='selectionCanvas' key={name}>
          <button onClick={e => {selectActivty(e, name)}} className='selectionButton'>
            {name}
            <p className='activityDescription'>{description}</p>
            {React.createElement(
              Activity,
              {className: 'selectionCanvas', props:selectionProps, key:{name}},
              'Click Me'
            )}
          </button>
        </div>
      </>
    )
  }

  const activities = {
    'Initial':{activityCanvas: Basic, name:'Initial', description: 'The initial basis vector changing calculator'},
    'Tasks':{activityCanvas: Tasks, name:'Tasks', description: 'Move the vector'},
   // '3D':{activityCanvas: Canvas3D, name:'3D', description: '3D Canvas'},
    'Inverse':{activityCanvas: Inverse, name:'Inverse', description: 'Find the inverse of the matrix'},
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
                activityButton(act.activityCanvas, act.name, act.description)
              )
            })}     
          </div>     
        </center>
        : <></>
      }
      {(activity.set) ? 
        React.createElement(
          activities[activity.set].activityCanvas,
          {className:'canvas', props:canvasProps, key:activity.set}
        )
        : <></>
      }
    </div>
  );
}

export default App;
