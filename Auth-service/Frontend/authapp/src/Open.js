import google from './images/google.png';
import github from './images/github.png';
import './open.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Thx from './Thx.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Open(){
        // function to use axios to make a post with the data that the user has inputed
        const postData = () => {
          axios.post('http://localhost:5000/loginSubmit', {
            // get info from input
            username: document.getElementById('fname').value,
            password: document.getElementById('password').value
            }, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(function (response) {
            const data = response.data;
            // check the status code
            if(response.status === 200){
              // make a delay to show the toast
              success();
              setTimeout(redirectToJson(data[0]), 1000);
              
              
            }
          }
          )
          .catch(function (error) {
            console.log("erro"+error);
            erro();
          }
          );
        }
        // function to redirect to google auth
        const googleAuth = () => {
          window.location.href = 'http://192.168.0.98:5000';
        }
        const twitterAuth = () => {
          // go to Thx.js
          // url_for('github_login')
          window.location.href = 'http://127.0.0.1:5000/github';
        }

        const redirect = () => {
          window.location.href = 'http://127.0.0.1:3000/thx';
        }

        const redirectToJson = (data) => {
          window.location.href = 'http://127.0.0.1:5000/user-page?email='+data;
        }
        
        const success = () => toast.success("You have successfully registered");
        const erro = () => toast.error("Wrong username or password");
    return (
      <div className="App">
        <ToastContainer />
        <div className='box'>
            <h1 className='header'>Mixit Authentication Service</h1>
            <label for="fname"></label>
            <input type="text" id="fname" name="firstname" placeholder="Username"></input>
            <label for="lname"></label>
            <input type="password" id="password" name="lastname" placeholder="Password"></input>
            <div className='LoginRegisto'>
              <div className='Login_button'onClick={postData}>Login</div>
              <Link to='/Register' className='twitter_auth'>
              <div className='Registo'>Register</div>
              </Link>
            </div>  
            <div className='Auth_button'onClick={googleAuth}>
              <img src={google} alt='google' className='google'/>
              <div className='buttontittle'>Sign in with Google</div>
            </div>
            <div className='Auth_button' onClick={twitterAuth}>
              
                <img src={github} alt='twitter' className='twitter'/>
                <div className='buttontittle'>Sign in with Github</div>
            </div>
        </div>
        
      </div>
    );
}

export default Open;