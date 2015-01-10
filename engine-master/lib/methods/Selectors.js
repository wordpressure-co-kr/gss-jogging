/* Selectors with custom combinators 
inspired by Slick of mootools fame (shout-out & credits)

Combinators/qualifiers are map/reduce of DOM tree.
Selectors are parsed into individual functional steps.
Steps are combined when possible into querySelectorAll calls

Map: If step returns collection, the rest of selector 
is executed for each element in collection 

Filter: If step returns single element, e.g. it matches qualifier,
or points to a another element, execution is continued (reduce)

Reduce: Otherwise, the selector branch doesnt match, execution stops.
Found elements are collected into a shared collection 

When it hits the end of selector, parent expression is evaluated 
with found element.
*/

var Selectors, command, dummy, property, _ref;

Selectors = (function() {
  function Selectors() {}

  Selectors.prototype.onBeforeQuery = function(node, args, operation, continuation, scope) {
    if (operation.def.hidden) {
      return;
    }
    return this.queries.fetch(node, args, operation, continuation, scope);
  };

  Selectors.prototype.onQuery = function(node, args, result, operation, continuation, scope) {
    if (operation.def.hidden) {
      return result;
    }
    return this.queries.update(node, args, result, operation, continuation, scope);
  };

  Selectors.prototype.onSelector = function(operation, parent, def) {
    var group, index, prefix, _base, _base1;
    prefix = ((parent && operation.name !== ' ') || (operation[0] !== '$combinator' && typeof operation[1] !== 'object')) && ' ' || '';
    switch (operation[0]) {
      case '$tag':
        if ((!parent || operation === operation.tail) && operation[1][0] !== '$combinator') {
          group = ' ';
          index = (operation[2] || operation[1]).toUpperCase();
        }
        break;
      case '$combinator':
        group = prefix + operation.name;
        index = operation.parent.name === "$tag" && operation.parent[2].toUpperCase() || "*";
        break;
      case '$class':
      case '$pseudo':
      case '$attribute':
      case '$id':
        group = prefix + operation[0];
        index = operation[2] || operation[1];
    }
    if (!group) {
      return;
    }
    return ((_base = ((_base1 = parent || operation)[group] || (_base1[group] = {})))[index] || (_base[index] = [])).push(operation);
  };

  Selectors.prototype['$first'] = {
    group: '$query',
    1: "querySelector"
  };

  Selectors.prototype['$query'] = {
    group: '$query',
    1: "querySelectorAll",
    2: function(node, value) {
      if (node.webkitMatchesSelector(value)) {
        return node;
      }
    },
    perform: function(operation) {
      var global, head, name, op, shortcut, tail;
      head = operation.head || operation;
      name = operation.def.group;
      shortcut = [name, head.groupped];
      shortcut.parent = head.parent;
      shortcut.index = head.index;
      if (head.bound) {
        shortcut.bound = head.bound;
      }
      this.Operation.analyze(shortcut);
      tail = operation.tail;
      if (!(global = tail.arity === 1 && tail.length === 2)) {
        shortcut.splice(1, 0, tail[1]);
      }
      op = head;
      while (op != null ? op.push : void 0) {
        this.onSelector(op, shortcut, op.def);
        if (op === tail) {
          break;
        }
        op = op[1];
      }
      if (!global) {
        if (tail.parent === operation) {
          shortcut.splice(1, 0, tail[1]);
        }
      }
      if (shortcut.length > 2) {
        if (operation.marked) {
          shortcut.marked = operation.marked;
          shortcut.path = shortcut.key = head.path;
        }
      }
      return shortcut;
    },
    promise: function(operation, parent) {
      var arg, index, promise, _i, _len;
      if (operation.def.separator) {
        for (index = _i = 0, _len = operation.length; _i < _len; index = ++_i) {
          arg = operation[index];
          if (!index) {
            continue;
          }
        }
      }
      promise = operation.groupped;
      if (operation.tail) {
        if (operation[0] === '$combinator' && (parent[0] === '$combinator' || parent[0] === ',')) {
          promise += "*";
        }
      }
      return promise;
    },
    condition: function(operation) {
      if (operation[0] === '$combinator') {
        if (operation.name !== ' ') {
          return false;
        }
      } else if (operation.arity === 2) {
        return false;
      }
      return true;
    }
  };

  Selectors.prototype['$class'] = {
    prefix: '.',
    group: '$query',
    1: "getElementsByClassName",
    2: function(node, value) {
      if (node.classList.contains(value)) {
        return node;
      }
    }
  };

  Selectors.prototype['$tag'] = {
    prefix: '',
    group: '$query',
    1: "getElementsByTagName",
    2: function(node, value) {
      if (value === '*' || node.tagName === value.toUpperCase()) {
        return node;
      }
    }
  };

  Selectors.prototype['$id'] = {
    prefix: '#',
    group: '$query',
    scoped: true,
    1: "getElementById",
    2: function(node, value) {
      if (node.id === value) {
        return node;
      }
    }
  };

  Selectors.prototype['getElementById'] = function(node, id) {
    if (id == null) {
      id = node;
    }
    return (node.nodeType && node || this.scope).querySelector('[id="' + id + '"]');
  };

  Selectors.prototype['$virtual'] = {
    prefix: '"',
    suffix: '"',
    virtual: true,
    1: function(value) {
      return '"' + value + '"';
    },
    command: function(o, c, s, m, scope, value) {
      var collection;
      if ((c != null ? c.charAt(0) : void 0) === this.Continuation.PAIR) {
        collection = [this.identity.provide(scope) + '"' + value + '"'];
        collection.isCollection = true;
        return collection;
      } else {
        return this.identity.provide(scope) + '"' + value + '"';
      }
    }
  };

  Selectors.prototype['$nth'] = {
    prefix: ':nth(',
    suffix: ')',
    command: function(node, divisor, comparison) {
      var i, nodes, _i, _len;
      nodes = [];
      for (node = _i = 0, _len = node.length; _i < _len; node = ++_i) {
        i = node[node];
        if (i % parseInt(divisor) === parseInt(comparison)) {
          nodes.push(nodes);
        }
      }
      return nodes;
    }
  };

  Selectors.prototype['$combinator'] = {
    prefix: '',
    type: 'combinator',
    lookup: '$'
  };

  Selectors.prototype['$ '] = {
    group: '$query',
    1: function(node) {
      return node.getElementsByTagName("*");
    }
  };

  Selectors.prototype['$!'] = {
    1: function(node) {
      var nodes;
      nodes = void 0;
      while (node = node.parentNode) {
        if (node.nodeType === 1) {
          (nodes || (nodes = [])).push(node);
        }
      }
      return nodes;
    }
  };

  Selectors.prototype['$>'] = {
    group: '$query',
    1: function(node) {
      return node.children;
    }
  };

  Selectors.prototype['$!>'] = {
    1: function(node) {
      return node.parentElement;
    }
  };

  Selectors.prototype['$+'] = {
    group: '$query',
    1: function(node) {
      return node.nextElementSibling;
    }
  };

  Selectors.prototype['$!+'] = {
    1: function(node) {
      return node.previousElementSibling;
    }
  };

  Selectors.prototype['$++'] = {
    1: function(node) {
      var next, nodes, prev;
      nodes = void 0;
      if (prev = node.previousElementSibling) {
        (nodes || (nodes = [])).push(prev);
      }
      if (next = node.nextElementSibling) {
        (nodes || (nodes = [])).push(next);
      }
      return nodes;
    }
  };

  Selectors.prototype['$~'] = {
    group: '$query',
    1: function(node) {
      var nodes;
      nodes = void 0;
      while (node = node.nextElementSibling) {
        (nodes || (nodes = [])).push(node);
      }
      return nodes;
    }
  };

  Selectors.prototype['$!~'] = {
    1: function(node) {
      var nodes, prev;
      nodes = void 0;
      prev = node.parentNode.firstElementChild;
      while (prev !== node) {
        (nodes || (nodes = [])).push(prev);
        prev = prev.nextElementSibling;
      }
      return nodes;
    }
  };

  Selectors.prototype['$~~'] = {
    1: function(node) {
      var nodes, prev;
      nodes = void 0;
      prev = node.parentNode.firstElementChild;
      while (prev) {
        if (prev !== node) {
          (nodes || (nodes = [])).push(prev);
        }
        prev = prev.nextElementSibling;
      }
      return nodes;
    }
  };

  Selectors.prototype['$reserved'] = {
    type: 'combinator',
    prefix: '::',
    lookup: true
  };

  Selectors.prototype['::this'] = {
    hidden: true,
    mark: 'ASCEND',
    command: function(operation, continuation, scope, meta, node) {
      return node || scope;
    }
  };

  Selectors.prototype['::parent'] = {
    1: Selectors.prototype['$!>'][1]
  };

  Selectors.prototype['::scope'] = {
    hidden: true,
    1: function(node) {
      return this.scope;
    }
  };

  Selectors.prototype['::window'] = {
    hidden: true,
    command: function() {
      return '::window';
    }
  };

  Selectors.prototype['$attribute'] = {
    lookup: true,
    prefix: '[',
    suffix: ']'
  };

  Selectors.prototype['[=]'] = {
    binary: true,
    quote: true,
    group: '$query',
    command: function(operation, continuation, scope, meta, node, attribute, value, operator) {
      if (node.getAttribute(attribute) === value) {
        return node;
      }
    }
  };

  Selectors.prototype['[*=]'] = {
    binary: true,
    quote: true,
    group: '$query',
    command: function(operation, continuation, scope, meta, node, attribute, value, operator) {
      var _ref;
      if (((_ref = node.getAttribute(attribute)) != null ? _ref.indexOf(value) : void 0) > -1) {
        return node;
      }
    }
  };

  Selectors.prototype['[|=]'] = {
    binary: true,
    quote: true,
    group: '$query',
    command: function(operation, continuation, scope, meta, node, attribute, value, operator) {
      if (node.getAttribute(attribute) != null) {
        return node;
      }
    }
  };

  Selectors.prototype['[]'] = {
    group: '$query',
    command: function(operation, continuation, scope, meta, node, attribute, value, operator) {
      if (node.getAttribute(attribute) != null) {
        return node;
      }
    }
  };

  Selectors.prototype['$pseudo'] = {
    type: 'qualifier',
    prefix: ':',
    lookup: true
  };

  Selectors.prototype[':value'] = {
    1: function(node) {
      return node.value;
    },
    watch: "oninput"
  };

  Selectors.prototype[':get'] = {
    2: function(node, property) {
      return node[property];
    }
  };

  Selectors.prototype[':first-child'] = {
    group: '$query',
    1: function(node) {
      if (!node.previousElementSibling) {
        return node;
      }
    }
  };

  Selectors.prototype[':last-child'] = {
    group: '$query',
    1: function(node) {
      if (!node.nextElementSibling) {
        return node;
      }
    }
  };

  Selectors.prototype[':next'] = {
    relative: true,
    command: function(operation, continuation, scope, meta, node) {
      var collection, index;
      collection = this.queries.getScopedCollection(operation, continuation, scope);
      index = collection != null ? collection.indexOf(node) : void 0;
      if ((index == null) || index === -1 || index === collection.length - 1) {
        return;
      }
      return collection[index + 1];
    }
  };

  Selectors.prototype[':previous'] = {
    relative: true,
    command: function(operation, continuation, scope, meta, node) {
      var collection, index;
      collection = this.queries.getScopedCollection(operation, continuation, scope);
      index = collection != null ? collection.indexOf(node) : void 0;
      if (index === -1 || !index) {
        return;
      }
      return collection[index - 1];
    }
  };

  Selectors.prototype[':last'] = {
    relative: true,
    singular: true,
    command: function(operation, continuation, scope, meta, node) {
      var collection, index;
      collection = this.queries.getScopedCollection(operation, continuation, scope);
      index = collection != null ? collection.indexOf(node) : void 0;
      if (index == null) {
        return;
      }
      if (index === collection.length - 1) {
        return node;
      }
    }
  };

  Selectors.prototype[':first'] = {
    relative: true,
    singular: true,
    command: function(operation, continuation, scope, meta, node) {
      var collection, index;
      collection = this.queries.getScopedCollection(operation, continuation, scope);
      index = collection != null ? collection.indexOf(node) : void 0;
      if (index == null) {
        return;
      }
      if (index === 0) {
        return node;
      }
    }
  };

  return Selectors;

})();

