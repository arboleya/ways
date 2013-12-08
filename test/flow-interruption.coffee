ways = require '../lib/ways'
should = require('chai').should()

describe '[flow-interruption] destroy+run', ->

  out = null
  run = null
  destroy = null

  before ->
    out = {}

    run = (req, done)->
      out?.log 'run', req
      if req.url is '/pages'
        ways.go '/login'
      done()

    destroy = (req, done)->
      out?.log 'destroy', req
      done()

  it 'should interrupt a running flow and starts another (run+destroy)', (done)->

    ways.reset()
    ways.mode 'destroy+run'
    ways '/', run, destroy
    ways '/pages', run, destroy, '/'
    ways '/pages/:id', run, destroy, '/pages'
    ways '/login', run, destroy

    requests =  [
      {url: '/', pattern: '/', params: {}}
      {url: '/pages', pattern: '/pages', params: {}}
      {url: '/login', pattern: '/login', params: {}}
    ]

    out.log = (type, req)->
      type.should.equal 'run'
      req.should.deep.equal requests.shift()
      if requests.length is 0
        out.log = null

        # waits some time so if something goes wrong, it will throw
        timeout = new setTimeout ->
          done()
        , 500

    ways.go '/pages/33'


  it 'should interrupt a running flow and starts another (destroy+run)', (done)->

    ways.mode 'run+destroy'
    ways '/', run, destroy
    ways '/pages', run, destroy, '/'
    ways '/pages/:id', run, destroy, '/pages'
    ways '/auth', run, destroy
    ways '/login', run, destroy, '/auth'

    requests =  [
      {url: '/', pattern: '/', params: {}}
      {url: '/pages', pattern: '/pages', params: {}}
      {url: '/auth', pattern: '/auth', params: {}}
      {url: '/login', pattern: '/login', params: {}}
    ]

    out.log = (type, req)->
      type.should.equal 'run'
      req.should.deep.equal requests.shift()
      if requests.length is 0
        out.log = null

        # waits some time so if something goes wrong, it will throw
        timeout = new setTimeout ->
          done()
        , 500

    ways.go '/pages/33'