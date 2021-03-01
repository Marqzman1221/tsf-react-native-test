import { StatusBar } from 'expo-status-bar';
import { Camera } from 'expo-camera';
import { bundleResourceIO, cameraWithTensors, detectGLCapabilities } from '@tensorflow/tfjs-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

const TensorCamera = cameraWithTensors(Camera);

export default function App() {

  // State that changes the render
  const [isTfReady, setIsTfReady] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [previewIsReady, setPreviewIsReady] = useState(false);
  const [predictions, setPredictions] = useState([]);

  // Other state
  const model = useRef(null);

  useEffect(() => {

    const initializeTfAsync = async () => {
      await tf.ready();
      console.log('Tensorflow: READY');
      setIsTfReady(true);

      const modelJson = require('./models/ssd_mobilenet_v2_coco_4x_compressed/model.json');
      const modelWeights = require('./models/ssd_mobilenet_v2_coco_4x_compressed/group1-shard1of1.bin');
      model.current = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
      setIsModelReady(true);
      console.log('Model: READY');
    };

    const initializeModelAsync = async () => {
      model.current = await cocoSsd.load();
      console.log('Model: READY');
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
    // initializeModelAsync();
    checkPermissionsAsync();
  }, []);

  let frameCounter = 0;

  const handleCameraStream = (images, updatePreview, gl) => {
    
    const loop = async () => {
      // Get current image
      const nextImageTensor = images.next().value;

      // Handle image every 60 frames
      if (nextImageTensor && frameCounter % 60 == 0) {

        // // TODO Get predictions from model
        // const newPredictions = await model.current.detect(nextImageTensor);
        // setPredictions(newPredictions);
      }

      frameCounter += 1;

      // Clear image from memory
      tf.dispose(nextImageTensor);

      requestAnimationFrame(loop);
    };

    try {
      if (isTfReady && isModelReady) loop();
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

  const cameraIsReady = () => {
    setPreviewIsReady(true);
    console.log('Camera: READY')
  }

  if (!isTfReady || !isModelReady) {
    return (
      <View style={styles.container}>
        <Text>Awaiting Tensorflow...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }
  else {
    return (
      <View style={ styles.container }>
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
          autorender={false}
        />
        <View>
          <Text style={styles.text}> Number of Predictions: {predictions ? predictions.length : 'NA'} </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    position: 'absolute',
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
    // alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 18,
    backgroundColor: 'transparent',
    color: 'white',
  },
});
