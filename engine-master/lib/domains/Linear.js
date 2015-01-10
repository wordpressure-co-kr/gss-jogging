var Domain, Linear, _ref, _ref1,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Domain = require('../concepts/Domain');

Linear = (function(_super) {
  __extends(Linear, _super);

  function Linear() {
    _ref = Linear.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Linear.prototype.priority = -100;

  Linear.prototype.Solver = require('cassowary');

  Linear.prototype.Wrapper = require('../concepts/Wrapper');

  Linear.prototype.isVariable = function(object) {
    return object instanceof c.Variable;
  };

  Linear.prototype.isConstraint = function(object) {
    return object instanceof c.Constraint;
  };

  Linear.prototype.isExpression = function(object) {
    return object instanceof c.Expression;
  };

  Linear.prototype.setup = function() {
    var obj, property, set;
    Linear.__super__.setup.apply(this, arguments);
    if (!this.hasOwnProperty('solver')) {
      this.solver = new c.SimplexSolver();
      this.solver.autoSolve = false;
      this.solver._store = [];
      if (c.isUnordered == null) {
        obj = {
          9: 1,
          10: 1
        };
        for (property in obj) {
          break;
        }
        if (c.isUnordered = property === 10) {
          set = c.HashTable.prototype.set;
          c.HashTable.prototype.set = function() {
            var store;
            if (!this._store.push) {
              store = this._store;
              this._store = [];
              for (property in store) {
                this._store[property] = store[property];
              }
            }
            return set.apply(this, arguments);
          };
        }
      }
      c.debug = true;
      return c.Strength.require = c.Strength.required;
    }
  };

  Linear.prototype.provide = function(result) {
    this.constrain(result);
  };

  Linear.prototype.perform = function() {
    if (this.constrained) {
      this.constrained = this.suggested = void 0;
      if (this.solver._needsSolving) {
        this.solver.solve();
        return this.solver._changed;
      }
    } else if (this.suggested) {
      this.suggested = void 0;
      this.solver.resolve();
      return this.solver._changed;
    }
  };

  Linear.prototype.addConstraint = function(constraint) {
    return this.solver.addConstraint(constraint);
  };

  Linear.prototype.removeConstraint = function(constraint) {
    return this.solver.removeConstraint(constraint);
  };

  Linear.prototype.unedit = function(variable) {
    var cei;
    if (variable.editing) {
      if (cei = this.solver._editVarMap.get(variable)) {
        this.solver.removeColumn(cei.editMinus);
        this.solver._editVarMap["delete"](variable);
      }
      return Linear.__super__.unedit.apply(this, arguments);
    }
  };

  Linear.prototype.edit = function(variable, strength, weight, continuation) {
    var constraint;
    if (!(constraint = variable.editing)) {
      constraint = new c.EditConstraint(variable, this.strength(strength, 'strong'), this.weight(weight));
      constraint.paths = [variable];
      this.addConstraint(constraint);
      variable.editing = constraint;
      this.constrained || (this.constrained = []);
    }
    return constraint;
  };

  Linear.prototype.nullify = function(variable) {
    this.solver._externalParametricVars["delete"](variable);
    return this.solver._externalRows["delete"](variable);
  };

  Linear.prototype.suggest = function(path, value, strength, weight, continuation) {
    var variable, variables, _base;
    if (typeof path === 'string') {
      if (!(variable = this.variables[path])) {
        if (continuation) {
          variable = this.declare(path);
          variables = ((_base = this.variables)[continuation] || (_base[continuation] = []));
          variables.push(variable);
        } else {
          return this.verify(path, value);
        }
      }
    } else {
      variable = path;
    }
    this.edit(variable, strength, weight, continuation);
    this.solver.suggestValue(variable, value);
    this.suggested = true;
    return variable;
  };

  Linear.prototype.variable = function(name) {
    return new c.Variable({
      name: name
    });
  };

  Linear.prototype.stay = function() {
    var arg, _i, _len;
    this.suggested = true;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      arg = arguments[_i];
      this.solver.addStay(arg);
    }
  };

  return Linear;

})(Domain);

Linear.prototype.Methods = (function(_super) {
  __extends(Methods, _super);

  function Methods() {
    _ref1 = Methods.__super__.constructor.apply(this, arguments);
    return _ref1;
  }

  Methods.prototype.get = {
    command: function(operation, continuation, scope, meta, object, property, path) {
      var absolute, constrain, variable, _i, _len, _ref2;
      if (typeof this.properties[property] === 'function' && scope && scope !== this.scope) {
        return this.properties[property].call(this, object, object);
      } else {
        absolute = this.Variable.getPath(object, property);
        variable = this.declare(absolute, operation);
        if (variable.constraints) {
          _ref2 = variable.constraints;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            constrain = _ref2[_i];
            if (constrain.domain && constrain.domain.frame && constrain.domain.frame !== this.frame) {
              delete this.added[absolute];
              return variable.value;
            }
          }
        }
      }
      return [variable, path || (property && object) || ''];
    }
  };

  Methods.prototype.strength = function(strength, deflt) {
    if (deflt == null) {
      deflt = 'medium';
    }
    return strength && c.Strength[strength] || c.Strength[deflt];
  };

  Methods.prototype.weight = function(weight) {
    return weight;
  };

  Methods.prototype.varexp = function(name) {
    return new c.Expression({
      name: name
    });
  };

  Methods.prototype.suggest = function() {
    return this.suggest.apply(this, arguments);
  };

  Methods.prototype['=='] = function(left, right, strength, weight) {
    return new c.Equation(left, right, this.strength(strength), this.weight(weight));
  };

  Methods.prototype['<='] = function(left, right, strength, weight) {
    return new c.Inequality(left, c.LEQ, right, this.strength(strength), this.weight(weight));
  };

  Methods.prototype['>='] = function(left, right, strength, weight) {
    return new c.Inequality(left, c.GEQ, right, this.strength(strength), this.weight(weight));
  };

  Methods.prototype['<'] = function(left, right, strength, weight) {
    return new c.Inequality(left, c.LEQ, right, this.strength(strength), this.weight(weight));
  };

  Methods.prototype['>'] = function(left, right, strength, weight) {
    return new c.Inequality(left, c.GEQ, right, this.strength(strength), this.weight(weight));
  };

  Methods.prototype['+'] = function(left, right, strength, weight) {
    return c.plus(left, right);
  };

  Methods.prototype['-'] = function(left, right, strength, weight) {
    return c.minus(left, right);
  };

  Methods.prototype['*'] = function(left, right, strength, weight) {
    return c.times(left, right);
  };

  Methods.prototype['/'] = function(left, right, strength, weight) {
    return c.divide(left, right);
  };

  return Methods;

})(Domain.prototype.Methods);

module.exports = Linear;
