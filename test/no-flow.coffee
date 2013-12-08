ways = require '../lib/ways'
should = require('chai').should()

describe '[no-flow-mode]', ->

  out = null
  run = null
  destroy = null

  before ->

    out = {}

    render = (req)->
      out?.log 'render', req

    ways.reset()
    ways '/', render
    ways '/pages', render
    ways '/pages/:id', render
    ways '/pages/:id/edit', render
    ways '/no/dep', render


  it 'should execute routes in the order they are called', (done)->

    requests =  [
      {url: '/pages/33/edit', pattern: '/pages/:id/edit', params: {id:'33'}}
      {url: '/pages', pattern: '/pages', params: {}}
      {url: '/pages/33', pattern: '/pages/:id', params: {id:'33'}}
      {url: '/', pattern: '/', params: {}}
    ]

    out.log = (type, req)->
      type.should.equal 'render'
      req.should.deep.equal requests.shift()
      if requests.length is 0
        out.log = null
        done()

    # replace shouldn't do anything
    ways.go.silent '/pages/33/edit'

    ways.go '/pages/33/edit'
    ways.go '/pages'
    ways.go '/pages/33'
    ways.go '/'