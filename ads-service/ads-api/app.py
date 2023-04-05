import math
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
)

app.register_blueprint(swaggerui_blueprint)

#Connect to the sqlite database
conn = sqlite3.connect('sql/database.db', check_same_thread=False)
cur = conn.cursor()


age_groups = ["youth", "adults", "seniors"]

#function to get the token of an user
def get_token(user):
    token = hashlib.sha256(str(user[0]).encode('utf-8')).hexdigest() + hashlib.sha256(str(user[2]).encode('utf-8')).hexdigest() \
        + hashlib.sha256(str(user[1]).encode('utf-8')).hexdigest()
    return token

def get_token_from_request(id, email, type):
    token = hashlib.sha256(str(id).encode('utf-8')).hexdigest() + hashlib.sha256(str(email).encode('utf-8')).hexdigest() \
        + hashlib.sha256(str(type).encode('utf-8')).hexdigest()
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
    

@app.route('/v1/ads/<int:ad_id>', methods=['DELETE', 'POST'])
def update_ad(ad_id=None):
    if request.method == 'POST':
        #validate data
        if ad_id is None:
            return jsonify({'message': 'Missing required data'}), 400
        
        ad = cur.execute("SELECT clicks FROM ads WHERE id = ?", (ad_id,)).fetchone()
        if (ad[3] == "CPC"):
            cur.execute("UPDATE ads SET clicks = ? WHERE id = ?", (ad[0] + 1, ad_id))
            conn.commit()
            return jsonify({'message': 'Ad clicked'}), 200
        else:
            return jsonify({'message': 'Ad not found'}), 404

    elif request.method == 'DELETE':
        token = request.headers.get('Authorization')
        if token is None:
            return jsonify({'message': 'Missing token'}), 401
        if ad_id is None:
            return jsonify({'message': 'Missing ad id'}), 400

        token = token.split(' ')[1]
        #check if user is advertiser
        users = cur.execute("SELECT * FROM users").fetchall()
        for user in users:
            if get_token(user) == token:
                if user[1] != "A":
                    return jsonify({'message': 'Consumers not authorized'}), 401
                #check if ad exists and if it belongs to the user
                ads = cur.execute("SELECT * FROM ads").fetchall()
                for ad in ads:
                    if ad[0] == ad_id and ad[4] == user[0]:
                        cur.execute("DELETE FROM ads WHERE id = ?", (ad_id,))
                        conn.commit()
                        return jsonify({'message': 'Ad deleted'}), 200
                    
                return jsonify({'message': 'Ad not found'}), 404
            
        return jsonify({'message': 'Invalid token'}), 401

#Endpoint to get ads (location and age_range are optional)
@app.route('/v1/ads', methods=['GET', 'POST'])
def get_ads():
    
    #check if the request is a post or get or delete
    if request.method == 'POST':
        data = request.get_json()
        token = token.split(' ')[1]
        #check if user is advertiser
        users = cur.execute("SELECT * FROM users").fetchall()
        for user in users:
            if get_token(user) == token:
                if user[1] != "A":
                    return jsonify({'message': 'Consumers not authorized'}), 401
                #validate data body
                if 'type' not in data or 'pricing_model' not in data or 'target_audience' not in data or 'ad_creative' not in data or 'description' not in data:
                    return jsonify({'message': 'Missing required data'}), 400
                
                #create new ad and add it to the user's ads
                new_id = cur.execute("SELECT MAX(id) FROM ads").fetchone()[0] + 1
                cur.execute("insert into ads (type, description, pricing_model, age_range, location, ad_creative, impressions, clicks, user) values (?, ?, ?, ?, ?, ?, ?, \?, ?)"\
                            , (data['type'], data['description'], data['pricing_model'], data['target_audience']['age_range'], data['target_audience']['location'], \
                               data['ad_creative'], 0, 0, user[0]))
                conn.commit()
                return jsonify({'id': new_id}), 201
        
        return jsonify({'message': 'Invalid token'}), 400
    
    elif request.method == 'GET':
        #Get request info
        location = request.args.get('location').lower()
        age_range = request.args.get('age_range')
        publisher_id = request.args.get('publisher_id')

        if publisher_id is None:
            return jsonify({'message': 'Missing required data'}), 400

        if age_range not in age_groups and age_range:
            return jsonify({'message': 'Invalid age range'}), 400

        if location is not None and age_range is not None:
            ads = cur.execute("SELECT * FROM ads WHERE location = ? AND age_range = ?", (location, age_range)).fetchall()
        elif location is not None:
            ads = cur.execute("SELECT * FROM ads WHERE location = ?", (location,)).fetchall()
        elif age_range is not None:
            ads = cur.execute("SELECT * FROM ads WHERE age_range = ?", (age_range,)).fetchall()
        else:
            ads = cur.execute("SELECT * FROM ads").fetchall()


        if len(ads) == 0:
            return jsonify({'message': 'No ads found'}), 404
        
        ads_to_return = []
        for ad in ads:
            js_code = render_template('ad_code.html', ad_id=ad[0], ad_creative=ad[6], ad_description=ad[2])
            ads_to_return.append(js_code)
            cur.execute("UPDATE ads SET impressions = ? WHERE id = ?", (ad[7] + 1, ad[0]))

        conn.commit()
        return jsonify({'ads': ads_to_return}), 200
                
    
    return jsonify({'message': 'Invalid request'}), 400
    

