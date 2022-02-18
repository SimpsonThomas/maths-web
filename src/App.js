import './App.css';
import Canvas from './Components/canvas';
import Basic from './Components/basicCanvas';
import React, { useState } from "react";

const App = props => {
  const [display, setDisplay] = useState('start')
  let canvasProps = {background:'white',major:'red',minor:'black'}
  return (
    <div className="App">
      <div className='navBar'>
        <span className='navTitle'>Linear Algebra</span>
        {display === 'start' ? <button className='rightNavButton navButton' 
          onClick={e => {e.preventDefault(); setDisplay('start2')}}>
            Next</button> :<></>}
        {display === 'start2' ? <button className='leftNavButton navButton' 
          onClick={e => {e.preventDefault(); setDisplay('start')}}>
            Back</button> :<></>}
      </div>
      {display === 'start' ? <Basic className ='canvas' props={canvasProps}/> :<></>}
      {display === 'start2' ? <Canvas className ='canvas' props={canvasProps}/> :<></>}
    </div>
  );
}

export default App;
