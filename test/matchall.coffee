ways = require '../lib/ways'
should = require('chai').should()

describe '[match-all]', ->

  out = null
  run = null
  destroy = null

  before ->
    out = {}

    run = (req, done)->
      out?.log 'run', req
      done()

    destroy = (req, done)->
      out?.log 'destroy', req
      done()

    ways.reset()
    ways.mode 'destroy+run'
    ways '/', run, destroy
    ways '*', run, destroy, '/'


  it 'should run match-all route', (done)->

    requests =  [
      {url: '/', pattern: '/', params: {}}
      {url: '/anything', pattern: '*', params: {}}
    ]

    out.log = (type, req)->
      type.should.equal 'run'
      req.should.deep.equal requests.shift()
      if requests.length is 0
        out.log = null
        done()

    ways.go '/anything'