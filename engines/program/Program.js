'use strict'

import Assert from '../../../arslib/util/assert.js'
import Random from '../../../arslib/util/random.js'
import EArray from '../../../arslib/enhancements/e-array.js'
import LanguageConstruct from '../../../arslib/util/LanguageConstruct.js'
import Instruction from './Instruction.js'

// Note: If output cannot grow/shrink outputChangeNumUnits must remain "0", otherwise the value reflects the number of units to grow/shrink each time.
///      Also, the output cannot srink past initialOutputSize
export default function Program(
  input,
  blackboard,
  interestingConstants,
  initialOutputSize,
  outputChangeNumUnits = 0) {

  Assert.assertIsArray(
    input,
    '\'input\' is the array that will feed all programs')

  Assert.assertIsArray(
    blackboard,
    '\'blackboard\' is an array that can be read/written by all programs')

  Assert.assertIsArray(
    interestingConstants,
    '\'interestingConstants\' is an array of inputs with constants of interest')

  Assert.assertIsNumber(
    initialOutputSize,
    '\'initialOutputSize\' is the expected output size')

  this.checkIntegrity = function () {
    Assert.assert(this.instructions.length)
    Assert.assert(this.mem.length)
    Assert.assert(this.output.length)

    // Assert.assertIsArrayOfObjects(this.instructions)
    // Assert.assertIsArrayOfNumbers(this.mem)
    // Assert.assertIsArrayOfNumbers(this.output)
  
    Assert.assert((outputChangeNumUnits === 0) ||
      (outputChangeNumUnits &&
        (this.output.length % outputChangeNumUnits) === 0))
  }

  const INITIAL_MAX_MEM_SIZE = 10
  const INITIAL_MAX_NUM_INSTRUCTIONS = 5000

  //used by instruction
  this.blackboard = blackboard
  this.interestingConstants = interestingConstants
  this.input = input

  const memSize = Random.randomInt(INITIAL_MAX_MEM_SIZE) + 1
  // initializing memory with random values to increase program diversity
  this.mem = Array(memSize).fill(Random.randomInt(INITIAL_MAX_MEM_SIZE))
  // execution result
  this.output = Array(initialOutputSize).fill(0)

  const numInstructions = Random.randomInt(INITIAL_MAX_NUM_INSTRUCTIONS) + 1
  this.instructions =
    Array(numInstructions).fill(null)
      .map(() => new Instruction(this))

  this.credit = 0

  this.loopControl = {
    isLooping : false,
    loopCount : 0,
    loopPC : 0,
    initialize() {
      this.isLooping = false
      this.loopCount = 0
      this.loopPC = 0
    }
  }
  this.subrControl = {
    isInSubroutine : true,
    returnPC : 0,
    initialize() {
      this.isInSubroutine = false
      this.returnPC = 0
    }
  }


  this.exec = () => {
    this.loopControl.initialize()
    this.subrControl.initialize()

    // this.checkIntegrity()
    this.output.fill(0)
    // this.mem.fill(0) <- keep mem as the program context. This will allow, I hope, to offer (for all samples) just the last element of a series for forecasting.
    for (let pc = 0; pc < this.instructions.length; pc++) {

      Assert.assertIsNumber(pc)
      Assert.assert(this.instructions[pc])

      let instructionResult = this.instructions[pc].exec(this)
      //Jump?
      if(typeof instructionResult === 'number' &&
         isFinite(instructionResult)) {
        pc += Math.floor(Math.abs(instructionResult))
        continue
      }
      
      if(typeof instructionResult === 'object') {
        Assert.assert(instructionResult.type)
        Assert.assert(instructionResult.args)

        // ** loop **
        if(instructionResult.type === 'LOOP_START') {
          if(this.loopControl.isLooping || instructionResult.args.loopCount <= 0 || this.subrControl.isInSubroutine)
            continue // no nested or invalid loops
          this.loopControl.isLooping = true
          Assert.assertIsNumber(instructionResult.args.loopCount)
          this.loopControl.loopCount = instructionResult.args.loopCount
          this.loopControl.loopPC = pc+1
          continue
        }
        if(instructionResult.type === 'LOOP_END') {
          if(!this.loopControl.isLooping) continue
          pc = this.loopControl.loopPC
          this.loopControl.loopCount--
          if(this.loopControl.loopCount <= 0) {
            this.loopControl.isLooping = false
          }
          continue
        }

        //sub routine
        if(instructionResult.type === 'SUBR_GO') {
          if(this.subrControl.isInSubroutine || this.loopControl.isLooping)
            continue // no nested subrs
          this.subrControl.isInSubroutine = true
          this.subrControl.returnPC = pc+1
          Assert.assertIsNumber(instructionResult.args.subrStartPos)
          pc = instructionResult.args.subrStartPos
          continue
        }
        if(instructionResult.type === 'SUBR_RET') {
          if(!this.subrControl.isInSubroutine) continue
          pc = this.subrControl.returnPC
          this.subrControl.isInSubroutine = false
          continue
        }
      }
    }
  }

  this.clone = () => {
    let cloneProgram = new Program(
      input, 
      blackboard,
      interestingConstants,
      this.output.length,
      outputChangeNumUnits)

    
    cloneProgram.instructions = EArray.clone(this.instructions) //[...this.instructions] <- copy links alternative (keep same instructions)
    cloneProgram.mem = EArray.clone(this.mem)

    return cloneProgram
  }

  // combine maximize program assets, 
  // while evolver#evaluatePopulation minimize them
  this.combine = (otherProgram) => {
    let offspringOutputLength =
      (this.output.length >= otherProgram.output.length) ?
        this.output.length : otherProgram.output.length

    let offspring = new Program(
      input, 
      blackboard,
      interestingConstants,
      offspringOutputLength,
      outputChangeNumUnits)

    offspring.instructions = []
    let maxInstructionSize = Math.max(otherProgram.instructions.length, this.instructions.length)
    for(let i = 0 ; i < maxInstructionSize ; i++) {
      let selectedInstruction =
        (i < this.instructions.length && 
         i < otherProgram.instructions.length) ?
          EArray.choice([
            otherProgram.instructions[i],
            this.instructions[i]]) :
          (i < this.instructions.length) ?
            this.instructions[i] :
            otherProgram.instructions[i]

      offspring.instructions.push(selectedInstruction)
    }


    // keep mem (context)
    offspring.mem =
    (this.credit > otherProgram.credit) ?
      EArray.clone(this.mem) :
      EArray.clone(otherProgram.mem)

    offspring.checkIntegrity()

    return offspring
  }

  this.mutate = () => {
    LanguageConstruct.probabilitySwitch(
      // 'add' instruction
      () => {
        this.instructions.splice(
          Random.randomInt(this.instructions.length),
          0,
          new Instruction(this))
      },
      0.1,
      // 'remove' instruction
      () => {
        if (this.instructions.length > 1)
          this.instructions.splice(Random.randomInt(this.instructions.length), 1)
      },
      0.1,
      // 'change' instruction
      () => {
        this.instructions.splice(
          Random.randomInt(this.instructions.length),
          1,
          new Instruction(this))
      },
      0.1,
      // 'reorder' instruction
      () => {
        let instructionPos0 = Random.randomInt(this.instructions.length)
        let instructionPos1 = Random.randomInt(this.instructions.length);
        [this.instructions[instructionPos0], this.instructions[instructionPos1]] = 
          [this.instructions[instructionPos1], this.instructions[instructionPos0]]
      },
      0.1,
      // 'add' mem
      () => {
        this.mem.push(0)
      },
      0.1,
      // 'remove' mem
      () => {
        if (this.mem.length > 1)
          EArray.removeLast(this.mem) //remove at the end
      },
      0.1,
      // 'add' output
      () => {
        if (outputChangeNumUnits) this.output = [...this.output, ...Array(outputChangeNumUnits).fill(0)]
      },
      0.1,
      // 'remove' output
      () => {
        if (outputChangeNumUnits && (this.output.length >= (initialOutputSize + outputChangeNumUnits)))
          this.output.splice(this.output.length - outputChangeNumUnits, outputChangeNumUnits) //remove at the end
      },
      0.1
    )

    return this
  }

  this.checkIntegrity() //initial check
}

