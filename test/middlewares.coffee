Router = require '../lib/ways'
Event = require 'happens'

should = require('chai').should()


class Middleware extends Event
  url: null
  state: null
  title: null

  pathname:-> @url

  push:( @url, @title, @state )->
    @emit 'url:change'

  replace:( @url, @title, @state )->
    


describe '[middlewares]', ->

  it 'should make proper use of middlewares (without initial url)', (done)->

    out = log: null

    render = (req)=>
      out.log 'render', req

    router = new Router
    router.use Middleware

    # second call should do nothing
    router.use Middleware

    router.get '/', render
    router.get '/pages', render
    router.get '/pages/:id', render
    router.get '/pages/:id/edit', render
    router.get '/no/dep', render

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

    should.exist router.pathname()
    router.pathname().should.equal '/pages/33/edit'

    router.push '/pages'
    router.push '/pages/33'
    router.push '/'

  it 'should make proper use of middlewares (with initial url)', (done)->

    out = log: null

    render = (req)=>
      out.log 'render', req

    router = new Router
    router.use Middleware

    router.get '/', render
    router.get '/pages', render
    router.get '/pages/:id', render
    router.get '/pages/:id/edit', render
    router.get '/no/dep', render


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

    router.push '/pages/33/edit'
    router.push '/pages'
    router.push '/pages/33'
    router.push '/'