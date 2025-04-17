from flask import Flask, render_template, request, jsonify,url_for,Response
import requests
from dotenv import load_dotenv
import google.generativeai as genai 
import os
import sys
import re
import pandas as pd
from Demo import predict_disease_from_symptom
from medicine import search_medicine

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Load API keys from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/symptom', methods=['POST'])
def symptom():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        symptoms_selected = data.get("symptoms", [])
        if not symptoms_selected:
            return jsonify({"error": "No symptoms provided"}), 400

        predictions = predict_disease_from_symptom(symptoms_selected)
        if predictions.get("error"):
            return jsonify({"error": "Prediction error occurred"}), 500
            
        return jsonify(predictions)
    except Exception as e:
        app.logger.error(f"Error in /symptom: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/search', methods=['GET'])
def search():
    try:
        query = request.args.get("query", "")
        if not query.strip():
            return jsonify({"error": "No search query provided"}), 400

        results = search_medicine(query)
        return jsonify(results)
    except Exception as e:
        app.logger.error(f"Error in /search: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/careConnect')
def careConnect():
    return render_template('careConnect.html')

@app.route('/cycleSync')
def cycleSync():
    return render_template('cycleSync.html')

@app.route('/healthQuest')
def healthQuest():
    return render_template('healthQuest.html')

@app.route('/mediTrack')
def mediTrack(): 
    return render_template('mediTrack.html')

@app.route('/formdemo')
def formdemo():
    return render_template('formdemo.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/vitalCert')
def vitalCert():
    return render_template('vitalCert.html')

@app.route('/prediction-result')
def prediction_result():
    return render_template('prediction-result.html')

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

@app.route('/chat', methods=['POST'])
def chat_with_gemini():
    try:
        data = request.get_json()
        user_prompt = data.get("prompt", "")
        if not user_prompt:
            return jsonify({"error": "No prompt provided"}), 400

        model = genai.GenerativeModel("gemini-1.5-pro")
        chat = model.start_chat(history=[
            {"role": "user", "parts": [{"text": "Hello, You will answer to my prompts."}]},
            {"role": "model", "parts": [{"text": "Great to meet you. What would you like to know?"}]}
        ])
        response = chat.send_message(user_prompt)
        return jsonify({"response": response.text})
    except Exception as e:
        app.logger.error(f"Gemini chat error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/maps-script')
def maps_script():
    if not GOOGLE_MAPS_API_KEY:
        return jsonify({"error": "API key not found"}), 500
    
    # Instead of returning the API key, create a proxy route for the Google Maps API
    proxy_url = url_for('google_maps_proxy', _external=True)
    return jsonify({"scriptUrl": proxy_url})

@app.route('/google-maps-proxy')
def google_maps_proxy():
    # This endpoint will proxy the request to Google Maps API
    libraries = request.args.get('libraries', 'places')
    callback = request.args.get('callback', 'initMap')
    
    # Fetch the Google Maps script with your server-side API key
    google_maps_url = f"https://maps.googleapis.com/maps/api/js?key={GOOGLE_MAPS_API_KEY}&libraries={libraries}&callback={callback}"
    
    try:
        response = requests.get(google_maps_url)
        return Response(
            response.content,
            status=response.status_code,
            content_type='application/javascript'
        )
    except Exception as e:
        app.logger.error(f"Error proxying Google Maps API: {str(e)}")
        return "console.error('Failed to load Google Maps');", 500, {'Content-Type': 'application/javascript'}
