<!-- @format -->

## Technical Spike: Running Machine Learning model on the Front End (React Native Expo + Model in ONNX format)

### AIM:

1.  to be able to load onnx model on the front end
2.  to be able to convert images taken on mobile into Tensor format so that it can be consumed by model

<br/>
mnist.ort: mnist model was found and integrated into expo react native project, model intially took in mock data.

expo camera was then integrated and uri format image was reformatted (28x28 pixel) to a Tensor format and fed into model.

to note that results are not accurate as cropping was not done accurately.
checks as to whether number is in the 28x28 pixel was not done.

however model appears to be given the correct input (tensor format) and outputs were generated.

### Final Outcome: 
Was successful in achieving aim for iOS device