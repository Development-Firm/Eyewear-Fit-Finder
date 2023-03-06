from flask import Flask, request,jsonify
from PIL import Image
import numpy as np
import mediapipe as mp
import math
from flask_cors import CORS
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
        refine_landmarks = True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5)
app = Flask(__name__)
CORS(app)
@app.route('/measurement', methods=['POST'])
def measurement():
    print('HI')
    print("?????????????????????????????????????")
    x = request.files
    max_eye = 0
    max_fw = 0
    max_pd = 0
    max_nw = 0
    max_nl = 0
    max_ne = 0
    img_dist = 0.001
    print("hi")
    for i in x.listvalues():
        print("hi")
        c = Image.open(i[0])
        print("hi1")
        image = np.array(c)
        print("hi2")
        sh = image.shape
        print("hi3")
        h = sh[0]
        w = sh[1]
        # To improve performance, optionally mark the image as not writeable to
        # pass by reference.
        results = face_mesh.process(image)
        print("hi")
        # Draw the face mesh annotations on the image.
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks :
                l=[]
                for i in face_landmarks.landmark:
                    l.append(i)
            image_dist = mp_drawing.math.dist((l[471].x*int(h),l[471].y*int(w)),(l[469].x*int(h),l[469].y*int(w)))
            image_dist_2 = mp_drawing.math.dist((l[35].x*int(h),l[35].y*int(w)),(l[133].x*int(h),l[133].y*int(w)))
            image_dist_3 = mp_drawing.math.dist((l[34].x*int(h),l[34].y*int(w)),(l[264].x*int(h),l[264].y*int(w)))
            image_dist_4 = mp_drawing.math.dist((l[473].x*int(h),l[473].y*int(w)),(l[468].x*int(h),l[468].y*int(w)))
            image_dist_5 = mp_drawing.math.dist((l[193].x*int(h),l[193].y*int(w)),(l[413].x*int(h),l[413].y*int(w)))
            image_dist_6 = mp_drawing.math.dist((l[168].x*int(h),l[168].y*int(w)),(l[4].x*int(h),l[4].y*int(w)))
            image_dist_7 = mp_drawing.math.dist((l[102].x*int(h),l[102].y*int(w)),(l[4].x*int(h),l[4].y*int(w)))
            real_dist = 1.1
            print("HIIIIII")
            if img_dist<image_dist:
                img_dist=image_dist
            otpr = real_dist/img_dist
            i = otpr*image_dist_2
            if max_eye<i:
                max_eye=i
            c = otpr*image_dist_3
            if max_fw<c:
                max_fw=c
            p = otpr*image_dist_4
            if max_pd<p:
                max_pd=p
            nw = otpr*image_dist_5
            if max_nw<nw:
                max_nw=nw
            nl = otpr*image_dist_6
            if max_nl<nl:
                max_nl=nl
            ne = otpr*image_dist_7
            if max_ne<ne:
                max_ne=ne
            print("hi")

    print(max_eye,max_fw,
    max_pd,
    max_nw,
    max_nl,
    max_ne)
    div = max_ne/max_nl
    angle = math.sinh(div)
    angle = math.degrees(angle)+3
    print(angle)
    print("////////////////////////////")
    response = jsonify(message={"max_eye":max_eye,"max_fw":max_fw,
    "max_pd":max_pd,
    "max_nw":max_nw,
    "angle":angle})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return(response)



if __name__ == '__main__':
    app.run(debug=True)
