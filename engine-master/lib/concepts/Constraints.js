var Constraints, method, property, _ref;

Constraints = (function() {
  function Constraints() {}

  Constraints.prototype.onConstraint = function(node, args, result, operation, continuation, scope) {
    var arg, _i, _len;
    if (result instanceof c.Constraint || result instanceof c.Expression) {
      result = [result];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        if (arg instanceof c.Variable) {
          result.push(arg);
        }
        if (arg.paths) {
          result.push.apply(result, arg.paths);
          arg.paths = void 0;
        }
      }
    }
    if (result.length > 0) {
      if (result.length > 1) {
        result[0].paths = result.splice(1);
      }
      return result[0];
    }
    return result;
  };

  Constraints.prototype.get = function(scope, property, path) {
    var variable;
    if (typeof this.properties[property] === 'function' && scope) {
      return this.properties[property].call(this, scope, path);
    } else {
      variable = this["var"](this.getPath(scope, property));
    }
    return [variable, path || (property && scope) || ''];
  };

  Constraints.prototype.remove = function() {
    var constrain, constraints, path, _i, _j, _len;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      path = arguments[_i];
      if (constraints = this.solutions.variables[path]) {
        for (_j = constraints.length - 1; _j >= 0; _j += -1) {
          constrain = constraints[_j];
          this.solutions.remove(constrain, path);
        }
      }
    }
    return this;
  };

  Constraints.prototype["var"] = function(name) {
    var _base;
    return (_base = this.solutions.variables)[name] || (_base[name] = new c.Variable({
      name: name
    }));
  };

  Constraints.prototype.strength = function(strength, deflt) {
    if (deflt == null) {
      deflt = 'medium';
    }
    return strength && c.Strength[strength] || c.Strength[deflt];
  };

  Constraints.prototype.weight = function(weight) {
    return weight;
  };

  Constraints.prototype.varexp = function(name) {
    return new c.Expression({
      name: name
    });
  };

  Constraints.prototype['=='] = function(left, right, strength, weight) {
    return new c.Equation(left, right, this.strength(strength), this.weight(weight));
  };

  Constraints.prototype['<='] = function(left, right, strength, weight) {
    return new c.Inequality(left, c.LEQ, right, this.strength(strength), this.weight(weight));
  };

  Constraints.prototype['>='] = function(left, right, strength, weight) {
    return new c.Inequality(left, c.GEQ, right, this.strength(strength), this.weight(weight));
  };

  Constraints.prototype['<'] = function(left, right, strength, weight) {
    return new c.Inequality(left, c.LEQ, right, this.strength(strength), this.weight(weight));
  };

  Constraints.prototype['>'] = function(left, right, strength, weight) {
    return new c.Inequality(left, c.GEQ, right, this.strength(strength), this.weight(weight));
  };

  Constraints.prototype['+'] = function(left, right, strength, weight) {
    return c.plus(left, right);
  };

  Constraints.prototype['-'] = function(left, right, strength, weight) {
    return c.minus(left, right);
  };

  Constraints.prototype['*'] = function(left, right, strength, weight) {
    return c.times(left, right);
  };

  Constraints.prototype['/'] = function(left, right, strength, weight) {
    return c.divide(left, right);
  };

  return Constraints;

})();

_ref = Constraints.prototype;
for (property in _ref) {
  method = _ref[property];
  if (method.length > 3 && property !== 'onConstraint') {
    (function(property, method) {
      return Constraints.prototype[property] = function(left, right, strength, weight) {
        var overloaded, value;
        if (left.push) {
          overloaded = left = this.onConstraint(null, null, left);
        }
        if (right.push) {
          overloaded = right = this.onConstraint(null, null, right);
        }
        value = method.call(this, left, right, strength, weight);
        if (overloaded) {
          return this.onConstraint(null, [left, right], value);
        }
        return value;
      };
    })(property, method);
  }
  Constraints.prototype[property].after = 'onConstraint';
}

module.exports = Constraints;
