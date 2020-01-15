'use strict'

// 1- Instructions may read from 'input', 'mem', 'blackboard' or 'interestingConstants'
//    and output to 'mem', 'blackboard', or 'output'. 
// 2 - If the instruction returns a value, that will be added to the program counter (pc).

import {EArray} from 'arslib'

const MAX_JMP_SIZE = 3

function getSafeNumber(value) {
  if(!value || typeof value === 'undefined' || isNaN(value) || typeof value !== 'number' || !isFinite(value)) 
    return 0
  else 
    return value
}

const instructionNameToOperation = {
  INC: (args) => {
    // console.log("inc")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      args.program[args.outputArray][args.outputArrayPos] + 1
    )
  },
  DEC: (args) => {
    // console.log("dec")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      args.program[args.outputArray][args.outputArrayPos] - 1
    )
  },
  ADD: (args) => {
    // console.log("add")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      args.program[args.inputArray0][args.inputArray0Pos] +
        args.program[args.inputArray1][args.inputArray1Pos]
    )
  },
  SUB: (args) => {
    // console.log("sub")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      args.program[args.inputArray0][args.inputArray0Pos] -
        args.program[args.inputArray1][args.inputArray1Pos]
    )
  },
  MULT: (args) => {
    // console.log("mult")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      args.program[args.inputArray0][args.inputArray0Pos] *
        args.program[args.inputArray1][args.inputArray1Pos]
    )
  },
  DIV: (args) => {
    // console.log("div")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      args.program[args.inputArray0][args.inputArray0Pos] /
        args.program[args.inputArray1][args.inputArray1Pos]
    )
  },
  INV: (args) => {
    // console.log("inv")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      1 /
        args.program[args.inputArray0][args.inputArray0Pos]
    )
  },
  CHG_SIGN: (args) => {
    // console.log("chg_sign")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      -1 *
        args.program[args.inputArray0][args.inputArray0Pos]
    )
  },
  ABS: (args) => {
    // console.log("abs")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.abs(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },    
  SIN: (args) => {
    // console.log("sin")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.sin(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  SINH: (args) => {
    // console.log("sinh")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.sinh(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  ASIN: (args) => {
    // console.log("asin")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.asin(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  ASINH: (args) => {
    // console.log("asinh")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.asinh(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },    
  COS: (args) => {
    // console.log("cos")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.cos(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  COSH: (args) => {
    // console.log("cosh")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.cosh(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  ACOS: (args) => {
    // console.log("acos")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.acos(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  ACOSH: (args) => {
    // console.log("acosh")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.acosh(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  TAN: (args) => {
    // console.log("tan")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.tan(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  TANH: (args) => {
    // console.log("tanh")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.tanh(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  ATAN: (args) => {
    // console.log("atan")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.atan(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  ATANH: (args) => {
    // console.log("acosh")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.acosh(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  EXP: (args) => {
    // console.log("exp")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.exp(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  POW: (args) => {
    // console.log("pow")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.pow(
        args.program[args.inputArray0][args.inputArray0Pos],
        args.program[args.inputArray1][args.inputArray1Pos]
      )
    )
  },
  SQRT: (args) => {
    // console.log("sqrt")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.sqrt(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  LOG: (args) => {
    // console.log("log")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber (
      Math.log(
        args.program[args.inputArray0][args.inputArray0Pos]
      )
    )
  },
  LOG10: (args) => {
    // console.log("log10")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.log10(
        args.program[args.inputArray0][args.inputArray0Pos]
      )
    )
  },
  LOG2: (args) => {
    // console.log("log2")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.log2(
        args.program[args.inputArray0][args.inputArray0Pos]
      )
    )
  },    
  MAX: (args) => { // copy to output the max of two inputs
    // console.log("max'")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.max(
        args.program[args.inputArray0][args.inputArray0Pos],
        args.program[args.inputArray1][args.inputArray1Pos]
      )
    )
  },
  MIN: (args) => { // copy to output the min of two inputs
    // console.log("min'")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.min(
        args.program[args.inputArray0][args.inputArray0Pos],
        args.program[args.inputArray1][args.inputArray1Pos]
      )
    )
  },
  COPY: (args) => { // copy one element from input to output
    // console.log("copy")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      args.program[args.inputArray0][args.inputArray0Pos]
    )
  },
  // RANDOM: (args) => { // set output with random number between 0 and 1
  //   // console.log("random")
  //   args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
  //     Math.random()
  //   )
  // },
  SIGN: (args) => { // set output with sign value of input (1 is positive, 0 is zero and -1 is negative)
    // console.log("sign")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.sign(args.program[args.inputArray0][args.inputArray0Pos])
    )
  },
  FLOOR: (args) => {
    // console.log("floor'")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.floor(
        args.program[args.inputArray0][args.inputArray0Pos]
      )
    )
  },
  CEIL: (args) => {
    // console.log("ceil'")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.ceil(
        args.program[args.inputArray0][args.inputArray0Pos]
      )
    )
  },
  ROUND: (args) => {
    // console.log("round'")
    args.program[args.outputArray][args.outputArrayPos] = getSafeNumber(
      Math.round(
        args.program[args.inputArray0][args.inputArray0Pos]
      )
    )
  },    
  JMP: (args) => { // jump num positions from input or mem (max prog.length)
    // console.log("jmp")
    let pcIncrement = args.program[args.inputArray0][args.inputArray0Pos] % 
              MAX_JMP_SIZE
    return pcIncrement
  },
  JMP_ZERO: (args) => { // jump next instruction if read value is zero
    // console.log("jmp zero")
    if (args.program[args.inputArray0][args.inputArray0Pos] === 0)
      return 1
  },
  JMP_POS: (args) => { // jump next instruction if read value is positive
    // console.log("jmp pos")
    if (args.program[args.inputArray0][args.inputArray0Pos] > 0)
      return 1
  },
  JMP_NEG: (args) => { // jump next instruction if read value is negative
    // console.log("jmp neg")
    if (args.program[args.inputArray0][args.inputArray0Pos] < 0)
      return 1
  },
  JMP_SAME_SIGN: (args) => { // jump next instruction if read value is negative
    // console.log("jmp same sign")
    if (
      ((args.program[args.inputArray0][args.inputArray0Pos] < 0) && 
        (args.program[args.inputArray1][args.inputArray1Pos] < 0)) ||
        ((args.program[args.inputArray0][args.inputArray0Pos] > 0) && 
        (args.program[args.inputArray1][args.inputArray1Pos] > 0))
    ) return 1
  },
  LOOP_START: (args) => { // start looping (if not already)
    // console.log("loop start")
    return {
      type: 'LOOP_START',
      args: {
        loopCount: getSafeNumber(Math.min(
          args.program.mem.length,
          Math.abs(Math.floor(args.program[args.inputArray0][args.inputArray0Pos])
          )))
      }
    }
  },
  LOOP_END: () => { // return to loop_start + 1 position
    // console.log("loop end")
    return {
      type: 'LOOP_END', 
      args: {}
    }
  },
  SUBR_GO: (args) => { // go to sub routine
    // console.log("loop start")
    return {
      type: 'SUBR_GO',
      args: {
        subrStartPos: getSafeNumber(Math.min(
          args.program.instructions.length - 1,
          Math.abs(Math.floor(args.program[args.inputArray0][args.inputArray0Pos])
          )))
      }
    }
  },
  SUBR_RET: () => { // return from sub routine
    // console.log("loop end")
    return {
      type: 'SUBR_RET', 
      args: {}
    }
  },

}


