Router = require '../lib/ways'
should = require('chai').should()

describe '[flow-mode] render+destroy', ->

  out = null
  router = null

  before ->
    out = {}

    render = (req, done)->
      out?.log 'render', req
      done()

    destroy = (req, done)->
      out?.log 'destroy', req
      done()

    router = new Router 'render+destroy'
    router.get '/', render, destroy
    router.get '/pages', render, destroy, '/'
    router.get '/pages/:id', render, destroy, '/pages'
    router.get '/pages/:id/edit', render, destroy, '/pages/:id'
    router.get '/no/dep', render, destroy, '/this/does/not/exist'


  it 'should render route with param from scratch', (done)->

    requests =  [
      {url: '/', pattern: '/', params: {}}
      {url: '/pages', pattern: '/pages', params: {}}
      {url: '/pages/33', pattern: '/pages/:id', params: {id:'33'}}
      {url: '/pages/33/edit', pattern: '/pages/:id/edit', params: {id:'33'}}
    ]

    out.log = (type, req)->
      type.should.equal 'render'
      req.should.deep.equal requests.shift()
      if requests.length is 0
        out.log = null
        done()

    router.push '/pages/33/edit'



  it 'should run pendings and destroy deads', (done)->

    types = 'render render destroy destroy'.split ' '

    requests =  [
      # render
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

    router.push '/pages/22/edit'



  it 'should error on route not found', ->
    msg = "Route not found for url '/this/route/does/not/exist'"
    try
      router.push '/this/route/does/not/exist'
    catch err
      err.message.should.equal msg



  it 'should error on dependency not found', ->
    msg = "Dependency '/this/does/not/exist' not found for route '/no/dep'"
    try
      router.push '/no/dep'
    catch err
      err.message.should.equal msg