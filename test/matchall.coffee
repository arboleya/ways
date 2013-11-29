Router = require '../lib/ways'
should = require('chai').should()

describe '[match-all]', ->

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

    router = new Router 'destroy+render'
    router.get '/', render, destroy
    router.get '*', render, destroy, '/'


  it 'should render match-all route', (done)->

    requests =  [
      {url: '/', pattern: '/', params: {}}
      {url: '/anything', pattern: '*', params: {}}
    ]

    out.log = (type, req)->
      type.should.equal 'render'
      req.should.deep.equal requests.shift()
      if requests.length is 0
        out.log = null
        done()

    router.push '/anything'