export default function Instruction(program) {

  function selectRandomInputArray() {
    return EArray.choice(['input', 'mem', 'blackboard', 'interestingConstants'])
  }

  function selectRandomOutputArray() {
    return EArray.choice(['output', 'mem', 'blackboard'])
  }

  this.inputArray0 = selectRandomInputArray()
  this.inputArray0Pos = EArray.indexChoice(program[this.inputArray0])
  this.inputArray1 = selectRandomInputArray()
  this.inputArray1Pos = EArray.indexChoice(program[this.inputArray1])
  this.outputArray = selectRandomOutputArray()
  this.outputArrayPos = EArray.indexChoice(program[this.outputArray])


  this.instructionName = EArray.choice(Object.keys(instructionNameToOperation))


  this.checkIntegrity = function (program) {
    return (
      program[this.inputArray0].length > this.inputArray0Pos &&
      program[this.inputArray1].length > this.inputArray1Pos &&
      program[this.outputArray].length > this.outputArrayPos)
  }


  this.exec = (program) => {
    if(!this.checkIntegrity) return 0

    let result = instructionNameToOperation[this.instructionName]({
      program,
      inputArray0: this.inputArray0,
      inputArray0Pos: this.inputArray0Pos,
      inputArray1: this.inputArray1,
      inputArray1Pos: this.inputArray1Pos,
      outputArray: this.outputArray,
      outputArrayPos: this.outputArrayPos,
    })
    return result
  }
}

