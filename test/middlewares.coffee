ways = require '../lib/ways'
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

    out =
      log: (type, req)->
        type.should.equal 'run'
        req.should.deep.equal requests.shift()
        if requests.length is 0
          out.log = null
          done()

    run = (req)=>
      out.log 'run', req

    ways.reset()
    ways.use Middleware

    ways '/', run
    ways '/pages', run
    ways '/pages/:id', run
    ways '/pages/:id/edit', run
    ways '/no/dep', run

    requests =  [
      {url: '/pages/33/edit', pattern: '/pages/:id/edit', params: {id:'33'}}
      {url: '/pages', pattern: '/pages', params: {}}
      {url: '/pages/33', pattern: '/pages/:id', params: {id:'33'}}
      {url: '/', pattern: '/', params: {}}
    ]

    # replace shouldn't do anything
    ways.go.silent '/pages/33/edit'
    ways.go '/pages/33/edit'

    should.exist ways.pathname()
    ways.pathname().should.equal '/pages/33/edit'

    ways.go '/pages'
    ways.go '/pages/33'
    ways.go '/'

  it 'should make proper use of middlewares (with initial url)', (done)->

    out =
      log: (type, req)->
        type.should.equal 'run'
        req.should.deep.equal requests.shift()
        if requests.length is 0
          out.log = null
          done()

    run = (req)=>
      out.log 'run', req

    ways.reset()
    ways.use Middleware

    ways '/', run
    ways '/pages', run
    ways '/pages/:id', run
    ways '/pages/:id/edit', run
    ways '/no/dep', run

    requests =  [
      {url: '/pages/33/edit', pattern: '/pages/:id/edit', params: {id:'33'}}
      {url: '/pages', pattern: '/pages', params: {}}
      {url: '/pages/33', pattern: '/pages/:id', params: {id:'33'}}
      {url: '/', pattern: '/', params: {}}
    ]

    ways.go '/pages/33/edit'
    ways.go '/pages'
    ways.go '/pages/33'
    ways.go '/'