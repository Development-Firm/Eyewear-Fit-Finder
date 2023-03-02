import { FaceMesh } from "@mediapipe/face_mesh";
import React, { useRef, useEffect, useState } from "react";
import { Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import './App.css'
function CameraComponent2() {
  const webcamRef=useRef( null );
  const canvasRef=useRef( null );
  const connect=window.drawConnectors;
  var camera=null;
  const [ scanningImages, setScanningImages ]=useState( false );

  const handleScan=async () => {
    // Capture 10 images
    const images=[];
    setScanningImages( true )
    for ( let i=0; i<50; i++ ) {
      images.push( webcamRef.current.getScreenshot() );
      await new Promise( ( resolve ) => setTimeout( resolve, 100 ) ); // Delay 100ms between captures
    }
    setScanningImages( false )
    // Create FormData object
    const formData=new FormData();
    for ( let i=0; i<images.length; i++ ) {
      formData.append( `image_${i}`, dataURLtoBlob( images[ i ] ) );
    }

    // Send FormData to Flask server API
    console.log( "chlaa", formData )
    // const response=await fetch( "/api/scan", {
    //   method: "POST",
    //   body: formData,
    // } );
    // const result=await response.json();

    // Do something with the result
  };

  // Helper function to convert data URL to Blob object
  function dataURLtoBlob( dataURL ) {
    const parts=dataURL.split( ";base64," );
    const contentType=parts[ 0 ].split( ":" )[ 1 ];
    const byteCharacters=atob( parts[ 1 ] );
    const byteArrays=[];
    for ( let i=0; i<byteCharacters.length; i++ ) {
      byteArrays.push( byteCharacters.charCodeAt( i ) );
    }
    return new Blob( [ new Uint8Array( byteArrays ) ], { type: contentType } );
  }


  function onResults( results ) {
    // const video = webcamRef.current.video;
    const videoWidth=webcamRef.current.video.videoWidth;
    const videoHeight=webcamRef.current.video.videoHeight;

    // Set canvas width
    canvasRef.current.width=videoWidth;
    canvasRef.current.height=videoHeight;

    const canvasElement=canvasRef.current;
    const canvasCtx=canvasElement.getContext( "2d" );
    canvasCtx.save();
    canvasCtx.clearRect( 0, 0, canvasElement.width, canvasElement.height );
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    if ( results.multiFaceLandmarks ) {
      for ( const landmarks of results.multiFaceLandmarks ) {
        connect( canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 0,
        } );
        connect( canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
          color: "#E0E0E0",
          lineWidth: 0,
        } );
        connect( canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
          color: "#E0E0E0",
          lineWidth: 0,
        } );
        connect( canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
          color: "#E0E0E0",
          lineWidth: 0,
        } );
        connect( canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
          color: "#E0E0E0",
          lineWidth: 0,
        } );
        connect( canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
          lineWidth: 0,
        } );
        connect( canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
          color: "#E0E0E0",
          lineWidth: 0,
        } );
      }
    }
    canvasCtx.restore();
  }
  useEffect( () => {
    const faceMesh=new FaceMesh( {
      locateFile: ( file ) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    } );

    faceMesh.setOptions( {
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    } );

    faceMesh.onResults( onResults );

    if (
      typeof webcamRef.current!=="undefined"&&
      webcamRef.current!==null
    ) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      camera=new cam.Camera( webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send( { image: webcamRef.current.video } );
        },
        width: 640,
        height: 480,
      } );
      camera.start();
    }
  }, [] );
  return (
    <div >
      <div style={{ color: 'white', textAlign: 'center', paddingBlock: '1rem' }}><h1>Eyewear Fit Finder</h1></div>
      <center>
        <div>
          <Webcam
            ref={webcamRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              opacity: 0,
              top: 100,
              textAlign: "center",
              zindex: 9,
              width: '48vw',
              height: '77vh',
              border: '1px solid white'
            }}
          />
          <canvas
            ref={canvasRef}
            className="output_canvas"
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              top: 110,
              textAlign: "center",
              zindex: 9,
              width: '49vw',
              height: '77vh',
              border: '1px solid grey',
            }}
          ></canvas>
        </div>
      </center>
      <div style={{ marginTop: '44%', display: 'flex', justifyContent: 'center' }}>
        {scanningImages?
          <>
            <Spin indicator={<LoadingOutlined />} />
            <p style={{ color: 'white' }}>Image is scanning please don't move</p>
          </>
          :<Button style={{ background: 'white', width: '10rem', height: '2.5rem', fontSize: '1rem' }} onClick={handleScan}>SCAN</Button>}
      </div>
    </div>
  );
}

export default CameraComponent2;