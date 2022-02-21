import './App.css';
import Canvas from './Components/canvas';
import Basic from './Components/basicCanvas';
import React, { useState } from "react";

const App = props => {
  const [display, setDisplay] = useState('start2')
  let canvasProps = {background:'white',major:'red',minor:'black', selection:false}
  let selectionProps = {background:'white',major:'red',minor:'black', selection:true}

  const [activity, setActivity] = useState({set:'main', selection: true})

  const selectActivty = (e, type, select=false) => {
    e.preventDefault()
    setActivity({
      set: type,
      selection: select
    })
  }

  return (
    <div className="App">
      <div className='navBar'>
        <button onClick={e => selectActivty(e, activity.set, !activity.selection)} className='navButton'>Select Activity</button>
      </div>
      { activity.selection ?
        <center className='selectionDiv'>
          <p className='selectionTitle'>Activity Selection</p>
          <div className='selectionCanvas'>
            <button onClick={e => {selectActivty(e, 'initial')}} className='selectionButton'>
              Initial
              <Basic className='selectionCanvas' props={selectionProps}/>
            </button>
          </div>
          <p></p>

          <div className='selectionCanvas'>
            <button onClick={e => {selectActivty(e, 'main')}} className='selectionButton'>
              main
              <Canvas className='selectionCanvas' props={selectionProps}/>
            </button>
          </div>
          
        </center>
        : <></>
      }
      {activity.set === 'initial' ? <Basic className ='canvas' props={canvasProps}/> :<></>}
      {activity.set === 'main' ? <Canvas className ='canvas' props={canvasProps}/> :<></>}
    </div>
  );
}

export default App;
