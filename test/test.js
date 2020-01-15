'use strict'

let Assert = require('../../util/assert.js').default
let Program = require('../engines/program/Program.js').default
let Instruction = require('../engines/program/Instruction.js').default
let Evolver = require('../Evolver.js').default

// -----------------  INSTRUCTION -------------------

Assert.assert(new Instruction({input: Array(3), mem: Array(3), output: Array(2)}), 'Couldn\'t create instruction.')

function instructionBasicTest() {
  let mem = Array(1).fill(0)
  let output = Array(1).fill(0)
  let program = {input: Array(1).fill(0), mem: mem, output: output}
  let instruction = new Instruction(program)
  instruction.exec(program)
  return output[0] === 0 && mem[0] === 0
}
Assert.assert(instructionBasicTest(), 'Instruction execution test failed.')

// ------------------ PROGRAM ------------------------
Assert.assert(new Program(Array(3), 3), 'Couldn\'t create program.')

function programBasicTest() {
  let program = new Program(Array(3).fill(0), 3)
  program.exec()
  return program.output
}
Assert.assertIsArray(programBasicTest(), 'Program execution test failed.')

// --------------------  EVOLVER -----------------

Assert.assert(
  new Evolver({
    input: [0, 0], 
    initialOutputSize: 2, 
    outputConvertFn: () => 1,
    evaluateFn: () => 1,
    outputChangeNumUnits: 0}),
  'Couldn\'t create Evolver.')

function evolverBasicTest() {
  let evolver = new Evolver({
    input: [0, 0],
    initialOutputSize: 2,
    outputConvertFn: () => 1,
    evaluateFn: () => 1,
    outputChangeNumUnits: 0})

  return evolver.exec()
}

Assert.assertIsArray(evolverBasicTest(), 'Evolver execution test failed.')
  
  