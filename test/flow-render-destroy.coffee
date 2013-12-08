ways = require '../lib/ways'
should = require('chai').should()

describe '[flow-mode] run+destroy', ->

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
    ways.mode 'run+destroy'

    ways '/', run, destroy
    ways '/pages', run, destroy, '/'
    ways '/pages/:id', run, destroy, '/pages'
    ways '/pages/:id/edit', run, destroy, '/pages/:id'
    ways '/no/dep', run, destroy, '/this/does/not/exist'

    try
      ways '/null', ->
    catch err
      error_msg = "In `flow` mode you must to pass at least 3 args."
      err.message.should.equal error_msg

  it 'should run route with param from scratch', (done)->

    requests =  [
      {url: '/', pattern: '/', params: {}}
      {url: '/pages', pattern: '/pages', params: {}}
      {url: '/pages/33', pattern: '/pages/:id', params: {id:'33'}}
      {url: '/pages/33/edit', pattern: '/pages/:id/edit', params: {id:'33'}}
    ]

    out.log = (type, req)->
      type.should.equal 'run'
      req.should.deep.equal requests.shift()
      if requests.length is 0
        out.log = null
        done()

    ways.go '/pages/33/edit'



  it 'should run pendings and destroy deads', (done)->

    types = 'run run destroy destroy'.split ' '

    requests =  [
      # run
      {url: '/pages/22', pattern: '/pages/:id', params: {id:'22'}}
      {url: '/pages/22/edit', pattern: '/pages/:id/edit', params: {id:'22'}}

      # destroy
      {url: '/pages/33/edit', pattern: '/pages/:id/edit', params: {id:'33'}}
      {url: '/pages/33', pattern: '/pages/:id', params: {id:'33'}}
    ]

    out.log = (type, req)->
      type.should.equal types.shift()
      req.should.deep.equal requests.shift()
      if requests.length is 0
        out.log = null
        done()

    ways.go '/pages/22/edit'



  it 'should error on route not found', ->
    msg = "Route not found for url '/this/route/does/not/exist'"
    try
      ways.go '/this/route/does/not/exist'
    catch err
      err.message.should.equal msg



  it 'should error on dependency not found', ->
    msg = "Dependency '/this/does/not/exist' not found for route '/no/dep'"
    try
      ways.go '/no/dep'
    catch err
      err.message.should.equal msg