import os
from flask import Flask,render_template,request, flash,redirect,url_for
from werkzeug.utils import secure_filename 
import PIL
import numpy
import cv2
import pytesseract
import json
import re
from flask import jsonify
from waitress import serve
from difflib import get_close_matches


pytesseract.pytesseract.tesseract_cmd = "Tesseract-OCR//tesseract.exe"
tessdata_dir_config = '--tessdata-dir "Tesseract-OCR/tessdata"'

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            img = numpy.asarray(PIL.Image.open(file.stream))
            # img = cv2.imread(file.stream)
            print(img)
            text = img_process(img)
            # print(text)
            jsonData = gen_csv_json(text)

            if jsonData:
                return jsonData
            else:
                return "server returning null"
    else:
        return "server running/ no files uploaded"

@app.route('/')
def home():
    return "Hello"

if __name__ == "__main__":
    serve(app, host='0.0.0.0',port=5000,threads=2)

