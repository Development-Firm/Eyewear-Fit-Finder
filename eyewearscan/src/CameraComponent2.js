import { FaceMesh } from "@mediapipe/face_mesh";
import React, { useRef, useEffect, useState } from "react";
import { Button, Spin, Modal, Carousel, Row, Col, notification, Space, Tag, Table, Descriptions } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import beep from './beep.mp3';
import './App.css'
function CameraComponent2() {
  const webcamRef=useRef( null );
  const canvasRef=useRef( null );
  const connect=window.drawConnectors;
  var camera=null;
  const [ api, contextHolder ]=notification.useNotification();
  const [ scanningFront, setScanningFront ]=useState( false );
  const [ isScanningComplete, setIsScanningComplete ]=useState( false )
  const [ scanningProcess, setScanningProcess ]=useState( false )
  const [ frontScanned, setFrontScanned ]=useState( false );
  const [ rightScanned, setRightScanned ]=useState( false );
  const [ scanningRight, setScanningRight ]=useState( false );
  const [ isModalOpen, setIsModalOpen ]=useState( false );
  const [ isModalSecondOpen, setIsModalSecondOpen ]=useState( false );
  const [ imagesFront, setImagesFront ]=useState( [] );
  const [ imagesRight, setImagesRight ]=useState( [] );

  const contentStyle={
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
  };

  const openNotificationWithIcon=( type, title, msg ) => {
    api[ type ]( {
      message: title,
      description: msg,
    } );
  };

  const showModal=() => {
    setIsModalOpen( true );
  };

  const handleOk=() => {
    setIsModalOpen( false );
  };

  const handleCancel=() => {
    setIsModalOpen( false );
  };
  const sendImages= async () => {
    const formData=new FormData();
    for ( let i=0; i<imagesFront.length; i++ ) {
      formData.append( `front_image_${i}`, dataURLtoBlob( imagesFront[ i ] ) );
    }
    for ( let i=0; i<imagesRight.length; i++ ) {
      formData.append( `right_image_${i}`, dataURLtoBlob( imagesRight[ i ] ) );
    }
    console.log( "chlaa Front", formData )
    // Send FormData to Flask server API
    const response=await fetch( "http://127.0.0.1:5000/measurement", {
      method: "POST",
      body: formData,
    } );
    const result=await response.json();
    console.log('RESULT:', result);
  }

  const handleScan=async () => {

    setScanningProcess( true );
    // Capture 10 images
    if ( !frontScanned ) {
      const imagesF=[];
      handleCancel();
      setScanningFront( true )
      for ( let i=0; i<20; i++ ) {
        imagesF.push( webcamRef.current.getScreenshot() );
        await new Promise( ( resolve ) => setTimeout( resolve, 100 ) ); // Delay 100ms between captures
      }
      setImagesFront( imagesF );
      // Create FormData object


      setScanningFront( false )
      setFrontScanned( true )
      setIsModalSecondOpen( true );
    }
    else {
      const imagesR=[];
      setScanningRight( true )
      setIsModalSecondOpen( false );
      for ( let i=0; i<20; i++ ) {
        imagesR.push( webcamRef.current.getScreenshot() );
        await new Promise( ( resolve ) => setTimeout( resolve, 100 ) ); // Delay 100ms between captures
      }
      setImagesRight( imagesR );
      setScanningRight( false );
      setRightScanned( true );
      sendImages();
      const audio=new Audio( beep );
      audio.play();
      openNotificationWithIcon( 'success', 'Congratulations', 'Scanning process has been completed!' )
      setIsScanningComplete( true )
      setScanningProcess( false )
    }


  };

  // Helper function to convert data URL to Blob object
  function dataURLtoBlob( dataURL ) {
    if ( !dataURL ) {
      return null;
    }
    console.log( dataURL )
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
    const videoWidth=webcamRef.current.video.videoWidth;
    const videoHeight=webcamRef.current.video.videoHeight;

    // Set canvas width and height
    const canvasElement=canvasRef.current;
    canvasElement.width=videoWidth;
    canvasElement.height=videoHeight;
    canvasElement.style.width="70%";
    canvasElement.style.height="85%";

    // Set video element width and height
    const videoElement=webcamRef.current.video;
    videoElement.width=videoWidth;
    videoElement.height=videoHeight;
    canvasElement.style.width="70%";
    canvasElement.style.height="85%";

    const canvasCtx=canvasElement.getContext( "2d" );

    // Clear canvas
    canvasCtx.clearRect( 0, 0, canvasElement.width, canvasElement.height );

    // Invert canvas horizontally
    canvasElement.style.transform="rotateY(180deg)";

    // Draw video frame on canvas
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // Draw facemesh on inverted canvas
    if ( results.multiFaceLandmarks&&( scanningFront||scanningRight ) ) {
      for ( const landmarks of results.multiFaceLandmarks ) {
        connect(
          canvasCtx,
          landmarks,
          Facemesh.FACEMESH_TESSELATION,
          { color: "#C0C0C070", lineWidth: 1 }
        );
        connect( canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
          color: "#E0E0E0",
          lineWidth: 0,
        } );
        connect( canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
          color: "#E0E0E0",
          lineWidth: 0,
        } );
      }
    }
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
  }, [ scanningFront, scanningRight ] );
  return (
    <div >
      {/* <div style={{ color: 'white', textAlign: 'center', paddingBlock: '1rem' }}>
        {scanningFront?
          <>
            <Spin indicator={<LoadingOutlined />} />
            <p style={{ color: 'white' }}>Look into the camera while your face is being scanned</p>
          </>
          :scanningRight?
            <>
              <Spin indicator={<LoadingOutlined />} />
              <p style={{ color: 'black' }}>Look right while your face is being scanned</p>
            </>
            :
            <h1 style={{ color: 'black' }}>Eyewear Fit Finder</h1>
        }
      </div> */}
      {contextHolder}
      <center>
        {isScanningComplete?
          <div className="descriptions-wrapper">
            <Descriptions title="User Info" bordered className="custom-descriptions" column={1} layout="horizontal" style={{ fontSize: '1.5rem' }}>
              <Descriptions.Item label="Product" style={{ fontSize: '1.5rem' }}>Cloud Database</Descriptions.Item>
              <Descriptions.Item label="Billing Mode" style={{ fontSize: '1.5rem' }}>Prepaid</Descriptions.Item>
              <Descriptions.Item label="Automatic Renewal" style={{ fontSize: '1.5rem' }}>YES</Descriptions.Item>
              <Descriptions.Item label="Order time" style={{ fontSize: '1.5rem' }}>2018-04-24 18:00:00</Descriptions.Item>
            </Descriptions>
          </div>:<div>
          <Webcam
            ref={webcamRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              top: 100,
              textAlign: "center",
              zIndex: 9,
              width: 1280,
              height: 720,
              opacity: 0
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
              top: 50,
              textAlign: "center",
              zindex: 9,
              borderRadius: '6px'
            }}
          ></canvas>
          </div>}
      </center>
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        justifyContent: 'center',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>
        <Button
          style={{
            background: 'white',
            width: '10rem',
            height: '2.5rem',
            fontSize: '1rem'
          }}
          onClick={showModal}
          disabled={scanningRight||scanningFront}
        >
          {scanningProcess? "Scanning.....":"Scan"}
        </Button>
      </div>

      <Modal width={1000} open={isModalOpen} onOk={handleScan} onCancel={handleCancel} okText={"Start scan"}>
        <Carousel
          dotPosition='bottom'
          autoplay
          className="custom-carousel"
        >
          <div>
            <h3 style={{ textAlign: 'center' }}>Step 1 - Please ensure that you are facing directly towards the camera for 5 seconds.</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={require( './front_image.jpg' )} alt="" width={410} height={600} />
            </div>
          </div>
          <div>
            <h3 style={{ textAlign: 'center' }}>Step 2 - Please position yourself so that you are facing squarely right towards the camera  until you hear a beep.</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={require( './image_right.jpg' )} alt="" width={410} height={600} />
            </div>
          </div>
        </Carousel>
      </Modal>

      <Modal title="Focus" closable={false} open={isModalSecondOpen} onOk={handleScan}>
        <div>
          <h3 style={{ textAlign: 'center' }}>Step 2 - Please position yourself so that you are facing squarely right towards the camera  until you hear a beep.</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={require( './image_right.jpg' )} alt="" width={410} height={600} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CameraComponent2;