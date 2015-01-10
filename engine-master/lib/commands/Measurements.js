var Measurements;

Measurements = (function() {
  function Measurements() {}

  Measurements.prototype.get = {
    command: function(operation, continuation, scope, meta, object, property, primitive) {
      var child, id, index, parent, path, prop, _ref;
      if (property) {
        if (typeof object === 'string') {
          id = object;
        } else if (object.absolute === 'window' || object === document) {
          id = '::window';
        } else if (object.nodeType) {
          id = this.identify(object);
        }
      } else {
        id = '';
        property = object;
        object = void 0;
      }
      if (operation && !primitive) {
        parent = child = operation;
        while (parent = parent.parent) {
          if (child.index) {
            if (parent.def.primitive === child.index) {
              primitive = true;
              break;
            }
          }
          child = parent;
        }
      }
      if ((property.indexOf('intrinsic-') > -1) || (((_ref = this.properties[id]) != null ? _ref[property] : void 0) != null)) {
        path = this.measure(id, property, continuation, true, true, primitive);
        if (typeof path === 'string' && (index = path.indexOf('[')) > -1) {
          id = path.substring(0, index);
          property = path.substring(index + 1, path.length - 1);
        }
      } else {
        if (id && (prop = this.properties[property])) {
          if (typeof prop === 'function' && prop.initial === void 0) {
            return prop.call(this, id, continuation);
          }
        }
      }
      if (primitive) {
        return this.values.watch(id, property, operation, continuation, scope);
      }
      return ['get', id, property, this.getContinuation(continuation || '')];
    }
  };

  Measurements.prototype.suggest = {
    command: function(operation, continuation, scope, meta, variable, value, strength, weight, contd) {
      if (continuation) {
        contd || (contd = this.getContinuation(continuation));
      }
      return ['suggest', variable, value, strength != null ? strength : null, weight != null ? weight : null, contd != null ? contd : null];
    }
  };

  Measurements.prototype.onBuffer = function(buffer, args, batch) {
    var last;
    if (!(buffer && batch)) {
      return;
    }
    if (last = buffer[buffer.length - 1]) {
      if (last[0] === args[0]) {
        if (last.indexOf(args[1]) === -1) {
          last.push.apply(last, args.slice(1));
        }
        return false;
      }
    }
  };

  Measurements.prototype.onFlush = function(buffer) {
    return this.getSuggestions(!buffer);
  };

  Measurements.prototype.onMeasure = function(node, x, y, styles, full) {
    var id, path, prop, properties, _i, _len;
    if (!this.intrinsic) {
      return;
    }
    if (id = node._gss_id) {
      if (properties = this.intrinsic[id]) {
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
          prop = properties[_i];
          if (full && (prop === 'width' || prop === 'height')) {
            continue;
          }
          path = id + "[intrinsic-" + prop + "]";
          switch (prop) {
            case "x":
              (this.measured || (this.measured = {}))[path] = x + node.offsetLeft;
              break;
            case "y":
              (this.measured || (this.measured = {}))[path] = y + node.offsetTop;
              break;
            case "width":
              (this.measured || (this.measured = {}))[path] = node.offsetWidth;
              break;
            case "height":
              (this.measured || (this.measured = {}))[path] = node.offsetHeight;
              break;
            default:
              this.values.set(null, path, this.getStyle(node, prop));
          }
        }
      }
    }
  };

  Measurements.prototype.onResize = function(node) {};

  Measurements.prototype.onChange = function(path, value, old) {
    var group, id, prop, _base;
    if ((old != null) !== (value != null)) {
      if (prop = this.getIntrinsicProperty(path)) {
        id = path.substring(0, path.length - prop.length - 10 - 2);
        if (value != null) {
          return ((_base = (this.intrinsic || (this.intrinsic = {})))[id] || (_base[id] = [])).push(prop);
        } else {
          group = this.intrinsic[id];
          group.splice(group.indexOf(path), 1);
          if (!group.length) {
            return delete this.intrinsic[id];
          }
        }
      }
    }
  };

  Measurements.prototype.getStyle = function(element, property) {
    var prop, value;
    prop = this.camelize(property);
    value = element.style[property];
    if (value === '') {
      value = this.getComputedStyle(element)[prop];
    }
    value = this.toPrimitive(value, null, null, null, element, prop);
    if (value.push && typeof value[0] === 'object') {
      return this.properties[property].apply(this, value);
    } else {
      return this.properties[property].call(this, value);
    }
  };

  Measurements.prototype.toPrimitive = function(object, operation, continuation, scope, element, prop) {
    var value;
    if (typeof object === 'string') {
      object = this.parse(object);
    }
    if (typeof object === 'object') {
      if (object[0] === 'get' && this.getIntrinsicProperty(object[2])) {
        value = this.get.command.call(this, operation, continuation, scope, 'return', object[1], object[2], true);
        if (value != null) {
          if (typeof (object = value) !== 'object') {
            return object;
          }
        } else {
          return object;
        }
      }
      if ((continuation == null) && element) {
        continuation = this.getPath(element, prop);
      }
      return this.capture('toPrimitive(' + continuation + ')', object, continuation, scope, 'return');
    }
    return object;
  };

  Measurements.prototype._staticUnit = /^(-?\d+)(px|pt|cm|mm|in)$/i;

  Measurements.prototype.parse = function(value) {
    var match, old;
    if ((old = (this.parsed || (this.parsed = {}))[value]) == null) {
      if (typeof value === 'string') {
        if (match = value.match(this._staticUnit)) {
          return this.parsed[value] = this[match[2]](parseFloat(match[1]));
        } else {
          value = 'a: == ' + value + ';';
          return this.parsed[value] = GSS.Parser.parse(value).commands[0][2];
        }
      } else {
        return value;
      }
    }
    return old;
  };

  Measurements.prototype.setStyle = function(element, property, value) {
    return element.style[property] = value;
  };

  Measurements.prototype.set = {
    command: function(operation, continuation, scope, meta, property, value) {
      var prop;
      prop = this.camelize(property);
      if (scope && scope.style[prop] !== void 0) {
        this.setStyle(scope, prop, value);
      }
    }
  };

  Measurements.prototype.getCommonParent = function(a, b) {
    var ap, aps, bp, bps;
    aps = [];
    bps = [];
    ap = a;
    bp = b;
    while (ap && bp) {
      aps.push(ap);
      bps.push(bp);
      ap = ap.parentNode;
      bp = bp.parentNode;
      if (bps.indexOf(ap) > -1) {
        return ap;
      }
      if (aps.indexOf(bp) > -1) {
        return bp;
      }
    }
    return suggestions;
  };

  return Measurements;

})();

module.exports = Measurements;
