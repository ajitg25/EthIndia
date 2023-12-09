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

def gen_csv_json(text):
    # All synonyms of Testname
    print("helllo") 
    print(text)
    print("---------hello--------------")
    TestNameSimilar = ["Test Name","Investigation","Parameter"]

    # first row of csvFile 
    # fields = ['Test', 'Test Value', 'Unit', 'Range'] 
    rows = []

    # name of csv file 
    # filename = "labrep1api.csv"

    patient_details = {}
    json_data =""
    test_results = {}
    # print(text)
    flag = False
    for i in text:        
        if(len(i)<3):
            continue
        if(i[0]==' ' or i[0]=='  '):
            continue
        words_val = get_close_matches(i[0], TestNameSimilar)
        if words_val!=[]:
            flag = True
            continue
        
        print(flag)
        if flag== True:
            # print(i)
            i.remove('  ')
            if(len(i)==4):
                rows.append([i[0], i[1], i[2], i[3]])
                test_results[i[0]] = {
                    'value': i[1],
                    'unit': i[2],
                    'reference': i[3]
                }
        
            elif(len(i)==3):
                # print(i)
                if(re.findall(r"[-+]?(?:\d*\.*\d+)", i[1])!=[]):
                    rows.append([i[0], i[1]," ", i[2]])
                    test_results[i[0]] = {
                        'value':i[1],
                        'unit': " ",
                        'reference': i[2]
                    }
                else:
                    rows.append([i[0]," ",i[1], i[2]])
                    test_results[i[0]] = {
                        'value':" ",
                        'unit': i[1],
                        'reference': i[2]
                    }
        
            # with open(filename, 'w') as csvfile: 
            
            #     # creating a csv writer object 
            #     csvwriter = csv.writer(csvfile) 
                
            #     # writing the fields 
            #     csvwriter.writerow(fields) 
                
            #     # writing the data rows 
            #     csvwriter.writerows(rows)
            # print(test_results)
            patient_details['results'] = test_results
            json_data = json.dumps(patient_details, indent=4)
            
            # print(json_data)
            # with open('labrep1api.json', 'w') as outfile:
            #     outfile.write(json_data)
    # return jsonify({"fields": fields,"rows":rows})  #returning of csv in form of list
    # print(rows)
    print(json_data)
    return json_data  #returning json_data

def sort_coord(CoOrd):
    SortKey = sorted(CoOrd.keys())
    new_m = dict()
    new_n = dict()
    maxi = 0
    for i  in range(len(SortKey)):
        if(abs(SortKey[i][0]-maxi)<=10):
            new_m[SortKey[i][1]] = CoOrd[SortKey[i]]
        else:
            new_n[maxi] = new_m
            maxi = SortKey[i][0]
            new_m = {}
            new_m[SortKey[i][1]] = CoOrd[SortKey[i]] 

    SortNKeys = sorted(new_n.keys())
    textt = ""
    for i in range(len(SortNKeys)):
        SortNKeys_dic = new_n[SortNKeys[i]]
        SortedXY = sorted(SortNKeys_dic.keys())
        line = ""
        for j in range(len(SortedXY)):
            line += (SortNKeys_dic[SortedXY[j]].replace("\n"," ")) + "       "
        textt+=line+"\n"

    text = textt.splitlines()
    # print(text)
    for i in range(len(text)):
        text[i] = text[i].split("   ")
        text[i] = list(filter(lambda x: x != '', text[i]))

    print(text)
    print(".........................................................")
    return text

def get_coord(img,contours):
        
    # Looping through the identified contours
    # Then rectangular part is cropped and passed on
    # to pytesseract for extracting text from it
    # Extracted text is stored in a dictionary with the coordinates

    all_coord = dict()
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        
        # Drawing a rectangle on image
        rect = cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
        img = cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # Cropping the text block for giving input to OCR
        cropped = img[y:y + h, x:x + w]
        # print(cropped)
        # try:

        
        text = pytesseract.image_to_string(cropped)
        all_coord[(y,x)] = text
        # except:
        #     print("OK")
    cv2.imwrite("test.jpg", img)
    # cv2.imshow('Rectangle',img)
    # cv2.waitKey(0)
    # cv2.destroyWindow('Rectangle')
    print(all_coord)
    print("-----------------------------------------------------------")
    return all_coord

def img_process(img):
    # Preprocessing the image starts
    img = cv2.resize(img, (0, 0), fx = 1, fy = 1)
 
    # Convert the image to gray scale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Performing OTSU threshold
    ret, thresh1 = cv2.threshold(gray, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV)
    
    # Specify structure shape and kernel size.
    # Kernel size increases or decreases the area
    # of the rectangle to be detected.
    # A smaller value like (10, 10) will detect
    # each word instead of a sentence.
    rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (18, 18)) #18,18
    
    # Applying dilation on the threshold image
    dilation = cv2.dilate(thresh1, rect_kernel, iterations = 1)
    
    # Finding contours
    contours, hierarchy = cv2.findContours(dilation, cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)

    # getting coordinates of all the contours
    co_ord = get_coord(img,contours)
    
    # sorting the co-ordinates and then getting the text from those contours 
    text = sort_coord(co_ord)
    return text
    
    
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

