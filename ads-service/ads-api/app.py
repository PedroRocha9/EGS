from flask import Flask, jsonify, request
from uuid import uuid4
import json
import hashlib
from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = '/api/docs'  # URL for exposing Swagger UI (without trailing '/')
API_URL = '/static/swagger.json'  # Our API url (can of course be a local resource)

app = Flask(__name__)

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
        'password': data['password'],
        'ads': []
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
            for ad_id in user['ads']:
                for ad in ads:
                    if ad['id'] == ad_id:
                        temp_ad = {
                            'id': ad['id'],
                            'ad_type': ad['ad_type'],
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
    for ad in ads:
        if ad['id'] == ad_id:
            return jsonify({
                'ad_id': ad['id'],
                'ad_type': ad['ad_type'],
                'description': ad['description'],
                'pricing_model': ad['pricing_model'],
                'target_audience': ad['target_audience'],
                'ad_creative': ad['ad_creative'],
                'impressions': ad['impressions'],
                'clicks': ad['clicks']
            }), 200
        
    return jsonify({'message': 'Ad not found'}), 404

#Endpoint to track impressions and clicks for an ad
@app.route('/v1/track', methods=['POST'])
def track():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 401
    token = token.split(' ')[1]

    #check if user is consumer
    for user in users:
        if get_token(user) == token:
            if user['type'] != "C":
                return jsonify({'message': 'Advertisers not authorized'}), 401
        data = request.get_json()
        #validate data
        if 'ad_id' not in data or 'event' not in data:
            return jsonify({'message': 'Missing required data'}), 400
        for ad in ads:
            if str(ad['id']) == str(data['ad_id']):
                if data['event'] == 'impression':
                    ad['impressions'] += 1
                elif data['event'] == 'click':
                    ad['clicks'] += 1
                else:
                    return jsonify({'message': 'Invalid event'}), 400
                return jsonify({'message': 'Event tracked'}), 200

        return jsonify({'message': 'Ad not found'}), 404
    
    return jsonify({'message': 'Invalid token'}), 401

#Endpoint to get ads (location and age_range are optional)
@app.route('/v1/ads', methods=['GET', 'POST'])
def get_ads():
    
    #check if the request is a post or get
    if request.method == 'POST':
        #create a new ad
        token = request.headers.get('Authorization')
        if token is None:
            return jsonify({'message': 'Missing token'}), 401
        data = request.get_json()
        token = token.split(' ')[1]
        #check if user is advertiser
        for user in users:
            if get_token(user) == token:
                if user['type'] != "A":
                    return jsonify({'message': 'Consumers not authorized'}), 401
                #validate data body
                if 'ad_type' not in data or 'pricing_model' not in data or 'target_audience' not in data or 'ad_creative' not in data or 'description' not in data:
                    return jsonify({'message': 'Missing required data'}), 400
                
                #create new ad and add it to the user's ads
                new_id = len(ads) + 1
                new_ad = {
                    'id': new_id,
                    'ad_type': data['ad_type'],
                    'description': data['description'],
                    'pricing_model': data['pricing_model'],
                    'target_audience': data['target_audience'],
                    'ad_creative': data['ad_creative'],
                    "impressions": 0,
                    "clicks": 0
                }
                ads.append(new_ad)
                user['ads'].append(new_id)
                return jsonify({'id': new_id}), 201
        
        return jsonify({'message': 'Invalid token'}), 400
    
    else:
        #Get ads info
        token = request.headers.get('Authorization')
        if token is None:
            return jsonify({'message': 'Missing token'}), 401
        token = token.split(' ')[1]

        for user in users:
            if get_token(user) == token:
                if user['type'] == 'A':
                    return jsonify({'message': 'Advertisers unauthorized'}), 401
                
                location = request.args.get('location')
                age_range = request.args.get('age_range')

                if age_range not in age_groups:
                    return jsonify({'message': 'Invalid age range'}), 400

                ads_to_return = [] 
                for ad in ads:
                    if not location or ad['target_audience']['location'].lower() == location.lower():
                        if not age_range or ad['target_audience']['age_range'] == age_range:
                            temp_ad = {
                                'id': ad['id'],
                                'ad_type': ad['ad_type'],
                                'description': ad['description'],
                                'ad_creative': ad['ad_creative'],
                            }
                            ads_to_return.append(temp_ad)

                if len(ads_to_return) == 0:
                    return jsonify({'message': 'No ads found'}), 404
                return jsonify({'ads': ads_to_return}), 200
            
        return jsonify({'message': 'Invalid token'}), 401
        #TODO return javascript code to render the ads (or maybe just the ad info)
        #TODO maybe a limit on the number of ads returned
    
if __name__ == '__main__':
    app.run(debug=True)

