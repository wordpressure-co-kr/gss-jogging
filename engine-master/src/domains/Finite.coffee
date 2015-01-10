Domain = require('../concepts/Domain')

class Finite extends Domain
  priority: -10

  #Solver: require('FD')
  Wrapper: require('../concepts/Wrapper')

  constructor: ->
    super
    #@solver = new FD.Space
    
class Finite::Methods extends Domain::Methods

  value: (value) ->
    return value

  variable: (name) ->
    return @solver.decl name

  '==': (left, right) ->
    return @solver.eq left, right

  '!=': (left, right) ->
    return @solver.neq left, right

  'distinct': () ->
    return @solver.distinct.apply(@solver, arguments)

  '<=': (left, right) ->
    return @solver.lte left, right

  '>=': (left, right) ->
    return @solver.gte left, right

  '<': (left, right) ->
    return @solver.lt left, right

  '>': (left, right) ->
    return @solver.gt left, right

  '+': (left, right) ->
    return @solver.plus left, right

  '-': (left, right) ->
    return @solver.minus left, right

  '*': (left, right) ->
    return @solver.product left, right

  '/': (left, right) ->
    return @solver.divide left, right

module.exports = Finite
