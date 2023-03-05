from flask import Flask, jsonify, request
from uuid import uuid4
import json
import hashlib

app = Flask(__name__)

#Dummy data
with open('ads.json', 'r') as f:
    ads_data = json.load(f)

ads = ads_data['ads']

with open('advertisers.json', 'r') as f:
    advertisers_data = json.load(f)

advertisers = advertisers_data['advertisers']

#Endpoint to create a new advertiser account
@app.route('/advertisers', methods=['POST'])
def create_advertiser():
    data = request.get_json()
    #validate data
    if 'name' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing required data'}), 400
    
    #check if email already exists
    for advertiser in advertisers:
        if advertiser['email'] == data['email']:
            return jsonify({'message': 'Email already exists'}), 400

    #create new advertiser
    new_id = len(advertisers) + 1
    new_advertiser = {
        'id': new_id,
        'name': data['name'],
        'email': data['email'],
        'password': data['password'],
        'ads': []
    }
    advertisers.append(new_advertiser)
    return jsonify({'id': new_id}), 201

#Endpoint for authenticating an advertiser
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    #validate data
    if 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing required data'}), 400
    #check if email and password match
    for advertiser in advertisers:
        if advertiser['email'] == data['email'] and advertiser['password'] == data['password']:
            token = hashlib.sha256(str(advertiser['id']).encode('utf-8')).hexdigest()
            return jsonify({'token': token}), 200
    
    return jsonify({'message': 'Invalid email or password'}), 400

#Endpoint to get the advertiser profile and their ads
@app.route('/profile', methods=['GET'])
def get_profile():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 400
    print(token)
    for advertiser in advertisers:
        if hashlib.sha256(str(advertiser['id']).encode('utf-8')).hexdigest() == token:
            advertiser_ads = []
            for ad_id in advertiser['ads']:
                for ad in ads:
                    if ad['id'] == ad_id:
                        advertiser_ads.append(ad)
            return jsonify({
                'advertiser_id': advertiser['id'],
                'name': advertiser['name'],
                'email': advertiser['email'],
                'ads': advertiser_ads
            }), 200
        
    return jsonify({'message': 'Invalid token'}), 400

#Endpoint to create a new ad
@app.route('/new_ad', methods=['POST'])
def create_ad():
    token = request.headers.get('Authorization')
    if token is None:
        return jsonify({'message': 'Missing token'}), 400
    data = request.get_json()
    #validate data
    if 'ad_type' not in data or 'pricing_model' not in data or 'target_audience' not in data or 'ad_creative' not in data:
        return jsonify({'message': 'Missing required data'}), 400
    for advertiser in advertisers:
        if hashlib.sha256(str(advertiser['id']).encode('utf-8')).hexdigest() == token:
            new_id = len(ads) + 1
            new_ad = {
                'id': new_id,
                'ad_type': data['ad_type'],
                'pricing_model': data['pricing_model'],
                'target_audience': data['target_audience'],
                'ad_creative': data['ad_creative'],
                "impressions": 0,
                "clicks": 0
            }
            ads.append(new_ad)
            advertiser['ads'].append(new_id)
            return jsonify({'id': new_id}), 201
    
    return jsonify({'message': 'Invalid token'}), 400

#Endpoint to get the analytics for an ad
@app.route('/analytics/<int:ad_id>', methods=['GET'])
def get_analytics(ad_id):
    #validate data
    if ad_id is None:
        return jsonify({'message': 'Missing required data'}), 400
    for ad in ads:
        if ad['id'] == ad_id:
            return jsonify({
                'ad_id': ad['id'],
                'ad_type': ad['ad_type'],
                'pricing_model': ad['pricing_model'],
                'target_audience': ad['target_audience'],
                'ad_creative': ad['ad_creative'],
                'impressions': ad['impressions'],
                'clicks': ad['clicks']
            }), 200
        
    return jsonify({'message': 'Ad not found'}), 404

#Endpoint to track impressions and clicks for an ad
@app.route('/track', methods=['POST'])
def track():
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

#Endpoint to get ads (location and age_range are optional)
@app.route('/ads', methods=['GET'])
def get_ads():
    location = request.args.get('location')
    age_range = request.args.get('age_range')

    ads_to_return = [] 
    for ad in ads:
        if not location or ad['target_audience']['location'].lower() == location.lower():
            if not age_range or ad['target_audience']['age_range'] == age_range:
                ads_to_return.append(ad)

    if len(ads_to_return) == 0:
        return jsonify({'message': 'No ads found'}), 404

    return jsonify({'ads': ads_to_return}), 200
    #TODO return javascript code to render the ads
    #TODO maybe a limit on the number of ads returned
    
if __name__ == '__main__':
    app.run(debug=True)

