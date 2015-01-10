var Rules;

Rules = (function() {
  function Rules() {}

  Rules.prototype[';'] = {
    prefix: '',
    noop: true,
    evaluate: function(arg, evaluated) {
      var value;
      if (arg.index === 0) {
        return arg;
      }
      if (arg.index === 1 || (evaluated[1] && arg.index === 2)) {
        value = this.evaluate(arg);
        if (value === void 0) {
          value = null;
        }
        return value;
      }
    }
  };

  Rules.prototype["$rule"] = {
    evaluate: function(operation, continuation, scope, ascender, ascending) {
      if (operation.index === 2 && !ascender) {
        this.evaluate(operation, continuation, ascending, void 0, void 0, operation.parent);
      } else {
        return this;
      }
    },
    capture: function(engine, result, parent, continuation, scope) {
      return engine.expressions.push(result);
    },
    command: function(path, condition, positive, negative) {
      if (condition) {
        return positive;
      } else {
        return negative;
      }
    }
  };

  Rules.prototype["$if"] = {
    prefix: "@if",
    evaluate: function(arg, i, evaluated) {
      var _ref;
      if (i === 0) {
        return arg;
      }
      if (i === 1 || ((_ref = evaluated[1]) != null ? _ref : i === {
        2: i === 3
      })) {
        return this.evaluate(arg);
      }
    }
  };

  return Rules;

})();

module.exports = Rules;
