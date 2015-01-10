var $, $$, Engine, assert, expect, fixtures, remove, stringify;

Engine = GSS;

assert = chai.assert;

expect = chai.expect;

stringify = function(o) {
  return o;
  return JSON.stringify(o, 1, 1);
};

$ = function() {
  return document.querySelector.apply(document, arguments);
};

$$ = function() {
  return document.querySelectorAll.apply(document, arguments);
};

remove = function(el) {
  var _ref;
  return el != null ? (_ref = el.parentNode) != null ? _ref.removeChild(el) : void 0 : void 0;
};

fixtures = document.getElementById('fixtures');

describe('Nested Rules', function() {
  describe('Basic', function() {
    var container, engine;
    container = null;
    engine = null;
    beforeEach(function() {
      container = document.createElement('div');
      container.id = 'container0';
      return $('#fixtures').appendChild(container);
    });
    afterEach(function() {
      return remove(container);
    });
    describe('flat', function() {
      return it('Runs commands from sourceNode', function(done) {
        var old, rules;
        rules = [['==', ["get", "target-size"], 100]];
        container.innerHTML = "";
        if (old = container._gss_id && GSS(container)) {
          old.destroy();
        }
        window.$engine = engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ["get", "", "target-size", ""], 100]]]));
          return done();
        });
        return engine.solve(rules);
      });
    });
    describe('mixed selectors', function() {
      return it('should support mixed selectors', function(done) {
        var rules;
        rules = [['==', ["get", ['$pseudo', ['$tag', ['$combinator', ['$tag', ['$combinator', ['$class', ['$tag', ['$combinator', ['$tag', 'header'], '>'], 'h2'], 'gizoogle'], '!'], 'section'], ' '], 'div'], 'get', 'parentNode'], "target-size"], 100]];
        container.innerHTML = "<section id=\"s\">\n  <div id=\"d\">\n    <header id=\"h\">\n      <h2 class='gizoogle' id=\"h2\">\n      </h2>\n    </header>\n  </div>\n</section>";
        GSS.console.log(container.innerHTML);
        GSS.console.info("(header > h2.gizoogle ! section div:get('parentNode'))[target-size] == 100");
        engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ["get", "$s", "target-size", "header>h2.gizoogle$h2↑!$s↑section div$d↑:getparentNode"], 100]]]));
          return done();
        });
        return engine.solve(rules);
      });
    });
    describe('reversed sibling combinators', function() {
      return it('should support mixed selectors', function(done) {
        var all, parent, rules;
        rules = [['==', ["get", ['$tag', ['$combinator', ['$tag', ['$combinator', ['$tag', 'div'], '+'], 'main'], '!~'], '*'], "width"], 50]];
        container.innerHTML = "<section>\n  <h1 id=\"header0\"></h1>\n  <div id=\"box0\"></div>\n  <main id=\"main0\"></main>\n</section>";
        GSS.console.log(container.innerHTML);
        GSS.console.info("(div + main !~ *)[width] == 50");
        all = container.getElementsByTagName('*');
        parent = all.main0.parentNode;
        engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ["get", "$header0", "width", "div+main$main0↑!~$header0↑*"], 50]], [['==', ["get", "$box0", "width", "div+main$main0↑!~$box0↑*"], 50]]]));
          expect(stringify(engine.updated.solution)).to.eql(stringify({
            "$header0[width]": 50,
            "$box0[width]": 50
          }));
          expect(all.header0.style.width).to.eql('50px');
          expect(all.box0.style.width).to.eql('50px');
          GSS.console.error('Mutation: container.removeChild(#main)');
          parent.removeChild(all.main0);
          return engine.once('solve', function() {
            expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", "div+main$main0↑!~$header0↑*", "div+main$main0↑!~$header0", "div+main$main0↑!~$box0↑*", "div+main$main0↑!~$box0", "div+main$main0"]]));
            expect(stringify(engine.updated.solution)).to.eql(stringify({
              "$header0[width]": null,
              "$box0[width]": null
            }));
            expect(all.header0.style.width).to.eql('');
            expect(all.box0.style.width).to.eql('');
            return done();
          });
        });
        return engine.solve(rules);
      });
    });
    describe('1 level w/ ::', function() {
      return it('Runs commands from sourceNode', function(done) {
        var rules;
        rules = [['rule', ['$class', ['$combinator', ['$class', 'vessel'], ' '], 'box'], ['==', ["get", ["$reserved", "this"], "x"], 100]]];
        GSS.console.info(".vessel .box { ::[x] == 100 }");
        container.innerHTML = "<div id=\"box0\" class=\"box\"></div>\n<div class=\"vessel\">\n  <div id=\"box1\" class=\"box\"></div>\n  <div id=\"box2\" class=\"box\"></div>\n</div>\n<div id=\"box3\" class=\"box\"></div>\n<div id=\"box4\" class=\"box\"></div>";
        engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ['get', '$box1', 'x', '.vessel .box$box1', "$box1"], 100]], [['==', ['get', '$box2', 'x', '.vessel .box$box2', "$box2"], 100]]]));
          return done();
        });
        return engine.solve(rules);
      });
    });
    describe('subqueries', function() {
      return it('should observe selector on ::', function(done) {
        var box1, box2, rules, vessel0;
        rules = ["rule", ["$class", "vessel"], ['==', ["get", ["$class", ['$combinator', ["$reserved", "this"], ' '], "box"], "x"], 100]];
        GSS.console.info(".vessel { (:: .box)[x] == 100 }");
        container.innerHTML = "<div id=\"box0\" class=\"box\"></div>\n<div class=\"vessel\" id=\"vessel0\">\n  <div id=\"box1\" class=\"box\"></div>\n  <div id=\"box2\" class=\"box\"></div>\n</div>\n<div id=\"box3\" class=\"box\"></div>\n<div id=\"box4\" class=\"box\"></div>";
        box1 = container.getElementsByClassName('box')[1];
        box2 = container.getElementsByClassName('box')[2];
        vessel0 = container.getElementsByClassName('vessel')[0];
        engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ['get', '$box1', 'x', '.vessel$vessel0↓::this .box$box1', "$vessel0"], 100]], [['==', ['get', '$box2', 'x', '.vessel$vessel0↓::this .box$box2', "$vessel0"], 100]]]));
          expect(stringify(engine.values)).to.eql(stringify({
            "$box1[x]": 100,
            "$box2[x]": 100
          }));
          expect(box1.style.left).to.eql('100px');
          expect(box2.style.left).to.eql('100px');
          box1.setAttribute('class', '');
          return engine.once('solve', function() {
            expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', '.vessel$vessel0↓::this .box$box1']]));
            expect(stringify(engine.values)).to.eql(stringify({
              "$box2[x]": 100
            }));
            expect(box1.style.left).to.eql('');
            expect(box2.style.left).to.eql('100px');
            box1.setAttribute('class', 'box');
            return engine.once('solve', function() {
              expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ['get', '$box1', 'x', '.vessel$vessel0↓::this .box$box1', "$vessel0"], 100]]]));
              expect(stringify(engine.values)).to.eql(stringify({
                "$box2[x]": 100,
                "$box1[x]": 100
              }));
              expect(box1.style.left).to.eql('100px');
              expect(box2.style.left).to.eql('100px');
              vessel0.setAttribute('class', '');
              return engine.once('solve', function() {
                expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".vessel$vessel0↓::this .box$box1", ".vessel$vessel0↓::this .box$box2", ".vessel$vessel0"]]));
                expect(box1.style.left).to.eql('');
                expect(box2.style.left).to.eql('');
                vessel0.setAttribute('class', 'vessel');
                return engine.once('solve', function() {
                  expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ['get', '$box1', 'x', '.vessel$vessel0↓::this .box$box1', "$vessel0"], 100]], [['==', ['get', '$box2', 'x', '.vessel$vessel0↓::this .box$box2', "$vessel0"], 100]]]));
                  expect(stringify(engine.values)).to.eql(stringify({
                    "$box1[x]": 100,
                    "$box2[x]": 100
                  }));
                  expect(box1.style.left).to.eql('100px');
                  expect(box2.style.left).to.eql('100px');
                  return done();
                });
              });
            });
          });
        });
        return engine.solve(rules);
      });
    });
    describe('1 level w/ multiple selectors and ::this', function() {
      return it('should combine comma separated native selectors', function(done) {
        var box1, box3, rules, vessel0;
        rules = ['rule', [',', ['$class', 'vessel'], ['$id', 'group1']], ['==', ['get', ['$pseudo', ['$combinator', ['$reserved', 'this'], ' '], 'first-child'], 'y'], 100]];
        container.innerHTML = "<div id=\"box0\" class=\"box\"></div>\n<div class=\"vessel\" id=\"vessel0\">\n  <div id=\"box1\" class=\"box\"></div>\n  <div id=\"box2\" class=\"box\"></div>\n</div>\n<div class=\"group\" id=\"group1\">\n  <div id=\"box3\" class=\"box\"></div>\n  <div id=\"box4\" class=\"box\"></div>\n</div>";
        GSS.console.info(".vessel, #group1 { (:: :first-child)[y] == 100 }");
        vessel0 = container.getElementsByClassName('vessel')[0];
        box1 = container.getElementsByClassName('box')[1];
        box3 = container.getElementsByClassName('box')[3];
        window.$engine = engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ['get', '$box1', 'y', '.vessel,#group1$vessel0↓::this :first-child$box1', "$vessel0"], 100]], [['==', ['get', '$box3', 'y', '.vessel,#group1$group1↓::this :first-child$box3', "$group1"], 100]]]));
          vessel0.setAttribute('class', '');
          expect(box1.style.top).to.eql('100px');
          expect(box3.style.top).to.eql('100px');
          return engine.once('solve', function() {
            expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', ".vessel,#group1$vessel0↓::this :first-child$box1", ".vessel,#group1$vessel0"]]));
            expect(box1.style.top).to.eql('');
            expect(box3.style.top).to.eql('100px');
            vessel0.setAttribute('class', 'vessel');
            return engine.once('solve', function() {
              expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ['get', '$box1', 'y', '.vessel,#group1$vessel0↓::this :first-child$box1', '$vessel0'], 100]]]));
              expect(box1.style.top).to.eql('100px');
              expect(box3.style.top).to.eql('100px');
              return done();
            });
          });
        });
        return engine.solve(rules);
      });
    });
    describe('1 level w/ mixed multiple selectors and ::this', function() {
      return it('should implement comma for non-native selectors', function(done) {
        var box0, box1, box2, box3, box4, group1, rules, vessel0;
        rules = ['rule', [',', ['$combinator', ['$id', 'box1'], '!>'], ['$tag', ['$combinator', '>'], 'div']], ['==', ['get', ['$pseudo', ['$combinator', ['$reserved', 'this'], ' '], 'first-child'], 'y'], 100]];
        container.innerHTML = "<div id=\"box0\" class=\"box\"></div>\n<div class=\"vessel\" id=\"vessel0\">\n  <div id=\"box1\" class=\"box\"></div>\n  <div id=\"box2\" class=\"box\"></div>\n</div>\n<div class=\"group\" id=\"group1\">\n  <div id=\"box3\" class=\"box\"></div>\n  <div id=\"box4\" class=\"box\"></div>\n</div>";
        GSS.console.info("#box1 !>, > div { (& :first-child)[y] == 100 }");
        vessel0 = container.getElementsByClassName('vessel')[0];
        box0 = container.getElementsByClassName('box')[0];
        box1 = container.getElementsByClassName('box')[1];
        box2 = container.getElementsByClassName('box')[2];
        box3 = container.getElementsByClassName('box')[3];
        box4 = container.getElementsByClassName('box')[4];
        group1 = container.getElementsByClassName('group')[0];
        window.$engine = engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ['get', '$box1', 'y', '#box1!>,>div$vessel0↓::this :first-child$box1', '$vessel0'], 100]], [['==', ['get', '$box3', 'y', '#box1!>,>div$group1↓::this :first-child$box3', '$group1'], 100]]]));
          expect(box1.style.top).to.eql('100px');
          expect(box3.style.top).to.eql('100px');
          expect(engine.queries['#box1!>,>div'].length).to.eql(3);
          expect(engine.queries['#box1!>,>div'].duplicates.length).to.eql(1);
          GSS.console.error('box1.remove()');
          box1.parentNode.removeChild(box1);
          return engine.once('solve', function() {
            expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', "#box1!>,>div$vessel0↓::this :first-child$box1", "#box1!>", "#box1"], [['==', ['get', '$box2', 'y', '#box1!>,>div$vessel0↓::this :first-child$box2', '$vessel0'], 100]]]));
            expect(box1.style.top).to.eql('');
            expect(box2.style.top).to.eql('100px');
            expect(box3.style.top).to.eql('100px');
            expect(engine.queries['#box1!>,>div'].length).to.eql(3);
            expect(engine.queries['#box1!>,>div'].duplicates.length).to.eql(0);
            expect(engine.queries['#box1']).to.eql(void 0);
            expect(engine.queries['#box1!>']).to.eql(void 0);
            vessel0.insertBefore(box1, vessel0.firstChild);
            GSS.console.error('prepend(box1)');
            return engine.once('solve', function() {
              expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', "#box1!>,>div$vessel0↓::this :first-child$box2"], [['==', ['get', '$box1', 'y', '#box1!>,>div$vessel0↓::this :first-child$box1', "$vessel0"], 100]]]));
              expect(box1.style.top).to.eql('100px');
              expect(box2.style.top).to.eql('');
              expect(box3.style.top).to.eql('100px');
              vessel0.removeChild(box1);
              GSS.console.error('vessel0.remove()');
              return engine.once('solve', function() {
                expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', "#box1!>,>div$vessel0↓::this :first-child$box1", "#box1!>", "#box1"], [['==', ['get', '$box2', 'y', '#box1!>,>div$vessel0↓::this :first-child$box2', "$vessel0"], 100]]]));
                expect(box1.style.top).to.eql('');
                expect(box2.style.top).to.eql('100px');
                expect(box3.style.top).to.eql('100px');
                vessel0.parentNode.removeChild(vessel0);
                return engine.once('solve', function() {
                  expect(engine.queries['>'].length).to.eql(2);
                  expect(engine.queries['#box1!>,>div'].slice()).to.eql([box0, group1]);
                  expect(engine.queries['#box1!>,>div'].slice()).to.eql([box0, group1]);
                  expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', "#box1!>,>div$vessel0↓::this :first-child$box2", "#box1!>,>div$vessel0", ">$vessel0↑div", ">$vessel0"]]));
                  expect(box1.style.top).to.eql('');
                  expect(box2.style.top).to.eql('');
                  expect(box3.style.top).to.eql('100px');
                  expect(box4.style.top).to.eql('');
                  box3.parentNode.removeChild(box3);
                  return engine.once('solve', function() {
                    expect(box1.style.top).to.eql('');
                    expect(box2.style.top).to.eql('');
                    expect(box3.style.top).to.eql('');
                    expect(box4.style.top).to.eql('100px');
                    expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', "#box1!>,>div$group1↓::this :first-child$box3"], [['==', ['get', '$box4', 'y', '#box1!>,>div$group1↓::this :first-child$box4', '$group1'], 100]]]));
                    box4.parentNode.removeChild(box4);
                    return engine.once('solve', function() {
                      expect(box1.style.top).to.eql('');
                      expect(box2.style.top).to.eql('');
                      expect(box3.style.top).to.eql('');
                      expect(box4.style.top).to.eql('');
                      expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', "#box1!>,>div$group1↓::this :first-child$box4"]]));
                      expect(engine.queries['>'].slice()).to.eql([box0, group1]);
                      box0.parentNode.removeChild(box0);
                      return engine.once('solve', function() {
                        expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', "#box1!>,>div$box0", ">$box0↑div", ">$box0"]]));
                        expect(engine.queries['#box1']).to.eql(void 0);
                        expect(engine.queries['#box1!>']).to.eql(void 0);
                        expect(engine.queries['#box1!>,>div'].slice()).to.eql([group1]);
                        expect(engine.queries['>'].slice()).to.eql([group1]);
                        group1.parentNode.removeChild(group1);
                        return engine.once('solve', function() {
                          expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', "#box1!>,>div$group1", ">$group1↑div", ">$group1"]]));
                          window.zzzz = true;
                          GSS.console.log('append vessel0');
                          engine.scope.appendChild(vessel0);
                          return engine.once('solve', function() {
                            return done();
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
        return engine.solve(rules);
      });
    });
    describe('1 level w/ ::scope', function() {
      return it('Runs commands from sourceNode', function(done) {
        var rules;
        rules = [['rule', ['$class', ['$combinator', ['$class', 'vessel'], ' '], 'box'], ["<=", ["get", ["$reserved", "this"], "width"], ["get", ["$reserved", "scope"], "width"]]]];
        container.id = 'container0';
        container.innerHTML = "<div id=\"box0\" class=\"box\"></div>\n<div id=\"vessel1\" class=\"vessel\">\n  <div id=\"box1\" class=\"box\"></div>\n  <div id=\"box2\" class=\"box\"></div>\n</div>\n<div id=\"box3\" class=\"box\"></div>\n<div id=\"box4\" class=\"box\"></div>";
        engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['<=', ['get', '$box1', 'width', '.vessel .box$box1', "$box1"], ['get', '$container0', 'width', '.vessel .box$box1', "$box1"]], ['<=', ['get', '$box2', 'width', '.vessel .box$box2', "$box2"], ['get', '$container0', 'width', '.vessel .box$box2', "$box2"]]]]));
          return done();
        });
        return engine.solve(rules);
      });
    });
    describe('1 level w/ ::scope and selector', function() {
      return it('should resolve selector on ::scope', function(done) {
        var clone, rules;
        rules = ['rule', ['$class', ['$combinator', ['$class', 'group'], ' '], 'vessel'], ["<=", ["get", ['$pseudo', ['$class', ['$combinator', ["$reserved", "scope"], ' '], 'box'], 'last-child'], 'width'], 100]];
        GSS.console.info('.group .vessel { (::scope .box:last-child)[width] == 100 }');
        container.innerHTML = "<div id=\"group1\" class=\"group\">\n  <div id=\"box0\" class=\"box\"></div>\n  <div id=\"vessel1\" class=\"vessel\">\n    <div id=\"box1\" class=\"box\"></div>\n    <div id=\"box2\" class=\"box\"></div>\n  </div>\n  <div id=\"box3\" class=\"box\"></div>\n  <div id=\"box4\" class=\"box\"></div>\n</div>";
        clone = container.cloneNode();
        clone.setAttribute('id', 'container1');
        clone.innerHTML = container.innerHTML.replace(/\d+/g, function(d) {
          return "1" + d;
        });
        engine = new GSS(container);
        engine.once('solve', function() {
          var newLast;
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['<=', ['get', '$box2', 'width', ".group .vessel$vessel1↓ .box:last-child$box2", "$vessel1"], 100]], [['<=', ['get', '$box4', 'width', ".group .vessel$vessel1↓ .box:last-child$box4", "$vessel1"], 100]]]));
          newLast = document.createElement('div');
          newLast.id = 'box5';
          newLast.className = 'box';
          container.firstElementChild.appendChild(newLast);
          return engine.once('solve', function() {
            expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".group .vessel$vessel1↓ .box:last-child$box4"], [['<=', ['get', '$box5', 'width', '.group .vessel$vessel1↓ .box:last-child$box5', "$vessel1"], 100]]]));
            container.firstElementChild.setAttribute('class', '');
            return engine.once('solve', function() {
              expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', '.group .vessel$vessel1↓ .box:last-child$box2', '.group .vessel$vessel1↓ .box:last-child$box5', '.group .vessel$vessel1']]));
              container.firstElementChild.setAttribute('class', 'group');
              return engine.once('solve', function() {
                expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['<=', ['get', '$box2', 'width', '.group .vessel$vessel1↓ .box:last-child$box2', "$vessel1"], 100]], [['<=', ['get', '$box5', 'width', '.group .vessel$vessel1↓ .box:last-child$box5', "$vessel1"], 100]]]));
                container.appendChild(clone);
                return engine.once('solve', function() {
                  expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['<=', ['get', '$box2', 'width', '.group .vessel$vessel1↓ .box:last-child$box2', "$vessel1"], 100], ['<=', ['get', '$box2', 'width', '.group .vessel$vessel11↓ .box:last-child$box2', "$vessel11"], 100]], [['<=', ['get', '$box5', 'width', '.group .vessel$vessel1↓ .box:last-child$box5', "$vessel1"], 100], ['<=', ['get', '$box5', 'width', '.group .vessel$vessel11↓ .box:last-child$box5', "$vessel11"], 100]], [['<=', ['get', '$box12', 'width', '.group .vessel$vessel11↓ .box:last-child$box12', "$vessel11"], 100], ['<=', ['get', '$box12', 'width', '.group .vessel$vessel1↓ .box:last-child$box12', "$vessel1"], 100]], [['<=', ['get', '$box14', 'width', '.group .vessel$vessel11↓ .box:last-child$box14', "$vessel11"], 100], ['<=', ['get', '$box14', 'width', '.group .vessel$vessel1↓ .box:last-child$box14', "$vessel1"], 100]]]));
                  container.replaceChild(container.firstElementChild, container.lastElementChild);
                  return engine.once('solve', function() {
                    var box2;
                    expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".group .vessel$vessel11↓ .box:last-child$box2", ".group .vessel$vessel11↓ .box:last-child$box5", ".group .vessel$vessel11↓ .box:last-child$box12", ".group .vessel$vessel11↓ .box:last-child$box14", ".group .vessel$vessel11", ".group .vessel$vessel1↓ .box:last-child$box12", ".group .vessel$vessel1↓ .box:last-child$box14"], [["remove", ".group .vessel$vessel11↓ .box:last-child$box12", ".group .vessel$vessel1↓ .box:last-child$box12"]], [["remove", ".group .vessel$vessel11↓ .box:last-child$box14", ".group .vessel$vessel1↓ .box:last-child$box14"]], [["remove", ".group .vessel$vessel11↓ .box:last-child$box2"]], [["remove", ".group .vessel$vessel11↓ .box:last-child$box5"]]]));
                    box2 = container.getElementsByClassName('box')[2];
                    box2.parentNode.removeChild(box2);
                    return engine.once('solve', function() {
                      var vessel;
                      expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', '.group .vessel$vessel1↓ .box:last-child$box2'], [['remove', '.group .vessel$vessel1↓ .box:last-child$box2']], [['<=', ['get', '$box1', 'width', '.group .vessel$vessel1↓ .box:last-child$box1', "$vessel1"], 100]]]));
                      vessel = container.getElementsByClassName('vessel')[0];
                      vessel.parentNode.removeChild(vessel);
                      return engine.once('solve', function() {
                        expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', '.group .vessel$vessel1↓ .box:last-child$box1', ".group .vessel$vessel1↓ .box:last-child$box5", ".group .vessel$vessel1"], [['remove', ".group .vessel$vessel1↓ .box:last-child$box5"]]]));
                        container.innerHTML = "";
                        return done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
        return engine.solve(rules);
      });
    });
    describe('1 level w/ ::parent', function() {
      it('should resolve selector on ::parent', function(done) {
        var clone, rules;
        rules = [['rule', ['$class', ['$combinator', ['$class', 'group'], ' '], 'vessel'], ["<=", ["get", ['$pseudo', ['$class', ['$combinator', ["$reserved", "parent"], ' '], 'box'], 'last-child'], 'width'], 100]]];
        container.innerHTML = "<div id=\"group1\" class=\"group\">\n  <div id=\"box0\" class=\"box\"></div>\n  <div id=\"vessel1\" class=\"vessel\">\n    <div id=\"box1\" class=\"box\"></div>\n    <div id=\"box2\" class=\"box\"></div>\n  </div>\n  <div id=\"box3\" class=\"box\"></div>\n  <div id=\"box4\" class=\"box\"></div>\n</div>";
        clone = container.cloneNode();
        clone.setAttribute('id', 'container1');
        clone.innerHTML = container.innerHTML.replace(/\d+/g, function(d) {
          return "1" + d;
        });
        window.$engine = engine = new GSS(container);
        engine.once('solve', function() {
          var newLast;
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['<=', ['get', '$box2', 'width', ".group .vessel$vessel1↓::parent .box:last-child$box2", "$vessel1"], 100]], [['<=', ['get', '$box4', 'width', ".group .vessel$vessel1↓::parent .box:last-child$box4", "$vessel1"], 100]]]));
          newLast = document.createElement('div');
          newLast.id = 'box5';
          newLast.className = 'box';
          container.firstElementChild.appendChild(newLast);
          return engine.once('solve', function() {
            expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".group .vessel$vessel1↓::parent .box:last-child$box4"], [['<=', ['get', '$box5', 'width', '.group .vessel$vessel1↓::parent .box:last-child$box5', "$vessel1"], 100]]]));
            container.firstElementChild.setAttribute('class', '');
            return engine.once('solve', function() {
              expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', '.group .vessel$vessel1↓::parent .box:last-child$box2', '.group .vessel$vessel1↓::parent .box:last-child$box5', '.group .vessel$vessel1↓::parent', ".group .vessel$vessel1"]]));
              container.firstElementChild.setAttribute('class', 'group');
              return engine.once('solve', function() {
                expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['<=', ['get', '$box2', 'width', ".group .vessel$vessel1↓::parent .box:last-child$box2", "$vessel1"], 100]], [['<=', ['get', '$box5', 'width', ".group .vessel$vessel1↓::parent .box:last-child$box5", "$vessel1"], 100]]]));
                container.appendChild(clone);
                return engine.once('solve', function() {
                  expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['<=', ['get', '$box12', 'width', ".group .vessel$vessel11↓::parent .box:last-child$box12", "$vessel11"], 100]], [['<=', ['get', '$box14', 'width', ".group .vessel$vessel11↓::parent .box:last-child$box14", "$vessel11"], 100]]]));
                  container.replaceChild(container.firstElementChild, container.lastElementChild);
                  return engine.once('solve', function() {
                    var box2;
                    expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', '.group .vessel$vessel11↓::parent .box:last-child$box12', '.group .vessel$vessel11↓::parent .box:last-child$box14', '.group .vessel$vessel11↓::parent', ".group .vessel$vessel11"]]));
                    box2 = container.getElementsByClassName('box')[2];
                    box2.parentNode.removeChild(box2);
                    return engine.once('solve', function() {
                      var vessel;
                      expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".group .vessel$vessel1↓::parent .box:last-child$box2"], [['<=', ['get', '$box1', 'width', '.group .vessel$vessel1↓::parent .box:last-child$box1', "$vessel1"], 100]]]));
                      vessel = container.getElementsByClassName('vessel')[0];
                      vessel.parentNode.removeChild(vessel);
                      return engine.once('solve', function() {
                        expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', '.group .vessel$vessel1↓::parent .box:last-child$box1', ".group .vessel$vessel1↓::parent .box:last-child$box5", ".group .vessel$vessel1↓::parent", ".group .vessel$vessel1"]]));
                        container.innerHTML = "";
                        return done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
        return engine.solve(rules);
      });
      it('should handle mix of global and local selector', function(done) {
        var rules;
        rules = [['rule', ['$class', ['$combinator', ['$class', 'vessel'], ' '], 'box'], ["<=", ["get", ["$reserved", "this"], "width"], ["get", ["$id", "vessel1"], "width"]]]];
        GSS.console.info('.vessel .box { ::[width] == #vessel1[width] } ');
        container.innerHTML = "<div id=\"box0\" class=\"box\"></div>\n<div id=\"vessel1\" class=\"vessel\">\n  <div id=\"box1\" class=\"box\"></div>\n  <div id=\"box2\" class=\"box\"></div>\n</div>\n<div id=\"box3\" class=\"box\"></div>\n<div id=\"box4\" class=\"box\"></div>";
        engine = new GSS(container);
        engine.once('solve', function() {
          var vessel1;
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[["<=", ["get", "$box1", "width", ".vessel .box$box1↓#vessel1", "$box1"], ["get", "$vessel1", "width", ".vessel .box$box1↓#vessel1", "$box1"]], ["<=", ["get", "$box2", "width", ".vessel .box$box2↓#vessel1", "$box2"], ["get", "$vessel1", "width", ".vessel .box$box2↓#vessel1", "$box2"]]]]));
          vessel1 = engine.$id('vessel1');
          vessel1.parentNode.removeChild(vessel1);
          return engine.once('solve', function() {
            expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".vessel .box$box1↓#vessel1", ".vessel .box$box1", ".vessel .box$box2↓#vessel1", ".vessel .box$box2"], [["remove", ".vessel .box$box1↓#vessel1", ".vessel .box$box2↓#vessel1"]]]));
            container.appendChild(vessel1);
            return engine.once('solve', function() {
              expect(stringify(engine.updated.getProblems())).to.eql(stringify([[["<=", ["get", "$box1", "width", ".vessel .box$box1↓#vessel1", "$box1"], ["get", "$vessel1", "width", ".vessel .box$box1↓#vessel1", "$box1"]], ["<=", ["get", "$box2", "width", ".vessel .box$box2↓#vessel1", "$box2"], ["get", "$vessel1", "width", ".vessel .box$box2↓#vessel1", "$box2"]]]]));
              vessel1.parentNode.removeChild(vessel1);
              return engine.once('solve', function() {
                expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".vessel .box$box1↓#vessel1", ".vessel .box$box1", ".vessel .box$box2↓#vessel1", ".vessel .box$box2"], [["remove", ".vessel .box$box1↓#vessel1", ".vessel .box$box2↓#vessel1"]]]));
                return done();
              });
            });
          });
        });
        return engine.solve(rules);
      });
      return it('Runs commands from sourceNode', function(done) {
        var rules;
        rules = [['rule', ['$class', ['$combinator', ['$class', 'vessel'], ' '], 'box'], ["<=", ["get", ["$reserved", "this"], "width"], ["get", ["$reserved", "parent"], "width"]]]];
        GSS.console.info('.vessel .box { ::[width] == ::parent[width] } ');
        container.innerHTML = "<div id=\"box0\" class=\"box\"></div>\n<div id=\"vessel1\" class=\"vessel\">\n  <div id=\"box1\" class=\"box\"></div>\n  <div id=\"box2\" class=\"box\"></div>\n</div>\n<div id=\"box3\" class=\"box\"></div>\n<div id=\"box4\" class=\"box\"></div>";
        engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[["<=", ["get", "$box1", "width", ".vessel .box$box1↓::parent", "$box1"], ["get", "$vessel1", "width", ".vessel .box$box1↓::parent", "$box1"]], ["<=", ["get", "$box2", "width", ".vessel .box$box2↓::parent", "$box2"], ["get", "$vessel1", "width", ".vessel .box$box2↓::parent", "$box2"]]]]));
          return done();
        });
        return engine.solve(rules);
      });
    });
    describe('2 level', function() {
      return it('Runs commands from sourceNode', function(done) {
        var box1, rules, vessel0;
        rules = ['rule', ['$class', 'vessel'], ['rule', ['$class', 'box'], ['==', ["get", ["$reserved", "this"], "x"], 100]]];
        container.innerHTML = "<div id=\"box0\" class=\"box\"></div>\n<div class=\"vessel\" id=\"vessel0\">\n  <div id=\"box1\" class=\"box\"></div>\n  <div id=\"box2\" class=\"box\"></div>\n</div>\n<div id=\"box3\" class=\"box\"></div>\n<div id=\"box4\" class=\"box\"></div>";
        engine = new GSS(container);
        box1 = container.getElementsByClassName('box')[1];
        vessel0 = container.getElementsByClassName('vessel')[0];
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ['get', '$box1', 'x', ".vessel$vessel0↓.box$box1", "$box1"], 100]], [['==', ['get', '$box2', 'x', ".vessel$vessel0↓.box$box2", "$box2"], 100]]]));
          box1.setAttribute('class', '');
          return engine.once('solve', function() {
            expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', ".vessel$vessel0↓.box$box1"]]));
            box1.setAttribute('class', 'box');
            return engine.once('solve', function() {
              expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ['get', '$box1', 'x', ".vessel$vessel0↓.box$box1", "$box1"], 100]]]));
              vessel0.setAttribute('class', '');
              return engine.once('solve', function() {
                expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', ".vessel$vessel0↓.box$box1", ".vessel$vessel0↓.box$box2", ".vessel$vessel0"]]));
                vessel0.setAttribute('class', 'vessel');
                return engine.once('solve', function() {
                  expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ["get", "$box1", "x", ".vessel$vessel0↓.box$box1", "$box1"], 100]], [['==', ["get", "$box2", "x", ".vessel$vessel0↓.box$box2", "$box2"], 100]]]));
                  box1.parentNode.removeChild(box1);
                  return engine.once('solve', function() {
                    expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', ".vessel$vessel0↓.box$box1"]]));
                    vessel0.insertBefore(box1, vessel0.firstChild);
                    return engine.once('solve', function() {
                      expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ["get", "$box1", "x", ".vessel$vessel0↓.box$box1", "$box1"], 100]]]));
                      engine.scope.innerHTML = "";
                      return engine.once('solve', function() {
                        expect(stringify(engine.updated.getProblems())).to.eql(stringify([['remove', ".vessel$vessel0↓.box$box1", ".vessel$vessel0↓.box$box2", ".vessel$vessel0"]]));
                        engine.scope.innerHTML = "";
                        return done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
        return engine.solve(rules);
      });
    });
    return describe('2 level /w multiple selectors in parent', function(e) {
      return it('Runs commands from sourceNode', function(done) {
        var box2, rules, vessel0;
        rules = ['rule', [',', ['$class', 'vessel'], ['$id', 'group1']], ['rule', ['$pseudo', ['$class', 'box'], 'last-child'], ['==', ["get", ["$reserved", "this"], "x"], 100]]];
        container.innerHTML = "<div id=\"box0\" class=\"box\"></div>\n<div class=\"vessel\" id=\"vessel0\">\n  <div id=\"box1\" class=\"box\"></div>\n  <div id=\"box2\" class=\"box\"></div>\n</div>\n<div class=\"group\" id=\"group1\">\n  <div id=\"box3\" class=\"box\"></div>\n  <div id=\"box4\" class=\"box\"></div>\n</div>";
        box2 = container.getElementsByClassName('box')[2];
        vessel0 = container.getElementsByClassName('vessel')[0];
        engine = new GSS(container);
        engine.once('solve', function() {
          expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ["get", "$box2", "x", ".vessel,#group1$vessel0↓.box:last-child$box2", "$box2"], 100]], [['==', ["get", "$box4", "x", ".vessel,#group1$group1↓.box:last-child$box4", "$box4"], 100]]]));
          box2.setAttribute('class', '');
          return engine.once('solve', function() {
            expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".vessel,#group1$vessel0↓.box:last-child$box2"]]));
            box2.setAttribute('class', 'box');
            return engine.once('solve', function() {
              expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ["get", "$box2", "x", ".vessel,#group1$vessel0↓.box:last-child$box2", "$box2"], 100]]]));
              vessel0.setAttribute('class', '');
              return engine.once('solve', function() {
                expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".vessel,#group1$vessel0↓.box:last-child$box2", ".vessel,#group1$vessel0"]]));
                vessel0.setAttribute('class', 'vessel');
                return engine.once('solve', function() {
                  expect(stringify(engine.updated.getProblems())).to.eql(stringify([[['==', ["get", "$box2", "x", ".vessel,#group1$vessel0↓.box:last-child$box2", "$box2"], 100]]]));
                  vessel0.removeChild(box2);
                  return engine.once('solve', function() {
                    expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".vessel,#group1$vessel0↓.box:last-child$box2"], [['==', ["get", "$box1", "x", ".vessel,#group1$vessel0↓.box:last-child$box1", "$box1"], 100]]]));
                    vessel0.appendChild(box2);
                    return engine.once('solve', function() {
                      expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".vessel,#group1$vessel0↓.box:last-child$box1"], [['==', ["get", "$box2", "x", ".vessel,#group1$vessel0↓.box:last-child$box2", "$box2"], 100]]]));
                      engine.scope.innerHTML = "";
                      return engine.once('solve', function() {
                        expect(stringify(engine.updated.getProblems())).to.eql(stringify([["remove", ".vessel,#group1$vessel0↓.box:last-child$box2", ".vessel,#group1$vessel0", ".vessel,#group1$group1↓.box:last-child$box4", ".vessel,#group1$group1"]]));
                        return done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
        return engine.solve(rules);
      });
    });
  });
  return describe('@if @else', function() {
    var container, engine;
    container = null;
    engine = null;
    beforeEach(function() {
      container = document.createElement('div');
      return $('#fixtures').appendChild(container);
    });
    afterEach(function() {
      return remove(container);
    });
    return describe('basic', function() {
      return it('step 1', function(done) {
        var counter, listener, rules;
        rules = [['==', ['get', 'big'], 500], ['==', ['get', 'med'], 50], ['==', ['get', 'small'], 5], ['==', ['get', 'target-width'], 900], ['rule', ['$class', ['$combinator', ['$class', 'vessel'], ' '], 'box'], ['if', ['>=', ['get', 'target-width'], 960], ['==', ["get", ["$reserved", "this"], "width"], ["get", "big"]], [['if', ['>=', ['get', 'target-width'], 500], ['==', ["get", ["$reserved", "this"], 'width'], ["get", "med"]], ['==', ["get", ["$reserved", "this"], 'width'], ["get", "small"]]]]]]];
        counter = 0;
        listener = function(e) {
          var k;
          counter++;
          if (counter === 1) {
            return expect(stringify(engine.values)).to.eql(stringify({
              "big": 500,
              "med": 50,
              "small": 5,
              "target-width": 900
            }));
          } else if (counter === 2) {
            expect(stringify(engine.values)).to.eql(stringify({
              "big": 500,
              "med": 50,
              "small": 5,
              "target-width": 900,
              "$box1[width]": 50,
              "$box2[width]": 50
            }));
            return engine.solved.merge({
              'target-width': 1000
            });
          } else if (counter === 3) {
            window.xxx = true;
            expect(stringify(engine.values)).to.eql(stringify({
              "big": 500,
              "med": 50,
              "small": 5,
              "target-width": 1000,
              "$box1[width]": 500,
              "$box2[width]": 500
            }));
            return engine.solved.merge({
              'target-width': 900
            });
          } else if (counter === 4) {
            expect(stringify(engine.values)).to.eql(stringify({
              "big": 500,
              "med": 50,
              "small": 5,
              "target-width": 900,
              "$box1[width]": 50,
              "$box2[width]": 50
            }));
            return engine.solved.merge({
              'target-width': 300
            });
          } else if (counter === 5) {
            expect(stringify(engine.values)).to.eql(stringify({
              "big": 500,
              "med": 50,
              "small": 5,
              "target-width": 300,
              "$box1[width]": 5,
              "$box2[width]": 5
            }));
            window.xxx = true;
            return engine.$id('box1').setAttribute('class', '');
          } else if (counter === 6) {
            expect(stringify(engine.values)).to.eql(stringify({
              "big": 500,
              "med": 50,
              "small": 5,
              "target-width": 300,
              "$box2[width]": 5
            }));
            return engine.$id('box2').setAttribute('class', '');
          } else if (counter === 7) {
            expect(stringify(engine.values)).to.eql(stringify({
              "big": 500,
              "med": 50,
              "small": 5,
              "target-width": 300
            }));
            engine.solved.merge({
              'target-width': 1000
            });
            return engine.$id('box2').setAttribute('class', 'box');
          } else if (counter === 8) {
            expect(stringify(engine.values)).to.eql(stringify({
              "big": 500,
              "med": 50,
              "small": 5,
              "target-width": 1000,
              "$box2[width]": 500
            }));
            return container.innerHTML = '';
          } else if (counter === 9) {
            expect(stringify(engine.values)).to.eql(stringify({
              "big": 500,
              "med": 50,
              "small": 5,
              "target-width": 1000
            }));
            expect(Object.keys(engine.values).length).to.eql(4);
            expect(Object.keys(engine.solved.watchers).length).to.eql(0);
            expect(Object.keys(engine.solved.observers).length).to.eql(0);
            expect((k = Object.keys(engine.queries.watchers)).length).to.eql(1);
            expect(Object.keys(engine.queries.watchers[k[0]]).length).to.eql(9);
            container.removeEventListener('solve', listener);
            return done();
          }
        };
        container.addEventListener('solve', listener);
        window.$engine = engine = new GSS(container);
        engine.solve(rules);
        return container.innerHTML = "<div id=\"container\" >\n  <div class=\"vessel\">\n    <div id=\"box1\" class=\"box\"></div>\n    <div id=\"box2\" class=\"box\"></div>\n  </div>\n</div>\n<div id=\"box3\" class=\"box\"></div>\n<div id=\"box4\" class=\"box\"></div>";
      });
    });
  });
});