_ref = Selectors.prototype;
for (property in _ref) {
  command = _ref[property];
  if ((typeof command === 'object' && command.serialized !== false) || command.serialized) {
    command.before = 'onBeforeQuery';
    command.after = 'onQuery';
    command.init = 'onSelector';
    command.serialized = true;
  }
}

if (typeof document !== "undefined" && document !== null) {
  dummy = (this.GSS || this.Engine || Selectors).dummy = document.createElement('_');
  if (!dummy.hasOwnProperty("classList")) {
    Selectors.prototype['$class'][2] = function(node, value) {
      if (node.className.split(/\s+/).indexOf(value) > -1) {
        return node;
      }
    };
  }
  if (!dummy.hasOwnProperty("parentElement")) {
    Selectors.prototype['$!>'][1] = Selectors.prototype['::parent'][1] = function(node) {
      var parent;
      if (parent = node.parentNode) {
        if (parent.nodeType === 1) {
          return parent;
        }
      }
    };
  }
  if (!dummy.hasOwnProperty("nextElementSibling")) {
    Selectors.prototype['$+'][1] = function(node) {
      while (node = node.nextSibling) {
        if (node.nodeType === 1) {
          return node;
        }
      }
    };
    Selectors.prototype['$!+'][1] = function(node) {
      while (node = node.previousSibling) {
        if (node.nodeType === 1) {
          return node;
        }
      }
    };
    Selectors.prototype['$++'][1] = function(node) {
      var next, nodes, prev;
      nodes = void 0;
      prev = next = node;
      while (prev = prev.previousSibling) {
        if (prev.nodeType === 1) {
          (nodes || (nodes = [])).push(prev);
          break;
        }
      }
      while (next = next.nextSibling) {
        if (next.nodeType === 1) {
          (nodes || (nodes = [])).push(next);
          break;
        }
      }
      return nodes;
    };
    Selectors.prototype['$~'][1] = function(node) {
      var nodes;
      nodes = void 0;
      while (node = node.nextSibling) {
        if (node.nodeType === 1) {
          (nodes || (nodes = [])).push(node);
        }
      }
      return nodes;
    };
    Selectors.prototype['$!~'][1] = function(node) {
      var nodes, prev;
      nodes = void 0;
      prev = node.parentNode.firstChild;
      while (prev && (prev !== node)) {
        if (prev.nodeType === 1) {
          (nodes || (nodes = [])).push(prev);
        }
        prev = prev.nextSibling;
      }
      return nodes;
    };
    Selectors.prototype['$~~'][1] = function(node) {
      var nodes, prev;
      nodes = void 0;
      prev = node.parentNode.firstChild;
      while (prev) {
        if (prev !== node && prev.nodeType === 1) {
          (nodes || (nodes = [])).push(prev);
        }
        prev = prev.nextSibling;
      }
      return nodes;
    };
    Selectors.prototype[':first-child'][1] = function(node) {
      var child, parent;
      if (parent = node.parentNode) {
        child = parent.firstChild;
        while (child && child.nodeType !== 1) {
          child = child.nextSibling;
        }
        if (child === node) {
          return node;
        }
      }
    };
    Selectors.prototype[':last-child'][1] = function(node) {
      var child, parent;
      if (parent = node.parentNode) {
        child = parent.lastChild;
        while (child && child.nodeType !== 1) {
          child = child.previousSibling;
        }
        if (child === node) {
          return mpde;
        }
      }
    };
  }
}

module.exports = Selectors;
