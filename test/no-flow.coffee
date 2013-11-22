Router = require '../lib'
should = require('chai').should()

describe '[no-flow-mode]', ->

  out = null
  router = null

  before ->

    out = {}

    render = (req)->
      out?.log 'render', req

    router = new Router
    router.get '/', render
    router.get '/pages', render
    router.get '/pages/:id', render
    router.get '/pages/:id/edit', render
    router.get '/no/dep', render


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
    router.replace '/pages/33/edit'

    router.push '/pages/33/edit'
    router.push '/pages'
    router.push '/pages/33'
    router.push '/'