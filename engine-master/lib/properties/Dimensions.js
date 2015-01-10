var Dimensions;

Dimensions = (function() {
  function Dimensions() {}

  Dimensions.prototype['::window'] = {
    width: function() {
      return window.innerWidth;
    },
    height: function() {
      return window.innerHeight;
    },
    scroll: {
      left: function() {
        return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
      },
      top: function() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      }
    },
    x: 0,
    y: 0
  };

  Dimensions.prototype['::document'] = {
    scroll: {
      left: '::window[scroll-left]',
      top: '::window[scroll-top]'
    },
    x: '::window[x]',
    y: '::window[y]'
  };

  Dimensions.prototype.intrinsic = {
    height: function(element) {
      return element.offsetHeight;
    },
    width: function(element) {
      return element.offsetWidth;
    },
    y: function(element) {
      var y;
      y = 0;
      while (element) {
        y += element.offsetTop;
        element = element.offsetParent;
        if (element === this.scope || !element) {
          break;
        }
        if (element === this.scope.offsetParent) {
          y -= this.scope.offsetTop;
        }
      }
      return y;
    },
    x: function(element) {
      var x;
      x = 0;
      while (element) {
        x += element.offsetLeft;
        element = element.offsetParent;
        if (element === this.scope || !element) {
          break;
        }
        if (element === this.scope.offsetParent) {
          x -= this.scope.offsetLeft;
        }
      }
      return x;
    }
  };

  Dimensions.prototype.scroll = {
    left: function(element) {
      return element.scrollLeft;
    },
    top: function(element) {
      return element.scrollTop;
    },
    height: function(element) {
      return element.scrollHeight;
    },
    width: function(element) {
      return element.scrollWidth;
    }
  };

  Dimensions.prototype.client = {
    left: function(element) {
      return element.clientLeft;
    },
    top: function(element) {
      return element.clientTop;
    },
    height: function(element) {
      return element.clientHeight;
    },
    width: function(element) {
      return element.clientWidth;
    }
  };

  Dimensions.prototype.offset = {
    left: function(element) {
      return element.offsetLeft;
    },
    top: function(element) {
      return element.offsetTop;
    },
    height: function(element) {
      return element.offsetHeight;
    },
    width: function(element) {
      return element.offsetWidth;
    }
  };

  return Dimensions;

})();

module.exports = Dimensions;
