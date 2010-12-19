QUnit.specify("jSoup", function(){
  describe("Namespaces", function(){
    before(function(){
      // cleanup namespaces
      for (var key in $_soup._ns){
        if (key.match(/^_/))
          continue;
        delete window['$' + key];
        delete $_soup._ns[key];
      }
      for (var key in $_default) {
        delete window[key];
        delete $_default[key];        
      }
    })
    
    it("should define $namespace", function(){
      assert($namespace).isA(Function);
    });

    it("should define $_default namespace", function(){
      assert($_default).isDefined();
      assert($_default).isAn(Object);
    });

    it("should define named namespaces", function(){
      assert(window['$soup']).isUndefined();
      $namespace("soup", {});
      assert($soup).isDefined();
      assert($soup).isAn(Object);
      assert(window.$soup).isDefined();
    });
    
    it("should work with namespace members", function(){
      $namespace("soup", {x: 1});
      assert($soup).isDefined();
      assert($soup.x).equals(1);
      $namespace("soup", {y: 2});
      assert($soup.x).equals(1, "should add new members to the existing namespace");
      assert($soup.y).equals(2);
    });

    it("should support default namespace", function(){
      var a7 = [7];
      $namespace("", {x: a7});
      assert($_default).isDefined();
      assert(x).isDefined();
      assert(x).equals(a7);
      assert(x).isSameAs([7]);
      assert($_default.x).isSameAs(x);
      assert(window.x).isSameAs(x);
      
      $namespace({y: 6});
      assert(window.y).isDefined("fails now without name param");
      assert(y).equals(6);
    });
    
    describe("Pavlov", function(){
      it("should create global entries", function(){
        assert($_default).isDefined();
        $namespace("", {x: [1]});
        assert(x).isDefined();
        assert(x).isSameAs([1]);
        assert(x).equals($_default.x);
        $namespace("soup", {x: 2});
        assert($soup).isDefined();
        assert($soup.x).equals(2);        
      });

      it("should cleanup every global entry except of $_default", function(){
        assert($_default).isDefined();
        assert(window.x).isUndefined();
        assert($_default.x).isUndefined();
        assert(window.$soup).isUndefined();
      })
    });

  });

})