jSoup
===

The aim of the project is providing more strict, interface-checking OOP with namespaces, multiple inheritance and private variables and methods.

The project is inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) and [$class](http://dean.edwards.name/weblog/2006/05/prototype-and-base/#comment4559).

Supported Features
===

* **Namespaces**. Classes can be defined in a namespace `name` and latter accessed through the `$name.ClassName` notation.
  
  This also supports defining namespace-level variables and functions.
  
  An empty global namespace (`window` level) is supported as well.

* **Classes**. Classes have a simple map notation with emulation of keywords (which are pre-defined map keys):
  * Constructor is defined as a simple function assigned to the `$constructor` key.
  * Private variables are defined as a `$private_vars` map.
  * Similar to the Python classes, jSoup classes methods have to explicitly define `this` parameter (any name will work, but `$this` is strictly recommended).
  * Private methods are defined with the `$private` _decorator_, have access to the private variables through the `$this.\_` map, and are not accessible outsidfe of the class.
  * Priviledged methods are defined with the `$priv` _decorator_, have access to the private variables through the `$this.\_` map, and are accessible outsidfe of the class.
  * Public methods are defined as a normal functions, are accessible outside of the class and do not have access to the private variables.
  * Inheritance (including _multiple_) is suported through the `$extends` key, having either string or array value. 
  * Automatic (implicit) constructors call in the 

* **$super** 'alias' is available inside the inherited class methods and calls the parent-class method (of the 1st parent class having this method defined - so, the order matters).

* each class has `$ancestors` and `$descendants` lists.

* each class has the `$name` attribute.

Sample Usage
===

Simple Counter
---
The counter with private variable count can be written like this:

    $namespace("counter", {
      Counter : $class({
        $private_vars: {
          count: 0
        },
        inc: $priv(function($this) {
          $this._.count++;
        }),
        dec: $priv(function($this) {
          $this._.count--;
        }),
        state: $priv(function($this) {
          return $this._.count;
        })
      })
    })

The `$priv` _decorator_ makes a function **priveledged** - thus, having access to private variables through the `$this._` map.