'use strict'

// Usage: 
// import evalUtil from '../lib/arslib/geneticComputing/evalUtil/eval-util.js'
// ...
// evalUtil.blablabla()

function EvalUtil() {
  

  // Create simple edgeDetection designed to increase value for image positions where there are greater variation 
  // in the surrounding of each pixel
  this.defineEdgeDetectionMap = function (originalImgData, imgWidth) {
    let edgeDetectionMap = []
    let numPixels, totalR, totalG, totalB    
    for (let index = 0; index < originalImgData.length; index += 4) {
      let pivotR = originalImgData[index]
      let pivotG = originalImgData[index + 1]
      let pivotB = originalImgData[index + 2]

      numPixels = totalR = totalG = totalB = 0

      // left
      if((index - 4) >= 0) {
        totalR += originalImgData[index - 4]
        totalG += originalImgData[index - 3]
        totalB += originalImgData[index - 2]
        numPixels++
      }

      // up
      if((index - (imgWidth * 4)) >= 0) {
        totalR += originalImgData[(index - (imgWidth * 4))]
        totalG += originalImgData[(index - (imgWidth * 4))] + 1
        totalB += originalImgData[(index - (imgWidth * 4))] + 2
        numPixels++
      }

      // right
      if((index + 4) <= (originalImgData.length - 1)) {
        totalR += originalImgData[index + 4]
        totalG += originalImgData[index + 5]
        totalB += originalImgData[index + 6]
        numPixels++
      }
      
      // down
      if((index + (imgWidth * 4)) <= (originalImgData.length - 1)) {
        totalR += originalImgData[(index + (imgWidth * 4))]
        totalG += originalImgData[(index + (imgWidth * 4))] + 1
        totalB += originalImgData[(index + (imgWidth * 4))] + 2
        numPixels++
      }

      let RMean = totalR/numPixels
      let GMean = totalG/numPixels
      let BMean = totalB/numPixels
      // "1 + ..." because when everything is equal the value will be one
      let variation = 
        Math.abs(pivotR - RMean) +
        Math.abs(pivotG - GMean) +
        Math.abs(pivotB - BMean)


      edgeDetectionMap.push(variation)
      edgeDetectionMap.push(variation)
      edgeDetectionMap.push(variation)
      edgeDetectionMap.push(variation)
    }
    return edgeDetectionMap
  }

  // compare two images and return a value. the more similar the images, the greater the result
  // positionalValueMap is an array with valuation factors for each position of the image to verify
  //  examples: 'edges are more important than flat surfaces' or 'do not take color into consideration if opacity is 0'
  this.compareImages = function (imgData1, imgData2, positionalValueMap) {
    let credit = 0
    for (let i = 0; i < imgData2.length; i+=4) {
      const imgDataToEvaluateR = imgData1[i]
      const imgDataToEvaluateG = imgData1[i+1]
      const imgDataToEvaluateB = imgData1[i+2]
      const imgData1Alpha = imgData1[i+3]
      const originalR = imgData2[i]
      const originalG = imgData2[i+1]
      const originalB = imgData2[i+2]
      const imgData2Alpha = imgData2[i+3]

      const valueMapFactor = positionalValueMap ? positionalValueMap[i] : 1
      // Alpha credit is bigger because it affects the visible difference between the two points.
      const alphaDifferenceFactor = 2 

      // Max evaluation if both positions are transparent
      if(imgData1Alpha === 0 && imgData2Alpha === 0) return 255 * valueMapFactor

      credit += (255 - Math.abs(originalR - imgDataToEvaluateR)) * valueMapFactor
      credit += (255 - Math.abs(originalG - imgDataToEvaluateG)) * valueMapFactor
      credit += (255 - Math.abs(originalB - imgDataToEvaluateB)) * valueMapFactor
      credit += (255 - Math.abs(imgData2Alpha - imgData1Alpha)) * valueMapFactor * alphaDifferenceFactor

    }
    return credit
  }
  
}

let evalUtil = new EvalUtil()
export default evalUtil