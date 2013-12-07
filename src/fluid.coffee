module.exports = class Fluid
  route: null
  dependency: null

  constructor:(@route, @url)->
    if @route.dependency?
      @dependency = @route.computed_dependency @url

  run:( url, done )->
    @req = @route.run @url, done

  destroy:(done)->
    if @req?
      @route.destroy @req, done