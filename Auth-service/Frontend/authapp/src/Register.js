import React from "react";
import './Register.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

function Register(){

    const postData = () => {
        // check if input is empty
        if(document.getElementById('fname').value == "" || document.getElementById('password').value == "" || document.getElementById('email').value == ""){
            toast.error("Please fill in all the fields");
            return;
        }
        axios.post('http://localhost:5000/registerSubmit', {
            // get info from input
            username: document.getElementById('fname').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value
            }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function (response) {
            console.log(response);
            if(response.status == 200){
                success();
                // delay redirect
                setTimeout(redirect, 2000);
            }
            else{
                erro();
            }

        }
        )
        .catch(function (error) {
        }
        );
    }

    const redirect = () => {
        window.location.href = 'http://127.0.0.1:3000';
    }

    const success = () => toast.success("You have successfully registered");
    const erro = () => toast.error("Wrong username or password");


    return (
        <div className="App">
            <ToastContainer />
        <div className='box'>
            <h1 className='header'>Mixit Register Service</h1>
            <label for="fname"></label>
            <input type="text" id="fname" name="firstname" placeholder="Username"></input>
            <label for="lname"></label>
            <input type="password" id="password" name="password" placeholder="Your password"></input>
            <label for="lname"></label>
            <input type="text" id="email"name="email" placeholder="Your email"></input>
                <div className='Register'onClick={postData}>Register</div>

        </div>
      </div>
    );

}

export default Register;