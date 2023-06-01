import os
from flask import Flask, redirect, url_for, session, request, jsonify, abort
import requests

# make a flask api to make a request to the 127.0.0.1:5000

app = Flask(__name__)



@app.route("/composer")
def composer():
    # make a request to the 127.0.0.1:5000/autenticate
    # and then return the id_token
    # return jsonify({"id_token": "id_token"})
    return redirect("http://127.0.0.1:5000/authenticate")

@app.route("/auth" , methods=["GET", "POST"])
def auth():
    return "ok"

  
if __name__ == "__main__":
    app.run(debug=True, port=5005)
