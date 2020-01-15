'use strict'

import Assert from '../arslib/util/assert.js'
import EArray from '../arslib/enhancements/e-array.js'
import Util from '../arslib/util/util.js'
import Random from '../arslib/util/random.js'

import Program from './engines/program/Program.js'


export default function Evolver ({
  input,
  initialOutputSize,
  outputConvertFn,
  evaluateFn,
  outputChangeNumUnits: outputChangeNumUnits = 0}) {
  Assert.assertIsArray(
    input,
    '\'input\' is the array that will feed all programs')
  Assert.assertIsNumber(
    initialOutputSize,
    '\'initialOutputSize\' is the expected output size')
  Assert.assertIsFunction(outputConvertFn,
    '\'outputConvertFn\' receives each program output, an array of numbers, and produces a representation for evaluateFn')
  Assert.assertIsFunction(evaluateFn,
    '\'evaluateFn\' receives the result of outputConvertFn and produces a credit')

  const NUM_PROGS = 100
  const CREDITS_IMPORTANCE_RELATIVE_TO_REDUCTION_FACTORS = 100
  const BLACKBOARD_SIZE = 10
  const PERCENTAGE_OF_POPULATION_TO_SURVIVE_EACH_GENERATION = 10
  const COMBINATION_PROBABILITY = 0.1

  let blackboard = Array(BLACKBOARD_SIZE).fill(0)
  
  // Nature occurring constants, added as imput so that the artificial evolution do not need
  // to rediscover them everytime
  let interestingConstants = [
    // *** TODO: ADD PHYSICS CONSTANTS: https://en.wikipedia.org/wiki/Physical_constant ***
    //Mathematical constants -> https://en.wikipedia.org/wiki/Mathematical_constant
    0 	          , //Zero
    1 	          , //One
    3.1415926535 , //Pi
    2.7182818284 , //e
    1.4142135623 , //Pythagoras' constant, square root of 2
    1.7320508075 , //Theodorus' constant, square root of 3
    2.2360679774 , //square root of 5 
    0.5772156649 , //Euler–Mascheroni constant
    1.6180339887 , //Golden ratio
    0.2614972128 , //Meissel–Mertens constant
    0.2801694990 , //Bernstein's constant
    0.3036630028 , //Gauss–Kuzmin–Wirsing constant
    0.3532363718 , //Hafner–Sarnak–McCurley constant
    0.5 	        , //Landau's constant
    0.5671432904 , //Omega constant
    0.6243299885 , //Golomb–Dickman constant
    0.6434105462 , //Cahen's constant
    0.6601618158 , //Twin prime constant
    0.6627434193 , //Laplace limit 				
    0.70258 	    , //Embree–Trefethen constant
    0.7642236535 , //Landau–Ramanujan constant
    0.8093940205 , //Alladi–Grinstead constant
    0.87058838 	, //Brun's constant for prime quadruplets
    0.9159655941 , //Catalan's constant
    1.0986858055 , //Lengyel's constant
    1.13198824 	, //Viswanath's constant
    1.2020569031 , //Apéry's constant
    1.3035772690 , //Conway's constant
    1.3063778838 , //Mills' constant
    1.3247179572 , //Plastic constant
    1.4513692348 , //Ramanujan–Soldner constant
    1.4560749485 , //Backhouse's constant
    1.4670780794 , //Porter's constant
    1.5396007178 , //Lieb's square ice constant
    1.6066951524 , //Erdős–Borwein constant
    1.7052111401 , //Niven's constant
    1.9021605831 , //Brun's constant
    2.2955871493 , //Universal parabolic constant
    2.5029078750 , //Feigenbaum constant
    2.5849817595 , //Sierpiński's constant 				
    2.6854520010 , //Khinchin's constant
    2.8077702420 , //Fransén–Robinson constant
    3.2758229187 , //Lévy's constant
    3.3598856662 , //Reciprocal Fibonacci constant
    4.6692016091 , //Feigenbaum constant
    108, //Nautilus shell
  ]
  
  let population = Array(NUM_PROGS)
    .fill(null)
    .map(() => new Program(
      input, 
      blackboard,
      interestingConstants, 
      initialOutputSize,
      outputChangeNumUnits))

  function executePopulation() {
    population.forEach(program => program.exec())
  }

  function evaluatePopulation() {
    let maxCredit = 0
    let maxInstructionsLength = 0
    let maxOutputLength = 0
    let maxMemLength = 0
    const numberOfFitnessReductionFactors = 4 // number of negative elements above (adjust if adding new ones...)
    

    // collect fitness info
    population.forEach(program => {
      try {
        program.checkIntegrity()
        program.credit = evaluateFn(outputConvertFn(program.output))
        
        //update max values
        if(program.credit > maxCredit) maxCredit = program.credit
        if(program.instructions.length > maxInstructionsLength) maxInstructionsLength = program.instructions.length
        if(program.output.length > maxOutputLength) maxOutputLength = program.output.length
        if(program.mem.length > maxMemLength) maxMemLength = program.mem.length

      } catch (error) {
        console.log('Program integrity failed...')
        program.credit = 0
      }
    })

    //define base to adjust all collected elements as bigger of collected max values
    const baseForAdjust = Math.max(maxCredit, maxInstructionsLength, maxOutputLength, maxMemLength)

    population.forEach(program => {
      if(program.credit === 0) return

      const adjustedCredit = Util.convert({
        value: program.credit,    
        fromBase: maxCredit,
        toBase: baseForAdjust })
      const adjustedInstructionLength = Util.convert({value: program.instructions.length, fromBase: maxInstructionsLength, toBase: baseForAdjust})
      const adjustedOutputLength = Util.convert({value: program.output.length, fromBase: maxOutputLength, toBase: baseForAdjust})
      const adjustedMemLength = Util.convert({value: program.mem.length, fromBase: maxMemLength, toBase: baseForAdjust})

      Assert.assert(program.credit >= 0, 'invalid adjustedCredit')

      program.credit = 
        // the adjustment is to avoid negative credits after subtraction (below) 
        (adjustedCredit * (numberOfFitnessReductionFactors + 1) * CREDITS_IMPORTANCE_RELATIVE_TO_REDUCTION_FACTORS) -
        (adjustedInstructionLength + adjustedOutputLength + adjustedMemLength)

      // Assert.assert(program.credit >= 0, 'invalid credit')

    })

  }

  function clearCredits() {
    population.forEach(individual => individual.credit = 0)
  }

  function executeAndEvaluate() {
    //console.log("Evolver#executeAndEvaluate");
    clearCredits()
    executePopulation()
    evaluatePopulation()
  }

  function sortPopulationFromBestToWorst() {
    function compare(a, b) {
      return b.credit - a.credit //order from greater to smaller
    }
    population.sort(compare)

    const firstIndividual = EArray.first(population)
    console.log(`
    output size = ${firstIndividual.output.length},
    mem size = ${firstIndividual.mem.length},
    instructions size = ${firstIndividual.instructions.length},
    credit = ${firstIndividual.credit}`)
  }

  // *** working with population sorted ***
  function getBestOutput() {
    return outputConvertFn(EArray.first(population).output)
  }

  function updatePopulation() {
    const numTotal = population.length
    const numSelected = Math.trunc(NUM_PROGS / (100/PERCENTAGE_OF_POPULATION_TO_SURVIVE_EACH_GENERATION))
    const numToChange = population.length - numSelected
    population.splice(numSelected, numToChange)
    let credits = population.map(individual => individual.credit)
    let newGeneration = Array(numTotal)
    newGeneration[0] = EArray.first(population) // elitism
    for (let index = 1; index < numTotal; index++) {
      let individual0 = EArray.choiceWithProbabilities(population, credits)
      let individual1 = EArray.choiceWithProbabilities(population, credits)

      if(Random.occurrenceProbability(COMBINATION_PROBABILITY) && individual0 !== individual1)
        newGeneration[index] = individual0.combine(individual1).mutate()
      else
        newGeneration[index] = (individual0.credit >= individual1.credit) ?
          individual0.clone().mutate() :
          individual1.clone().mutate()
    }
    population = newGeneration
  }
  // *** working with population sorted***

  // **** PUBLIC API ****

  // *** LEARNING (AND EXECUTING) ***
  this.exec = () => {
    executeAndEvaluate()
    sortPopulationFromBestToWorst()
    const result = getBestOutput()
    updatePopulation()
    return result
  }

  // *** EXECUTING ***
  this.execBestProgram = function() {
    return outputConvertFn(EArray.first(population).exec())
  }
}
