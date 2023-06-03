import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './Thx.css'
import check from './images/check.png'




function Thx() {
  return (
    <div className="App">
        <img src={check} alt='check' className='check'/>
      <h1>Thank you for your submission</h1>
    </div>
  );
}

export default Thx;