#Endpoint to create a new user account
@app.route('/v1/users', methods=['POST'])
def create_user():
    data = request.get_json()
    #validate data
    if 'name' not in data or 'email' not in data or 'password' not in data or 'type' not in data:
        return jsonify({'message': 'Missing required data'}), 400
    
    #check if email already exists
    emails = cur.execute("SELECT email FROM users").fetchall()
    for email in emails:
        if email[0] == data['email']:
            return jsonify({'message': 'Email already registered'}), 400

    #create new user
    new_id = cur.execute("SELECT MAX(id) FROM users").fetchone()[0] + 1
    token = get_token_from_request(new_id, data['email'], data['type'])
    cur.execute("INSERT INTO users (type, name, email, password, token) VALUES (?, ?, ?, ?, ?)", \
                 (data['type'], data['name'], data['email'], data['password'], token))

    conn.commit()
    return jsonify({'id': new_id}), 201

#Endpoint for authenticating an user
@app.route('/v1/login', methods=['POST'])
def login():
    data = request.get_json()
    #validate data
    if 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing required data'}), 400
    #check if email and password match
    cur.execute("SELECT * FROM users WHERE email = ? AND password = ?", (data['email'], data['password']))
    user = cur.fetchone()
    if user is not None:
        return jsonify({'token': get_token(user), 'id' : user[0], 'name': user[2], 'email': user[3], 'type': user[1]}), 200

    return jsonify({'message': 'Invalid email or password'}), 401

#Endpoint to get the user profile and their ads
@app.route('/v1/profile', methods=['GET'])
def get_profile():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 401
    token = token.split(' ')[1]
    users = cur.execute("SELECT * FROM users").fetchall()
    for user in users:
        if get_token(user) == token:
            user_ads = cur.execute("SELECT * FROM ads WHERE user = ?", (user[0],)).fetchall()
            print(user_ads)
            return jsonify({
                'id': user[0],
                'name': user[2],
                'email': user[3],
                'type': user[1],
                'ads': user_ads
            }), 200
        
    return jsonify({'message': 'Invalid token'}), 401

#Endpoint to get the analytics for an ad
@app.route('/v1/analytics/ad/<int:ad_id>', methods=['GET'])
def get_ad_analytics(ad_id):
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
    
    user = cur.execute("SELECT * FROM users WHERE token = ?", (token,)).fetchone()
    if user is None:
        return jsonify({'message': 'Invalid token'}), 401
    
    ad = cur.execute("SELECT * FROM ads WHERE id = ?", (ad_id,)).fetchone()
    if ad is None:
        return jsonify({'message': 'Ad not found'}), 404
    
    if ad[9] != user[0]:
        return jsonify({'message': 'Unauthorized'}), 401
    
    return jsonify({
        'model': ad[3],
        'impressions': ad[7],
        'clicks': ad[8],
        'ctr': round(ad[8]/ad[7]*100, 2)
    }), 200

#Endpoint to get the analytics for an advertiser
@app.route('/v1/analytics/advertiser/<int:adv_id>', methods=['GET'])
def get_user_analytics(adv_id):
    #validate data
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 401
    token = token.split(' ')[1]

    #check if user is advertiser
    if get_account_type(token) != "A":
        return jsonify({'message': 'Consumers unauthorized'}), 401

    if adv_id is None:
        return jsonify({'message': 'Missing required data'}), 400
    
    user = cur.execute("SELECT * FROM users WHERE token = ? AND id = ?", (token, adv_id)).fetchone()
    if user is None:
        return jsonify({'message': 'Invalid token or ID'}), 401
    
    ads = cur.execute("SELECT * FROM ads WHERE user = ?", (adv_id,)).fetchall()
    if ads is None:
        return jsonify({'message': 'No ads found'}), 404

    #get the highest impression ad
    highest_impression_ad = cur.execute("SELECT * FROM ads WHERE user = ? ORDER BY impressions DESC LIMIT 1", (adv_id,)).fetchone()

    #get the highest click ad
    highest_click_ad = cur.execute("SELECT * FROM ads WHERE user = ? ORDER BY clicks DESC LIMIT 1", (adv_id,)).fetchone()

    #get the total impressions
    total_impressions = cur.execute("SELECT SUM(impressions) FROM ads WHERE user = ?", (adv_id,)).fetchone()[0]

    #get the total clicks
    total_clicks = cur.execute("SELECT SUM(clicks) FROM ads WHERE user = ?", (adv_id,)).fetchone()[0]

    #get the total ctr as a float with 2 decimal places
    total_ctr = round(total_clicks/total_impressions*100, 2)

    return jsonify({
        'highest_impression_ad': {
            'id': highest_impression_ad[0],
            'description': highest_impression_ad[2],
            'model': highest_impression_ad[3],
            'impressions': highest_impression_ad[7],
            'clicks': highest_impression_ad[8],
            'ctr': round(highest_impression_ad[8]/highest_impression_ad[7]*100, 2)
        },
        'highest_click_ad': {
            'id': highest_click_ad[0],
            'description': highest_click_ad[2],
            'model': highest_click_ad[3],
            'impressions': highest_click_ad[7],
            'clicks': highest_click_ad[8],
            'ctr': round(highest_click_ad[8]/highest_click_ad[7]*100, 2)
        },
        'total_impressions': total_impressions,
        'total_clicks': total_clicks,
        'total_ctr': total_ctr,
        'number_of_ads': len(ads)
    }), 200


if __name__ == '__main__':
    app.run(debug=True)
