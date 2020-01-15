'use strict'

import Random from '../../../../util/random.js'

/* **************************** EVOLUTIVE NETWORK ************************************* */

/* ****************************************************************************
; Object: evoNet
; Description: evolutive neural network.
;              NOTE: THE NETWORK INPUT IS THE SYSTEM INPUT PLUS ITS OWN OUTPUT.
;		           THE NETWORK IS FULLY CONNECTED.
;**************************************************************************** */

const INPUT_LAYER = 0 /* first layer */

/* permited mutation variation for weights and biases 
  (NET_LEARNING_VAR, -NET_LEARNING_VAR) */
const NET_LEARNING_VAR = 0.5


export default function EvoNet (
  numInternalLayers,
  numInputs,
  numOutput) {

  this.numInternalLayers = numInternalLayers
  /* minimum is two layers (input and output) */
  this.numNetLayers = 2 + numInternalLayers
  this.outputLayerIndex = this.numNetLayers - 1 /* define last layer */

  this.NumNeuronsPerLayer = Math.max(numInputs, numOutput)

  this.numWeightsPerNeuron = this.NumNeuronsPerLayer

  this.numInputs = numInputs
  this.numOutput = numOutput

  /* set initial values */

  // *** TODO: CONVERT TO TYPED ARRAYS TO INCREASE SPEED ***
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from?v=control

  this.weights =
      [...Array(this.numNetLayers)]
        .map(
          () =>
            [...Array(this.NumNeuronsPerLayer)]
              .map(
                () =>
                  [...Array(this.numWeightsPerNeuron)]
                    .map(() => Random.randomFromInterval(-0.15, 0.15)
                    )
              )
        )

  /* the bias allows for some independence from inputs */
  this.bias =
      [...Array(this.numNetLayers)]
        .map(
          () => [...Array(this.NumNeuronsPerLayer)]
            .map(() => Random.randomFromInterval(-0.15, 0.15)))

  this.outputs =
      [...Array(this.numNetLayers)]
        .map(() => [...Array(this.NumNeuronsPerLayer)].fill(0))

}

/* ************************************************* */

/* ****************************************************************************
; function: getOutput
; Description: get network current output
; *****************************************************************************/
EvoNet.prototype.getOutput = function () {
  return this.outputs[this.outputLayerIndex]
}

/* ****************************************************************************
; method: run
; Description: evoNet execution step.
; input:  input array, evoNet to run
***************************************************************************** */
EvoNet.prototype.run = function (inputData) {
  let n /* neuron index */
  let w /* weight index */
  let l /* layer index  */

  /* ********* exec input layer ********* */
  for (n = 0; n < this.NumNeuronsPerLayer; n++) {

    this.outputs[INPUT_LAYER][n] = 0

    for (w = 0; w < this.numInputs; w++) {
      /*sum weighted inputs */
      this.outputs[INPUT_LAYER][n] +=
        inputData[w] *
        this.weights[INPUT_LAYER][n][w]
    } /* weights */

    /* add bias */
    this.outputs[INPUT_LAYER][n] += this.bias[INPUT_LAYER][n]

    /* purelin func (no func) */

    /* activation func: sin 
       this->output[INPUT_LAYER][n] = sin(this->output[INPUT_LAYER][n]);
    */

    /* McCulloch and Pitts model  
       if(this->output[INPUT_LAYER][n] > 0)
       this->output[INPUT_LAYER][n] =  1.0;
         else
       this->output[INPUT_LAYER][n] =  0.0;
    */

    /* sigmoid func */
    this.outputs[INPUT_LAYER][n] =
      1.0 / (1.0 + Math.exp(-this.outputs[INPUT_LAYER][n]))

  } /* input neurons */

  /* ********* exec hidden layers ********* */
  for (l = 1; /* after input layer... */ l < this.numNetLayers - 1; /* -1 means: do not exec output layer */ l++) {

    for (n = 0; n < this.NumNeuronsPerLayer; n++) {

      this.outputs[l][n] = 0

      /* input come from other neurons */
      for (w = 0; w < this.numWeightsPerNeuron; w++) {

        this.outputs[l][n] +=
          this.outputs[l - 1][w] *
          this.weights[l][n][w]

      } /* weights */

      /* add bias */
      this.outputs[l][n] += this.bias[l][n]

      /* activation func: sin 
      this->output[l][n] = sin(this->output[l][n]); 
      */

      /* McCulloch and Pitts model 
         if(this->output[l][n] > 0)
         this->output[l][n] =  1.0;
         else
         this->output[l][n] =  0.0; 
      */

      /* sigmoid func */
      this.outputs[l][n] =
        1.0 / (1.0 + Math.exp(-this.outputs[l][n]))


    } /* neurons */
  } /* layers */

  /* ********* exec output layer ********* */
  for (n = 0; n < this.NumNeuronsPerLayer; n++) {

    this.outputs[this.outputLayerIndex][n] = 0

    for (w = 0; w < this.numWeightsPerNeuron; w++) {

      /*sum weighted inputs 
      this->output[this->outputLayer][n] += 
        this->output[this->outputLayer-1][w] *
        this->weights[this->outputLayer][n][w];
      */

      /* changed to exponentiation to increase coverage */
      this.outputs[this.outputLayerIndex][n] +=
        Math.pow(this.outputs[this.outputLayerIndex - 1][w],
          this.weights[this.outputLayerIndex][n][w])

    } /* weights */

    /* add bias */
    this.outputs[this.outputLayerIndex][n] +=
      this.bias[this.outputLayerIndex][n]

    /* goes out straight from exponentiation (and bias)... */

  } /* neurons */

}


