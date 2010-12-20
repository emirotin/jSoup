var $_soup = {};

$_soup._consts = {
  DEFAULT_NS: '_default'
}

$_soup._ns = {};
window['$' + $_soup._consts.DEFAULT_NS] = $_soup._ns[$_soup._consts.DEFAULT_NS] = {};
$_soup._currentNs = $_soup._consts.DEFAULT_NS;


var $namespace = function(name, members) {
  if (arguments.length < 2) {
    members = name;
    name = "";
  }
  
  var ns = null;
  if (!name)
    name = $_soup._consts.DEFAULT_NS;

  if (name in $_soup._ns) {
    ns = $_soup._ns[name];
  }
  else {
    window['$' + name] = $_soup._ns[name] = ns = {};
  }

  $_soup._currentNs = name;
  var global_ns = name == $_soup._consts.DEFAULT_NS;
  
  for (var name in members)
  {
    var member = members[name]; 
    if (member['$_isDeferedClass'])
      member = member['func'].call()
    member['$name'] = name;
    ns[name] = member;
    // added: empty namespace makes definitions global
    if (global_ns)
      window[name] = member;
  }
}

var $interface = function(funcs) {
  var itf = {'members': [], '$_isInterface': true};
  
  function addMember(member, name) {
    var return_type = null, args_num = null;
    if (member instanceof Function) {
      return_type = member.call();
      // FIXME: better return type handling: Object / String / etc.
      if (return_type instanceof Object)
      {
        return_type = return_type.name;
      }
      args_num = member.length;
      name = name || member.name;
    }      
    else // unknown member type
      name = member;
    
    itf.members.push({
      'name': name,
      'args_num': args_num,
      'return_type': return_type
    })
    
  }
  
  if (funcs instanceof Array) {
    for (var i = 0; i < funcs.length; ++i)
      addMember(funcs[i], '')
  }
  else {
    for (var name in funcs)
      addMember(funcs[name], name)
  }
  
  return itf;
}

$_soup._getNsMember = function(name) {
  var dot = name.indexOf('.');
  var ns = null;
  if (dot < 0)
    ns = $_soup._currentNs;
  else {
    ns = name.substr(0, dot);
    name = name.substr(dot + 1, name.length - 1);
  }
  return $_soup._ns[ns][name];
}

var $priv = function(func) {
  return {'func': func, '$_isPrivMethodDeclaration': true}
}

var $private = function(func) {
  return {'func': func, '$_isPrivateMethodDeclaration': true}
}

$_soup._makePrivCallback = function($this, func, private_vars) {
  // works the same for private and priveledged methods
  var f = function() {
    if (private_vars['$_depth'] == 0)
      $this['_'] = private_vars;
    private_vars['$_depth']++;
    var res = func.apply(null, [$this].concat(Array.prototype.slice.call(arguments)));
    private_vars['$_depth']--;
    if (private_vars['$_depth'] == 0)
      delete $this['_'];
    return res;
  };
  func.$_wrapper = f;
  f.$_inner = func;
  return f;
}

$_soup._makePubCallback = function($this, func) {
  var f = function() {
    var _ = undefined, have_private = false;
    if ('_' in $this) { 
      _ = $this._;
      have_private = true;
      delete $this['_']; 
    }
    var res = func.apply(null, [$this].concat(Array.prototype.slice.call(arguments)));
    if (have_private) {
      $this['_'] = _;
    }
    return res;
  };
  func.$_wrapper = f;
  f.$_inner = func;
  return f;
}

var $super = function() {
  arguments.callee.caller.$super.$_wrapper.apply(null, Array.prototype.slice.call(arguments));
}

var $class = function(map, noNamespace) {
  // inside namespace have defered execution because have to wait while preceding declarations are processed
  // outside set noNamespace = true
  // TODO: think of better way to detect it
  var class_inner = function()
  {
    // implicitly call ancestors' constructors
    var $own_constructor = map['$constructor'] || function($this){};
    delete map['$constructor'];

    ancs = map['$extends'] || [];
    delete map['$extends'];
    if (!(ancs instanceof Array))
      ancs = [ancs];
    var ancestors = [];  
    for (var i = 0; i < ancs.length; ++i) {
      ancestors.push($_soup._getNsMember(ancs[i]));    
    }  
    
    var public_members = {};
    var $constructor = function() {
      var $this = arguments[0];
      for (var i = 0; i < ancestors.length; ++i)
        ancestors[i].$constructor.apply(null, Array.prototype.slice.call(arguments));
      var priv = map['$private_vars'] || {};
      var _ = {};
      for (var key in priv)
        _[key] = priv[key];
      _['$_depth'] = 0;
      $own_constructor.apply(null, arguments);
      
      // populate priviledged and public methods
      for (var name in map) {
        if (name.match(/^\$/))
          continue;
        var member = map[name];        
        if (member['$_isPrivMethodDeclaration']) {
          member = $_soup._makePrivCallback($this, member['func'], _);
          member['$_isPriv'] = true;
          member['$_isPublic'] = true;
          $this[name] = member;
        }
        else if (member['$_isPrivateMethodDeclaration']) {
          member = $_soup._makePrivCallback($this, member['func'], _);
          member['$_isPriv'] = true;
          member['$_isPrivate'] = true;
          _[name] = member;          
        }
        else if (member instanceof Function) {
          member = $_soup._makePubCallback($this, member);
          member['$_isPublic'] = true;
          public_members[name] = member;
          $this[name] = member;
        }
      }
    } 
    // construct class
    var cl = function() {     
     $constructor.apply(null, [this].concat(Array.prototype.slice.call(arguments)));
    }
    // handle native inheritance
    //    if (ancestors.length)
    //cl.prototype = new cl();//new ancestors[0]();
    cl.$constructor = $constructor;
    //cl.prototype.constructor = cl;
  
    // useful info
    cl["$ancestors"] = ancestors;
    cl["$_isClass"] = true;
    cl["$descendants"] = [];
        
    // clear map from reserved key
    itfs = map['$implements'] || [];
    delete map['$implements'];
    var interfaces = [];  
    for (var i = 0; i < itfs.length; ++i) {
      interfaces.push($_soup._getNsMember(itfs[i]));
    }  
    cl["$interfaces"] = interfaces;
    
    // populate inherited methods
    for (var i = 0; i < ancestors.length; ++i) {
      var a = ancestors[i];
      a.$descendants.push(cl);
      for (var name in a.prototype) {
        var member = a.prototype[name];
        if (!member || !member['$_isPublic'])
          continue;
        if ((name in cl.prototype) && !(cl.prototype[name]['$super'])) {
          cl.prototype[name].$_inner['$super'] = member.$_inner;
        }
        else if (!(name in cl.prototype))
          cl.prototype[name] = member;
      }
    }
      
    // TODO: validate interfaces 
    // TODO: in debug version only
    
    return cl;
  }
  if (noNamespace)
    return class_inner();
  return {'func': class_inner, '$_isDeferedClass': true}
}
