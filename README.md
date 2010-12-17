jSoup
===

The aim of the project is providing more strict, interface-checking OOP with namespaces, multiple inheritance and private variables and methods.

The project is inpired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) and [$class](http://dean.edwards.name/weblog/2006/05/prototype-and-base/#comment4559).

Sample usage
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

The $priv 'decorator' makes a function to be priveledged - thus, have access to private variables through the $this._ map.