/* ****************************************************************************
; function: copy
; Description: copy one net into another
; *****************************************************************************/
EvoNet.clone = function () {
  let newNet = new EvoNet(this.numInternalLayers, this.numInputs, this.numOutput)
  newNet.weights = this.weights.clone()
  newNet.bias = this.bias.clone()
  return newNet
}

/* ****************************************************************************
; function: evoNetMutate
; Description: evoNet mutation operator
; *****************************************************************************/
EvoNet.prototype.evoNetMutate = function () {

  /* change value */

  let layer, neuron, weight

  layer = Random.randomInt(this.numNetLayers)
  neuron = Random.randomInt(this.NumNeuronsPerLayer)
  /* change (slightly) the value */
  let delta = Random.randomFromInterval(-NET_LEARNING_VAR, NET_LEARNING_VAR)
  /* what to change? */
  if (Random.randomInt(2)) {
    /* change bias */
    this.bias[layer][neuron] += delta
  } else {
    /* change weights */
    weight = Random.randomInt(this.numWeightsPerNeuron)
    this.weights[layer][neuron][weight] += delta
  }
}


//------------------------------------------------------


/* ****************************************************************************
; function: reproduce
; Description: create new evoNet from this and another EvoNet
; *****************************************************************************/
EvoNet.prototype.reproduce = function (mate) {


  let i, j, k

  /* set initial values from this one */
  let newEvoNet = this.clone()


  /* mix weights and biases */

  for (i = 0; i < this.numNetLayers; i++) {
    for (j = 0; j < this.NumNeuronsPerLayer; j++) {
      /* get parents parts */
      if (Random.randomInt(2)) {
        newEvoNet.bias[i][j] = mate.bias[i][j]
      }

      /* mix parents 
      newEvoNet->bias[i][j] = 
        (this->bias[i][j] + mate->bias[i][j]) / 2.0;
      */

      for (k = 0; k < this.numWeightsPerNeuron; k++) {
        /* get parents parts */
        if (Random.randomInt(2)) {
          newEvoNet.weights[i][j][k] = mate.weights[i][j][k]
        }

        /* mix parents 
        newEvoNet->weights[i][j][k] = 
          (this->weights[i][j][k] + mate->weights[i][j][k]) / 2.0;
        */
      }
    }
  }

  return newEvoNet
}

// *** TESTING ***
//let newNet = new let EvoNet(1, 1, 1);
//newNet.run([1]);



