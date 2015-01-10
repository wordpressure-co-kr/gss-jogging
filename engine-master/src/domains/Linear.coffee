Domain  = require('../concepts/Domain')

class Linear extends Domain
  priority: -100

  Solver:  require('cassowary')
  Wrapper: require('../concepts/Wrapper')

  # Convert expressions into cassowary objects

  isVariable: (object) ->
    return object instanceof c.Variable

  isConstraint: (object) ->
    return object instanceof c.Constraint

  isExpression: (object) ->
    return object instanceof c.Expression

  setup: () ->
    super

    unless @hasOwnProperty('solver')
      @solver = new c.SimplexSolver()
      @solver.autoSolve = false
      @solver._store = []

      # Phantom js doesnt enforce order of numerical keys in plain objects. Use arrays
      unless c.isUnordered?
        obj = {9: 1, 10: 1}
        for property of obj
          break
        if c.isUnordered = (property == 10)
          set = c.HashTable.prototype.set
          c.HashTable.prototype.set = ->
            if !@_store.push
              store = @_store
              @_store = []
              for property of store
                @_store[property] = store[property]

            return set.apply(@, arguments)
      c.debug = true
      c.Strength.require = c.Strength.required

  provide: (result) ->
    @constrain(result)
    return

  perform: ->
    if @constrained
      @constrained = @suggested = undefined
      if @solver._needsSolving
        @solver.solve()
        return @solver._changed
    else if @suggested
      @suggested = undefined
      @solver.resolve()
      return @solver._changed

  addConstraint: (constraint) ->
    @solver.addConstraint(constraint)

  removeConstraint: (constraint) ->
    @solver.removeConstraint(constraint)

  unedit: (variable) ->
    if variable.editing
      if cei = @solver._editVarMap.get(variable)
        @solver.removeColumn(cei.editMinus)
        @solver._editVarMap.delete(variable)
      super

  edit: (variable, strength, weight, continuation) ->
    unless constraint = variable.editing
      constraint = new c.EditConstraint(variable, @strength(strength, 'strong'), @weight(weight))
      constraint.paths = [variable]
      @addConstraint constraint
      variable.editing = constraint
      @constrained ||= []
    
    return constraint

  nullify: (variable) ->
    @solver._externalParametricVars.delete(variable)
    @solver._externalRows.delete(variable)


  suggest: (path, value, strength, weight, continuation) ->
    if typeof path == 'string'
      unless variable = @variables[path]
        if continuation
          variable = @declare(path)
          variables = (@variables[continuation] ||= [])
          variables.push(variable)
        else
          return @verify path, value
    else
      variable = path

    @edit(variable, strength, weight, continuation)
    @solver.suggestValue(variable, value)
    @suggested = true
    return variable

  variable: (name) ->
    return new c.Variable name: name

  stay: ->
    @suggested = true
    for arg in arguments
      @solver.addStay(arg)
    return


class Linear::Methods extends Domain::Methods
  get: 
    command: (operation, continuation, scope, meta, object, property, path) ->
      if typeof @properties[property] == 'function' && scope && scope != @scope
        return @properties[property].call(@, object, object)
      else
        absolute = @Variable.getPath(object, property)
        variable = @declare(absolute, operation)
        if variable.constraints
          for constrain in variable.constraints
            if constrain.domain && constrain.domain.frame && constrain.domain.frame != @frame
              delete @added[absolute]
              return variable.value 
      return [variable, path || (property && object) || '']

  strength: (strength, deflt = 'medium') ->
    return strength && c.Strength[strength] || c.Strength[deflt]

  weight: (weight) ->
    return weight

  varexp: (name) ->
    return new c.Expression name: name

  suggest: ->
    return @suggest.apply(@, arguments)


  '==': (left, right, strength, weight) ->
    return new c.Equation(left, right, @strength(strength), @weight(weight))

  '<=': (left, right, strength, weight) ->
    return new c.Inequality(left, c.LEQ, right, @strength(strength), @weight(weight))

  '>=': (left, right, strength, weight) ->
    return new c.Inequality(left, c.GEQ, right, @strength(strength), @weight(weight))

  '<': (left, right, strength, weight) ->
    return new c.Inequality(left, c.LEQ, right, @strength(strength), @weight(weight))

  '>': (left, right, strength, weight) ->
    return new c.Inequality(left, c.GEQ, right, @strength(strength), @weight(weight))

  '+': (left, right, strength, weight) ->
    return c.plus(left, right)

  '-': (left, right, strength, weight) ->
    return c.minus(left, right)

  '*': (left, right, strength, weight) ->
    return c.times(left, right)

  '/': (left, right, strength, weight) ->
    return c.divide(left, right)
    
module.exports = Linear
