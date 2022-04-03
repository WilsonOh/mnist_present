from flask import Flask, request
import numpy as np
import requests
import json
import os

path_to_static_files = os.path.abspath("../frontend/build")
app = Flask(__name__, static_url_path='/', static_folder=path_to_static_files)


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/submit", methods=['POST'])
def submit():
    response = request.get_json()
    image = response['image']
    version = response['version']
    if version:
        image = np.expand_dims(image, axis=(0, 3)).tolist()
    formatted_req = {
        "instances": image
    }
    r = requests.post(
        f"http://13.215.15.247:8501/v1/models/digit_recognition/versions/{version}:predict", data=json.dumps(formatted_req))
    prediction = r.json()
    print(prediction)
    return prediction


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
