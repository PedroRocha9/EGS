from flask import Flask, jsonify, request, render_template_string, render_template
from uuid import uuid4
import json
import hashlib
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS
import sqlite3

SWAGGER_URL = '/api/docs'  # URL for exposing Swagger UI (without trailing '/')
API_URL = '/static/swagger.json'  # Our API url (can of course be a local resource)

app = Flask(__name__)
CORS(app)

# Call factory function to create our blueprint
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,  # Swagger UI static files will be mapped to '{SWAGGER_URL}/dist/'
    API_URL,
    config={  # Swagger UI config overrides
        'app_name': "Advertisement service"
    },
    # oauth_config={  # OAuth config. See https://github.com/swagger-api/swagger-ui#oauth2-configuration .
    #    'clientId': "your-client-id",
    #    'clientSecret': "your-client-secret-if-required",
    #    'realm': "your-realms",
    #    'appName': "your-app-name",
    #    'scopeSeparator': " ",
    #    'additionalQueryStringParams': {'test': "hello"}
    # }
)

app.register_blueprint(swaggerui_blueprint)

#Connect to the sqlite database
conn = sqlite3.connect('sql/database.db')
cur = conn.cursor()

#Dummy data
with open('ads.json', 'r') as f:
    ads_data = json.load(f)

ads = ads_data['ads']

with open('users.json', 'r') as f:
    users_data = json.load(f)

users = users_data['users']

age_groups = ["youth", "adults", "seniors"]

#function to get the token of an user
def get_token(user):
    token = hashlib.sha256(str(user['id']).encode('utf-8')).hexdigest() + hashlib.sha256(str(user['email']).encode('utf-8')).hexdigest() \
        + hashlib.sha256(str(user['type']).encode('utf-8')).hexdigest()
    return token

#function to get the account type of an user from the token
def get_account_type(token):
    #get only the last 64 characters of the token
    token = token[-64:]
    if token == hashlib.sha256(str("A").encode('utf-8')).hexdigest():
        return "A"
    elif token == hashlib.sha256(str("C").encode('utf-8')).hexdigest():
        return "C"
    else:
        return "Internal error"
    

#Endpoint to create a new user account
@app.route('/v1/users', methods=['POST'])
def create_user():
    data = request.get_json()
    #validate data
    if 'name' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing required data'}), 400
    
    #check if email already exists
    for user in users:
        if user['email'] == data['email']:
            return jsonify({'message': 'Email already exists'}), 400

    type = data['type']

    #create new user
    new_id = len(users) + 1
    new_user = {
        'id': new_id,
        "type": type,
        'name': data['name'],
        'email': data['email'],
        'password': data['password']
    }
    users.append(new_user)
    return jsonify({'id': new_id}), 201

#Endpoint for authenticating an user
@app.route('/v1/login', methods=['POST'])
def login():
    data = request.get_json()
    #validate data
    if 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing required data'}), 400
    #check if email and password match
    for user in users:
        if user['email'] == data['email'] and user['password'] == data['password']:
            token = get_token(user)
            return jsonify({'token': token}), 200
    
    return jsonify({'message': 'Invalid email or password'}), 401

#Endpoint to get the user profile and their ads
@app.route('/v1/profile', methods=['GET'])
def get_profile():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 401
    token = token.split(' ')[1]
    for user in users:
        if get_token(user) == token:
            user_ads = []
            for ad in ads:
                if ad['user'] == user['id']:
                    temp_ad = {
                        'id': ad['id'],
                        'type': ad['type'],
                        'description': ad['description'],
                        'ad_creative': ad['ad_creative'],
                    }
                    user_ads.append(temp_ad)
            return jsonify({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'type': user['type'],
                'ads': user_ads
            }), 200
        
    return jsonify({'message': 'Invalid token'}), 401

