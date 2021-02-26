import { StatusBar } from 'expo-status-bar';
import { Camera } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

const TensorCamera = cameraWithTensors(Camera);

export default function App() {

  const [isTfReady, setIsTfReady] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  // const [textureDimensions, setTextureDimensions] = useState({ height: null, width: null });
  const [predictions, setPredictions] = useState(null);
  // const model = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {

    const initializeTfAsync = async () => {
      await tf.ready();
      console.log('Tensorflow: READY')
      setIsTfReady(true);
    };

    const initializeModelAsync = async () => {
      // model.current = await cocoSsd.load();
      const model = await cocoSsd.load();
      console.log('Model: READY');
      setModel(model);
      setIsModelReady(true);
    };

    const checkPermissionsAsync = async () => {
      const { status } = await Camera.getPermissionsAsync()
      if (status === 'granted') {
        console.log('Permissions: GRANTED');
        return;
      }
      else
        console.log('Permissions: NOT GRANTED');

      if (Platform.OS != "web") {
        const { status } = await Camera.requestPermissionsAsync();

        if (status !== 'granted') {
          alert("Sorry, we need camera permissions for this app.");
        }
      }
    };

    initializeTfAsync();
    initializeModelAsync();
    checkPermissionsAsync();
  }, []);

  function handleCameraStream (images, updatePreview, gl) {
    
    const loop = async () => {
      // Get current image
      const nextImageTensor = images.next().value;

      // Handle image
      // if (nextImageTensor) {
      //   // Use model to detect predictions
      //   // const newPredictions = await model.current.detect(nextImageTensor);
      //   const newPredictions = await model.detect(nextImageTensor);

      //   if (newPredictions && newPredictions.length > 0) {
      //     setPredictions(newPredictions.filter(p => p.value >= 0.5));
      //     console.log('Number of Predictions:', predictions.length);
      //   }


      // }

      // Clear image from memory
      tf.dispose([nextImageTensor]);

      requestAnimationFrame(loop);
    }

    try {
      if (isModelReady) loop();
    } catch (error) {
      console.warn(error);
    }
  }

  const getRandomHexColor = () => {
    const n = (Math.random() * 0xffffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
  }

  const getPlatformTextureHeight = () => {
    return (Platform.OS === 'ios' ? 1920 : 1200);
  }

  const getPlatformTextureWidth = () => {
    return (Platform.OS === 'ios' ? 1080 : 1600);
  }

  if (!isModelReady) {
    return (
      <View style={styles.container}>
        <Text>Awaiting Tensorflow...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }
  else {

    // TENSOR CAMERA
  
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <TensorCamera
          // Standard Camera props
          style={styles.cameraView}
          type={Camera.Constants.Type.back}
          // Tensor related props
          cameraTextureHeight={getPlatformTextureHeight}
          cameraTextureWidth={getPlatformTextureWidth}
          resizeHeight={128}
          resizeWidth={128}
          resizeDepth={3}
          onReady={handleCameraStream}
          autorender={true}
        />
        { 
          // Overlay prediction highlights 

    //      <View style={{
    //       position: "relative", zIndex: 1, elevation: 1,
    //     }}>
    //       {isModelReady &&
    //         predictions &&
    //         predictions.map((p, index) => {
    //           return (
    //             <View
    //               key={index}
    //               style={{
    //                 zIndex: 1,
    //                 elevation: 1,
    //                 left: p.bbox[0],
    //                 top: p.bbox[1],
    //                 width: p.bbox[2],
    //                 height: p.bbox[3],
    //                 borderWidth: 2,
    //                 borderColor: getRandomHexColor(),
    //                 backgroundColor: "transparent",
    //                 position: "absolute",
    //               }}
    //             />
    //           );
    //         })}
    //     </View>
        }
      </View>
      
    )

    // BASIC CAMERA WITH OVERLAY TEXT

    // return (
    //   <View style={styles.container}>
    //     <Camera style={styles.camera} type={Camera.Constants.Type.back}>
          
    //       <View 
    //         style={{
    //           flex: 1,
    //           backgroundColor: 'transparent',
    //           flexDirection: 'row',
    //           margin: 20,
    //         }}
    //       >

    //         <View style={styles.button}>
    //           <Text style={styles.text}> Number of Predictions: {predictions ? predictions.length : 'NA'} </Text>
    //         </View>          
    //       </View>
    //     </Camera>
    //   </View>
    // )
  }
}

const styles = StyleSheet.create({
  container: {
    height: window,
    backgroundColor: '#000',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  camera: {
    flex: 1
  },
  cameraView: {
    flex: 1,
    zIndex: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    // flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    backgroundColor: 'transparent',
    color: 'black',
  },
});
