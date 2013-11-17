Fluid = require './fluid'

find = (arr, filter)->
  return item for item in arr when filter item

reject = (arr, filter)->
  item for item in arr when not filter item

module.exports = class Flow

  router: null

  deads: null
  atives: null
  pendings: null

  constructor:( @router )->
    @deads = []
    @actives = []
    @pendings = []


  run:(url, route)->
    fluid = new Fluid route, url

    @filter_pendings fluid
    @filter_deads()

    if @router.mode is 'render+destroy'
      @run_pendings url, =>
        @destroy_deads =>
          # console.log '>>> status = free (render+destroy)'

    if @router.mode is 'destroy+render'
      @destroy_deads =>
        @run_pendings url, =>
          # console.log '>>> status = free (destroy+render)'


  _find_dependency:( parent )->

    # 1 - searching in active fluids
    fluid = find @actives, (f)->
      return f.url is parent.dependency

    if fluid?
      return fluid

    # 2 - searching in router's routes
    route = find @router.routes, (r)->
      r.matcher.test parent.route.dependency

    if route?
      return new Fluid route, parent.dependency

    # not found
    return null

  filter_pendings:( parent )->
    @pendings.unshift parent

    unless parent.dependency?
      return

    if (fluid = @_find_dependency parent)?
      return @filter_pendings fluid
    
    route = parent.route.pattern
    err = "Dependency '#{parent.dependency}' not found for route '#{route}'"
    throw new Error err


  filter_deads:->
    for fluid in @actives
      is_pending = find @pendings, (f)-> f.url is fluid.url
      @deads.push fluid if not is_pending


  run_pendings:( url, done )->
    if @pendings.length is 0
      return done()

    fluid = @pendings.shift()
    is_active = find @actives, (f)-> f.url is fluid.url

    # skips already active routes
    return @run_pendings url, done if is_active

    # or run new ones
    @actives.push fluid
    fluid.run url, => @run_pendings url, done

  destroy_deads:( done )->
    if @deads.length is 0
      return done()

    fluid = @deads.pop()
    @actives = reject @actives, (f)-> f.url is fluid.url
    fluid.destroy => @destroy_deads done