Router = require '../lib/ways'
should = require('chai').should()

describe '[flow-interruption] destroy+render', ->

  out = null
  router = null

  before ->
    out = {}

    render = (req, done)->
      out?.log 'render', req
      if req.url is '/pages'
        router.push '/login'
      done()

    destroy = (req, done)->
      out?.log 'destroy', req
      done()

    router = new Router 'destroy+render'
    router.get '/', render, destroy
    router.get '/pages', render, destroy, '/'
    router.get '/pages/:id', render, destroy, '/pages'
    router.get '/login', render, destroy


  it 'should render route with param from scratch', (done)->

    requests =  [
      {url: '/', pattern: '/', params: {}}
      {url: '/pages', pattern: '/pages', params: {}}
      {url: '/login', pattern: '/login', params: {}}
    ]

    out.log = (type, req)->
      type.should.equal 'render'
      req.should.deep.equal requests.shift()
      if requests.length is 0
        out.log = null

        # waits some time so if something goes wrong, it will throw
        timeout = new setTimeout ->
          done()
        , 500

    router.push '/pages/33'