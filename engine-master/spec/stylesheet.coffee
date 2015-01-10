
expect = chai.expect
assert = chai.assert


describe 'Stylesheet', ->
  engine = container = null
  beforeEach ->
    container = document.createElement('div')
    document.body.appendChild(container)
    window.$engine = engine = new GSS(container)
  afterEach ->
    container.parentNode.removeChild(container)
    engine.destroy()
    container = engine = null

  describe 'with static rules', ->
    describe 'in top scope', ->
      describe 'with simple selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss">
              .box {
                width: 1px;
              }
            </style>
            <div class="box" id="box1"></div>
            <div class="box" id="box2"></div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss.sheet.cssRules
                rule.cssText
            ).to.eql [".box { width: 1px; }"]
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .box'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            done()

      describe 'with custom selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss">
              #box2 !+ .box {
                width: 1px;
              }
            </style>
            <div class="box" id="box1"></div>
            <div class="box" id="box2"></div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss.sheet.cssRules
                rule.cssText
            ).to.eql ['[matches~="#box2!+.box"] { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' #box2!+.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            done()


      xdescribe 'with self-referential selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              .box {
                width: 1px;
              }
            </style>
            <div class="box" id="box1"></div>
            <div class="box" id="box2"></div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql [".box { width: 1px; }"]
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' #box2!+.box'
            done()


      describe 'with multiple selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              .box, .zox {
                width: 1px;
              }
            </style>
            <div class="box" id="box1"></div>
            <div class="box" id="box2"></div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql [".box, .zox { width: 1px; }"]
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .box,.zox'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .box,.zox'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            done()

      describe 'with mixed selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              .box, &.zox, !+ .box{
                width: 1px;
              }
            </style>
            <div class="box" id="box1"></div>
            <div class="box" id="box2"></div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql ['.box, .zox, [matches~=".box,::this.zox,!+.box"] { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .box,::this.zox,!+.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            done()



    describe 'in a simple rule', ->
      describe 'with simple selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss">
              .outer {
                .box {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss.sheet.cssRules
                rule.cssText
            ).to.eql [".outer .box { width: 1px; }"]
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer' + GSS.Continuation.DESCEND + '.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .outer' + GSS.Continuation.DESCEND + '.box'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            done()

      describe 'with custom selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss">
              .outer {
                #box2 !+ .box {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss.sheet.cssRules
                rule.cssText
            ).to.eql ['[matches~=".outer' + GSS.Continuation.DESCEND + '#box2!+.box"] { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer' + GSS.Continuation.DESCEND + '#box2!+.box'
            expect(engine.$id('box1').offsetWidth).to.eql 
            
            done()


      describe 'with self-referential selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              #box1 {
                &.box {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql ["#box1.box { width: 1px; }"]
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' #box1 #box1.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql null
            expect(engine.$id('box2').offsetWidth).to.not.eql 1
            
            done()



      describe 'with multiple selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              .outer {
                .box, .zox {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql [".outer .box, .outer .zox { width: 1px; }"]
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer' + GSS.Continuation.DESCEND + '.box,.zox'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .outer' + GSS.Continuation.DESCEND + '.box,.zox'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            
            done()

      describe 'with mixed selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              .outer {
                .box, &.zox, !+ .box{
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql ['.outer .box, .outer.zox, [matches~=".outer' + GSS.Continuation.DESCEND + '.box,::this.zox,!+.box"] { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer' + GSS.Continuation.DESCEND + '.box,::this.zox,!+.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .outer' + GSS.Continuation.DESCEND + '.box,::this.zox,!+.box'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            done()



    describe 'in a comma separated rule', ->
      describe 'with simple selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss">
              .outer, .zouter {
                .box {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss.sheet.cssRules
                rule.cssText
            ).to.eql [".outer .box, .zouter .box { width: 1px; }"]
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer,.zouter' + GSS.Continuation.DESCEND + '.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .outer,.zouter' + GSS.Continuation.DESCEND + '.box'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            done()

      describe 'with custom selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss">
              .outer, .zouter {
                #box2 !+ .box {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss.sheet.cssRules
                rule.cssText
            ).to.eql ['[matches~=".outer,.zouter' + GSS.Continuation.DESCEND + '#box2!+.box"] { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer,.zouter' + GSS.Continuation.DESCEND + '#box2!+.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql null
            expect(engine.$id('box2').offsetWidth).to.not.eql 1
            done()


      describe 'with self-referential selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              #box1, .outer {
                &.box {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql ["#box1.box, .outer.box { width: 1px; }"]
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' #box1,.outer #box1,.outer.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql null
            expect(engine.$id('box2').offsetWidth).to.not.eql 1
            done()



      describe 'with multiple selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              .outer, .zouter {
                .box, .zox {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql [".outer .box, .zouter .box, .outer .zox, .zouter .zox { width: 1px; }"]
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer,.zouter'+ GSS.Continuation.DESCEND + '.box,.zox'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .outer,.zouter'+ GSS.Continuation.DESCEND + '.box,.zox'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            done()

      describe 'with mixed selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              .outer, .zouter {
                .box, &.zox, !+ .box{
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql ['.outer .box, .zouter .box, .outer.zox, .zouter.zox, [matches~=".outer,.zouter' + GSS.Continuation.DESCEND + '.box,::this.zox,!+.box"] { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer,.zouter' + GSS.Continuation.DESCEND + '.box,::this.zox,!+.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .outer,.zouter' + GSS.Continuation.DESCEND + '.box,::this.zox,!+.box'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            done()

    describe 'in a rule with mixed selectors', ->
      describe 'with simple selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss">
              .outer, div !+ div {
                .box {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss.sheet.cssRules
                rule.cssText
            ).to.eql ['.outer .box, [matches~=".outer,div!+div"] .box { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer,div!+div .outer,div!+div' + GSS.Continuation.DESCEND + '.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .outer,div!+div' + GSS.Continuation.DESCEND + '.box'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            
            done()

      describe 'with custom selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss">
              .outer, div !+ div {
                #box2 !+ .box {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss.sheet.cssRules
                rule.cssText
            ).to.eql ['[matches~=".outer,div!+div' + GSS.Continuation.DESCEND + '#box2!+.box"] { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer,div!+div .outer,div!+div' + GSS.Continuation.DESCEND + '#box2!+.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql null
            expect(engine.$id('box2').offsetWidth).to.not.eql 1
            done()


      describe 'with self-referential selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              #box2, div !+ div {
                &.box {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql ['#box2.box, [matches~="#box2,div!+div"].box { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' #box2,div!+div #box2,div!+div.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' #box2,div!+div #box2,div!+div.box'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            done()



      describe 'with multiple selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              .outer, div !+ div {
                .box, .zox {
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql ['.outer .box, [matches~=".outer,div!+div"] .box, .outer .zox, [matches~=".outer,div!+div"] .zox { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer,div!+div .outer,div!+div' + GSS.Continuation.DESCEND + '.box,.zox'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .outer,div!+div' + GSS.Continuation.DESCEND + '.box,.zox'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            
            done()

      describe 'with mixed selectors', ->
        it 'should include generaeted rules', (done) ->
          container.innerHTML = """
            <style type="text/gss" id="gss2">
              .outer, div !+ div {
                .box, &.zox, !+ .box{
                  width: 1px;
                }
              }
            </style>
            <div class="outer">
              <div class="box" id="box1"></div>
              <div class="box" id="box2"></div>
            </div>
          """
          engine.then ->
            expect(
              for rule in engine.stylesheets.sheets.$gss2.sheet.cssRules
                rule.cssText
            ).to.eql ['.outer .box, [matches~=".outer,div!+div"] .box, .outer.zox, [matches~=".outer,div!+div"].zox, [matches~=".outer,div!+div' + GSS.Continuation.DESCEND + '.box,::this.zox,!+.box"] { width: 1px; }']
            expect(engine.$id('box1').getAttribute('matches')).to.eql ' .outer,div!+div .outer,div!+div' + GSS.Continuation.DESCEND + '.box,::this.zox,!+.box'
            expect(engine.$id('box1').offsetWidth).to.eql 1
            expect(engine.$id('box2').getAttribute('matches')).to.eql ' .outer,div!+div' + GSS.Continuation.DESCEND + '.box,::this.zox,!+.box'
            expect(engine.$id('box2').offsetWidth).to.eql 1
            
            done()

