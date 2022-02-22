import './App.css';
import Canvas from './Components/canvas';
import Basic from './Components/basicCanvas';
import React, { useState } from "react";

const App = props => {
  const [matrix, setMatrix] = useState( {'new':{1:1,2:0,3:0,4:1}, 'old':{1:1,2:0,3:0,4:1}, 'change':'done'} )
  const [vector, setVector] = useState( {'x':0, 'y':0} ) 
  const [scaleAngle, setScaleAngle] = useState( { 'angle':{'x':0, 'y':0}, 'scale' : {'x':1, 'y':1} } )
  const [showEigen, setShowEigen] = useState(false)

  let canvasState = {'matrix': [matrix, setMatrix], 'vector': [vector, setVector], 'scaleAngle':[scaleAngle, setScaleAngle], 'eigen': [showEigen, setShowEigen]}

  let canvasProps = {background:'white',major:'red',minor:'black', selection:false, state: canvasState}

  let selectionProps = {background:'white',major:'red',minor:'black', selection:true, state: canvasState}

  const [activity, setActivity] = useState({set:'Main', selection: true})

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
    'Main':{activityCanvas: Canvas, name:'Main', description: 'Main free play calculator'},
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
