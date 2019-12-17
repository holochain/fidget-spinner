
import * as tape from 'tape'
import tapeP from 'tape-promise'
const test = tapeP(tape)
import { Player } from '@holochain/tryorama'
import { Behavior } from '../src'
import * as sinon from 'sinon'

const trace = x => (console.log('{T}', x), x)

test('can specify behavior', async t => {

  const injectedSpy = sinon.spy()

  const init = async () => {
    return injectedSpy
  }

  const stage = async (spy, args) => {
    if (args.stage >= 3) {
      throw new Error("artificial failure")
    }
    console.log(spy)
    spy(args)
    // collectedArgs.push(args)
    return spy
  }

  const behavior = new Behavior({
    init, stage,
    parameters: [
      ['frequency', t => 5000 - t * 1000],
      ['volume', t => 100 + 10 * t],
      ['stage', t => t],
    ]
  })

  await t.rejects(behavior.run(), /artificial failure/)

  const actualArgs = injectedSpy.getCalls().map(c => c.lastArg)
  t.deepEqual(actualArgs, [
    {
      frequency: 5000,
      volume: 100,
      stage: 0,
    },
    {
      frequency: 4000,
      volume: 110,
      stage: 1,
    },
    {
      frequency: 3000,
      volume: 120,
      stage: 2,
    },
  ])

  t.end()
})