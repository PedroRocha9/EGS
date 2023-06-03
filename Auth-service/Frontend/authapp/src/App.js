import google from './images/google.png';
import twitter from './images/twitter.png';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Thx from './Thx.js';
import Open from './Open.js';
import Register from './Register.js';

function App() {
  axios.get('https://accounts.google.com/o/oauth2/auth', {
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
})
  return (
      <div className='App'>
       <Router>
          <Routes>
              <Route exact path="/" element={<Open/>}/>
              <Route path="/thx" element={<Thx/>}/>
              <Route path="/Register" element={<Register/>}/>
          </Routes>
       </Router>
      </div>
  );
}

export default App;
