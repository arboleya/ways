module.exports = class Way

  pattern: null
  runner: null
  destroyer: null
  dependency: null

  matcher: null

  named_param_reg = /:\w+/g
  splat_param_reg = /\*\w+/g
  optional_param_reg = /\/(?:\:|\*)(\w+)\?/g

  constructor:(@pattern, @runner, @destroyer, @dependency)->
    if @pattern is '*'
      @matcher = /.*/
    else
      @matcher = pattern.replace optional_param_reg, '(?:\/)?:$1?'
      @matcher = @matcher.replace named_param_reg, '([^\/]+)'
      @matcher = @matcher.replace splat_param_reg, '(.*?)'
      @matcher = new RegExp "^#{@matcher}$", 'm'

  extract_params:(url)->
    names = @pattern.match /(?::|\*)(\w+)/g
    return {} unless names?

    vals = url.match @matcher
    params = {}
    for name, index in names
      params[name.substr 1] = vals[index + 1]

    return params

  rewrite_pattern:(pattern, url)->
    for key, value of @extract_params url
      reg = new RegExp "[\:\*]+#{key}", 'g'
      pattern = pattern.replace reg, value

    return pattern

  computed_dependency:( url )->
    @rewrite_pattern @dependency, url

  run:( url, done )->
    req = {url, @pattern, params: @extract_params url}
    @runner req, done
    return req

  destroy:(req, done)->
    @destroyer req, done