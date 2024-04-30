'use strict'

import Evolver from './arslib/geneticComputing/Evolver.js'
import Util from './arslib/util/util.js'
import CanvasUtil from './arslib/util/canvasUtil.js'

console.log('Learning sin function')


function* sinGenerator(initialValue) {
  let i = initialValue
  while(true) {
    i+=0.01
    yield Math.sin(i)
  }
}

// entry point for index.html
function learnSin(elementIdToShowResult, elementIdInfoTextArea, elementIdCanvas) {
  // initialize data producer
  let sinSeriesCurrent = sinGenerator(0)
  let sinSeriesNext = sinGenerator(Math.PI/2)
  let currentValue = 0
  var nextValue = 0
  let input = [0]
  let infoTextAreaElement = document.getElementById(elementIdInfoTextArea)
  let canvasElement = document.getElementById(elementIdCanvas)

  function outputConvertFn(programOutputArray) {
    return [Util.nonLinearCoerceValueToMinMax(programOutputArray[0], -1, 1)]
  }
  function evaluateFn(convertedValue) {
    if((nextValue - convertedValue) === 0) return Number.MAX_SAFE_INTEGER
    // credit is inversely proportional to difference
    return 1/Math.abs(nextValue - convertedValue)
  }

  // Initialize evolver
  let evolver =
    new Evolver({
      input,
      initialOutputSize: 1,
      outputConvertFn,
      evaluateFn,
      // no change
      outputChangeNumUnits: 0})

  function draw(canvasElement, currentValue, nextValue, evolverResult, difference) {

    // draw new values on last row

    CanvasUtil.drawValueOnCanvasLastColumn(
      {
        canvas: canvasElement,
        value: currentValue, 
        minValue: -1, 
        maxValue: 1, 
        color: 'blue'}
    )

    CanvasUtil.drawValueOnCanvasLastColumn(
      {
        canvas: canvasElement,
        value: nextValue, 
        minValue: -1, 
        maxValue: 1, 
        color: 'green'}
    )

    CanvasUtil.drawValueOnCanvasLastColumn(
      {
        canvas: canvasElement,
        value: evolverResult, 
        minValue: -1, 
        maxValue: 1, 
        color: 'black'}
    )

    CanvasUtil.drawValueOnCanvasLastColumn(
      {
        canvas: canvasElement,
        value: difference, 
        minValue: -1, 
        maxValue: 1, 
        color: 'red'}
    )

    CanvasUtil.shiftLeft(canvasElement)
  }
  
  // main loop
  function exec() {
    // produce current and next value, which is the expected forecast.
    currentValue = sinSeriesCurrent.next().value
    nextValue = sinSeriesNext.next().value

    // pass inputs and expected output (forecast) to evolver
    input.pop()
    input.push(currentValue)

    // run evolver
    let evolverResult = evolver.exec()
    
    //record info
    infoTextAreaElement.textContent = 
    `
      currentValue  = ${currentValue}
      expectedValue = ${nextValue}
      evolverResult = ${evolverResult}
    `

    // log best result
    let difference = Math.abs(nextValue - evolverResult)
    if(elementIdToShowResult)
      document.getElementById(elementIdToShowResult).value = difference
    else
      console.log(`result -> ${difference}`)

    draw(canvasElement, currentValue, nextValue, evolverResult, difference)
    window.requestAnimationFrame(exec)

  }
  window.requestAnimationFrame(exec)

}

export {learnSin}