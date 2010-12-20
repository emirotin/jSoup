QUnit.specify("jSoup", function(){
  describe("Classes", function(){
    
    it("should define $class", function(){
      assert($class).isDefined();  
    });
    
    it("should allow defining global classes", function(){
      $namespace("", {
        GlobalClass: $class({})
      })
      assert(GlobalClass).isAn(Object);
      $namespace({
        GlobalClass2: $class({})
      })
      assert(GlobalClass2).isAn(Object);
    });
    
    it("should allow defining namespaced classes", function(){
      $namespace("ns", {
        NsClass: $class({})
      })
      assert($ns.NsClass).isAn(Object);
    });
    
    it("should work without namespaces", function(){
      var c = $class({
        method : function($this){return 1;}
      }, true);
      assert(c).isAn(Object);
      var x = new c();
      assert(x).isA(c);
      assert(x.method()).equals(1);
    })
    
  })
})