#Endpoint to get the analytics for an ad
@app.route('/v1/analytics/<int:ad_id>', methods=['GET'])
def get_analytics(ad_id):
    #validate data
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 401
    token = token.split(' ')[1]

    #check if user is advertiser
    if get_account_type(token) != "A":
        return jsonify({'message': 'Consumers unauthorized'}), 401

    if ad_id is None:
        return jsonify({'message': 'Missing required data'}), 400
    
    for user in users:
        if get_token(user) == token:
            for ad in ads:
                if ad['id'] == ad_id and ad['user'] == user['id']:
                    return jsonify({
                        'ad_id': ad['id'],
                        'type': ad['type'],
                        'description': ad['description'],
                        'pricing_model': ad['pricing_model'],
                        'target_audience': ad['target_audience'],
                        'ad_creative': ad['ad_creative'],
                        'impressions': ad['impressions'],
                        'clicks': ad['clicks'],
                        'advertiser': ad['user']
                    }), 200
        
    return jsonify({'message': 'Ad not found'}), 404

@app.route('/v1/ads/<int:ad_id>', methods=['DELETE', 'POST'])
def update_ad(ad_id=None):
    if request.method == 'POST':
        #validate data
        if ad_id is None:
            return jsonify({'message': 'Missing required data'}), 400
        for ad in ads:
            if str(ad['id']) == str(ad_id):
                if ad['pricing_model'] == 'CPC':
                    ad['clicks'] += 1
                return jsonify({'message': 'Event tracked'}), 200

        return jsonify({'message': 'Ad not found'}), 404

    return jsonify({'message': 'Not implemented'}), 501

#Endpoint to get ads (location and age_range are optional)
@app.route('/v1/ads', methods=['GET', 'POST'])
def get_ads():
    
    #check if the request is a post or get or delete
    if request.method == 'POST':
        data = request.get_json()
        token = token.split(' ')[1]
        #check if user is advertiser
        for user in users:
            if get_token(user) == token:
                if user['type'] != "A":
                    return jsonify({'message': 'Consumers not authorized'}), 401
                #validate data body
                if 'type' not in data or 'pricing_model' not in data or 'target_audience' not in data or 'ad_creative' not in data or 'description' not in data:
                    return jsonify({'message': 'Missing required data'}), 400
                
                #create new ad and add it to the user's ads
                new_id = len(ads) + 1
                new_ad = {
                    'id': new_id,
                    'type': data['type'],
                    'description': data['description'],
                    'pricing_model': data['pricing_model'],
                    'target_audience': data['target_audience'],
                    'ad_creative': data['ad_creative'],
                    "impressions": 0,
                    "clicks": 0,
                    'user': user['id']
                }
                ads.append(new_ad)
                return jsonify({'id': new_id}), 201
        
        return jsonify({'message': 'Invalid token'}), 400
    
    elif request.method == 'GET':
        #Get request info
        location = request.args.get('location')
        age_range = request.args.get('age_range')
        publisher_id = request.args.get('publisher_id')

        if publisher_id is None:
            return jsonify({'message': 'Missing required data'}), 400

        if age_range not in age_groups and age_range:
            return jsonify({'message': 'Invalid age range'}), 400

        ads_to_return = [] 
        for ad in ads:
            if not location or ad['target_audience']['location'].lower() == location.lower():
                if not age_range or ad['target_audience']['age_range'] == age_range:
                    js_code = render_template('ad_code.html', ad_id=ad['id'], ad_creative=ad['ad_creative'], ad_description=ad['description'])
                    ad['impressions'] += 1
                    ads_to_return.append(js_code)

        if len(ads_to_return) == 0:
            return jsonify({'message': 'No ads found'}), 404
        return jsonify({'ads': ads_to_return}), 200
                

    elif request.method == 'DELETE':
        token = request.headers.get('Authorization')
        if token is None:
            return jsonify({'message': 'Missing token'}), 401
        if ad_id is None:
            return jsonify({'message': 'Missing ad id'}), 400

        token = token.split(' ')[1]
        #check if user is advertiser
        for user in users:
            if get_token(user) == token:
                if user['type'] != "A":
                    return jsonify({'message': 'Consumers not authorized'}), 401
                #check if ad exists and if it belongs to the user
                for ad in ads:
                    if str(ad['id']) == str(ad_id) and ad['user'] == user['id']:
                        print("found ad")
                        ads.remove(ad)
                        return jsonify({'message': 'Ad deleted'}), 200
                    
                return jsonify({'message': 'Ad not found'}), 404
            
        return jsonify({'message': 'Invalid token'}), 401
    
    return jsonify({'message': 'Invalid request'}), 400
    
if __name__ == '__main__':
    app.run(debug=True)

