/* based on Josh Resig: http://ejohn.org/blog/simple-javascript-inheritance */
var initializing = false;
var superPattern = /xyz/.test(function(){ xyz; }) ? /\b_super\b/ : /.*/ ;

Object.subClass = function(prop){

  initializing = true;
  var proto = new this(); // inheritance
  initializing = false;
  
  //current Class 
  var _super = this.prototype;
  for(var key in prop){
    proto[key] = superPattern.test(prop[key]) && typeof proto[key] === 'function'&& typeof prop[key] === 'function' ? 
    (function(key,func){
      return function(){
        var tmp = this._super;
        
        this._super = _super[key];
        var ret = func.apply(this,arguments);
        
        this._super = tmp;

        return ret;
      };
    })(key,prop[key])
    : prop[key];
  }

  function Class(){
    if(!initializing && this.init)
      this.init.apply(this,arguments);
  }

  Class.prototype = proto;
  Class.subClass = arguments.callee;// or Object.subClass ?

  return Class;
};

/*var TestClass = Object.subClass({
  init: function(){
    this.a = 'aa';
  },
  print: function(){
    console.log(this.a);
  }
});
var TestClass2 = TestClass.subClass();
var v = new TestClass2();
v.print();*/
