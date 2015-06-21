(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function() {
  var Bacon, BufferingSource, Bus, CompositeUnsubscribe, ConsumingSource, Desc, Dispatcher, End, Error, Event, EventStream, Exception, Initial, Next, None, Observable, Property, PropertyDispatcher, Some, Source, UpdateBarrier, _, addPropertyInitValueToStream, assert, assertArray, assertEventStream, assertFunction, assertNoArguments, assertObservable, assertObservableIsProperty, assertString, cloneArray, constantToFunction, containsDuplicateDeps, convertArgsToFunction, describe, endEvent, eventIdCounter, eventMethods, findDeps, findHandlerMethods, flatMap_, former, idCounter, initialEvent, isArray, isFieldKey, isObservable, latter, liftCallback, makeFunction, makeFunctionArgs, makeFunction_, makeObservable, makeSpawner, nextEvent, nop, partiallyApplied, recursionDepth, ref, registerObs, spys, toCombinator, toEvent, toFieldExtractor, toFieldKey, toOption, toSimpleExtractor, valueAndEnd, withDesc, withMethodCallSupport,
    hasProp = {}.hasOwnProperty,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bacon = {
    toString: function() {
      return "Bacon";
    }
  };

  Bacon.version = '0.7.65';

  Exception = (typeof global !== "undefined" && global !== null ? global : this).Error;

  nop = function() {};

  latter = function(_, x) {
    return x;
  };

  former = function(x, _) {
    return x;
  };

  cloneArray = function(xs) {
    return xs.slice(0);
  };

  assert = function(message, condition) {
    if (!condition) {
      throw new Exception(message);
    }
  };

  assertObservableIsProperty = function(x) {
    if (x instanceof Observable && !(x instanceof Property)) {
      throw new Exception("Observable is not a Property : " + x);
    }
  };

  assertEventStream = function(event) {
    if (!(event instanceof EventStream)) {
      throw new Exception("not an EventStream : " + event);
    }
  };

  assertObservable = function(event) {
    if (!(event instanceof Observable)) {
      throw new Exception("not an Observable : " + event);
    }
  };

  assertFunction = function(f) {
    return assert("not a function : " + f, _.isFunction(f));
  };

  isArray = function(xs) {
    return xs instanceof Array;
  };

  isObservable = function(x) {
    return x instanceof Observable;
  };

  assertArray = function(xs) {
    if (!isArray(xs)) {
      throw new Exception("not an array : " + xs);
    }
  };

  assertNoArguments = function(args) {
    return assert("no arguments supported", args.length === 0);
  };

  assertString = function(x) {
    if (typeof x !== "string") {
      throw new Exception("not a string : " + x);
    }
  };

  _ = {
    indexOf: Array.prototype.indexOf ? function(xs, x) {
      return xs.indexOf(x);
    } : function(xs, x) {
      var i, j, len1, y;
      for (i = j = 0, len1 = xs.length; j < len1; i = ++j) {
        y = xs[i];
        if (x === y) {
          return i;
        }
      }
      return -1;
    },
    indexWhere: function(xs, f) {
      var i, j, len1, y;
      for (i = j = 0, len1 = xs.length; j < len1; i = ++j) {
        y = xs[i];
        if (f(y)) {
          return i;
        }
      }
      return -1;
    },
    head: function(xs) {
      return xs[0];
    },
    always: function(x) {
      return function() {
        return x;
      };
    },
    negate: function(f) {
      return function(x) {
        return !f(x);
      };
    },
    empty: function(xs) {
      return xs.length === 0;
    },
    tail: function(xs) {
      return xs.slice(1, xs.length);
    },
    filter: function(f, xs) {
      var filtered, j, len1, x;
      filtered = [];
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        if (f(x)) {
          filtered.push(x);
        }
      }
      return filtered;
    },
    map: function(f, xs) {
      var j, len1, results, x;
      results = [];
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        results.push(f(x));
      }
      return results;
    },
    each: function(xs, f) {
      var key, value;
      for (key in xs) {
        if (!hasProp.call(xs, key)) continue;
        value = xs[key];
        f(key, value);
      }
      return void 0;
    },
    toArray: function(xs) {
      if (isArray(xs)) {
        return xs;
      } else {
        return [xs];
      }
    },
    contains: function(xs, x) {
      return _.indexOf(xs, x) !== -1;
    },
    id: function(x) {
      return x;
    },
    last: function(xs) {
      return xs[xs.length - 1];
    },
    all: function(xs, f) {
      var j, len1, x;
      if (f == null) {
        f = _.id;
      }
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        if (!f(x)) {
          return false;
        }
      }
      return true;
    },
    any: function(xs, f) {
      var j, len1, x;
      if (f == null) {
        f = _.id;
      }
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        if (f(x)) {
          return true;
        }
      }
      return false;
    },
    without: function(x, xs) {
      return _.filter((function(y) {
        return y !== x;
      }), xs);
    },
    remove: function(x, xs) {
      var i;
      i = _.indexOf(xs, x);
      if (i >= 0) {
        return xs.splice(i, 1);
      }
    },
    fold: function(xs, seed, f) {
      var j, len1, x;
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        seed = f(seed, x);
      }
      return seed;
    },
    flatMap: function(f, xs) {
      return _.fold(xs, [], (function(ys, x) {
        return ys.concat(f(x));
      }));
    },
    cached: function(f) {
      var value;
      value = None;
      return function() {
        if (value === None) {
          value = f();
          f = void 0;
        }
        return value;
      };
    },
    isFunction: function(f) {
      return typeof f === "function";
    },
    toString: function(obj) {
      var ex, internals, key, value;
      try {
        recursionDepth++;
        if (obj == null) {
          return "undefined";
        } else if (_.isFunction(obj)) {
          return "function";
        } else if (isArray(obj)) {
          if (recursionDepth > 5) {
            return "[..]";
          }
          return "[" + _.map(_.toString, obj).toString() + "]";
        } else if (((obj != null ? obj.toString : void 0) != null) && obj.toString !== Object.prototype.toString) {
          return obj.toString();
        } else if (typeof obj === "object") {
          if (recursionDepth > 5) {
            return "{..}";
          }
          internals = (function() {
            var results;
            results = [];
            for (key in obj) {
              if (!hasProp.call(obj, key)) continue;
              value = (function() {
                try {
                  return obj[key];
                } catch (_error) {
                  ex = _error;
                  return ex;
                }
              })();
              results.push(_.toString(key) + ":" + _.toString(value));
            }
            return results;
          })();
          return "{" + internals + "}";
        } else {
          return obj;
        }
      } finally {
        recursionDepth--;
      }
    }
  };

  recursionDepth = 0;

  Bacon._ = _;

  UpdateBarrier = Bacon.UpdateBarrier = (function() {
    var afterTransaction, afters, aftersIndex, currentEventId, flush, flushDepsOf, flushWaiters, hasWaiters, inTransaction, rootEvent, waiterObs, waiters, whenDoneWith, wrappedSubscribe;
    rootEvent = void 0;
    waiterObs = [];
    waiters = {};
    afters = [];
    aftersIndex = 0;
    afterTransaction = function(f) {
      if (rootEvent) {
        return afters.push(f);
      } else {
        return f();
      }
    };
    whenDoneWith = function(obs, f) {
      var obsWaiters;
      if (rootEvent) {
        obsWaiters = waiters[obs.id];
        if (obsWaiters == null) {
          obsWaiters = waiters[obs.id] = [f];
          return waiterObs.push(obs);
        } else {
          return obsWaiters.push(f);
        }
      } else {
        return f();
      }
    };
    flush = function() {
      while (waiterObs.length > 0) {
        flushWaiters(0);
      }
      return void 0;
    };
    flushWaiters = function(index) {
      var f, j, len1, obs, obsId, obsWaiters;
      obs = waiterObs[index];
      obsId = obs.id;
      obsWaiters = waiters[obsId];
      waiterObs.splice(index, 1);
      delete waiters[obsId];
      flushDepsOf(obs);
      for (j = 0, len1 = obsWaiters.length; j < len1; j++) {
        f = obsWaiters[j];
        f();
      }
      return void 0;
    };
    flushDepsOf = function(obs) {
      var dep, deps, index, j, len1;
      deps = obs.internalDeps();
      for (j = 0, len1 = deps.length; j < len1; j++) {
        dep = deps[j];
        flushDepsOf(dep);
        if (waiters[dep.id]) {
          index = _.indexOf(waiterObs, dep);
          flushWaiters(index);
        }
      }
      return void 0;
    };
    inTransaction = function(event, context, f, args) {
      var after, result;
      if (rootEvent) {
        return f.apply(context, args);
      } else {
        rootEvent = event;
        try {
          result = f.apply(context, args);
          flush();
        } finally {
          rootEvent = void 0;
          while (aftersIndex < afters.length) {
            after = afters[aftersIndex];
            aftersIndex++;
            after();
          }
          aftersIndex = 0;
          afters = [];
        }
        return result;
      }
    };
    currentEventId = function() {
      if (rootEvent) {
        return rootEvent.id;
      } else {
        return void 0;
      }
    };
    wrappedSubscribe = function(obs, sink) {
      var doUnsub, shouldUnsub, unsub, unsubd;
      unsubd = false;
      shouldUnsub = false;
      doUnsub = function() {
        return shouldUnsub = true;
      };
      unsub = function() {
        unsubd = true;
        return doUnsub();
      };
      doUnsub = obs.dispatcher.subscribe(function(event) {
        return afterTransaction(function() {
          var reply;
          if (!unsubd) {
            reply = sink(event);
            if (reply === Bacon.noMore) {
              return unsub();
            }
          }
        });
      });
      if (shouldUnsub) {
        doUnsub();
      }
      return unsub;
    };
    hasWaiters = function() {
      return waiterObs.length > 0;
    };
    return {
      whenDoneWith: whenDoneWith,
      hasWaiters: hasWaiters,
      inTransaction: inTransaction,
      currentEventId: currentEventId,
      wrappedSubscribe: wrappedSubscribe,
      afterTransaction: afterTransaction
    };
  })();

  Source = (function() {
    function Source(obs1, sync, lazy1) {
      this.obs = obs1;
      this.sync = sync;
      this.lazy = lazy1 != null ? lazy1 : false;
      this.queue = [];
    }

    Source.prototype.subscribe = function(sink) {
      return this.obs.dispatcher.subscribe(sink);
    };

    Source.prototype.toString = function() {
      return this.obs.toString();
    };

    Source.prototype.markEnded = function() {
      return this.ended = true;
    };

    Source.prototype.consume = function() {
      if (this.lazy) {
        return {
          value: _.always(this.queue[0])
        };
      } else {
        return this.queue[0];
      }
    };

    Source.prototype.push = function(x) {
      return this.queue = [x];
    };

    Source.prototype.mayHave = function() {
      return true;
    };

    Source.prototype.hasAtLeast = function() {
      return this.queue.length;
    };

    Source.prototype.flatten = true;

    return Source;

  })();

  ConsumingSource = (function(superClass) {
    extend(ConsumingSource, superClass);

    function ConsumingSource() {
      return ConsumingSource.__super__.constructor.apply(this, arguments);
    }

    ConsumingSource.prototype.consume = function() {
      return this.queue.shift();
    };

    ConsumingSource.prototype.push = function(x) {
      return this.queue.push(x);
    };

    ConsumingSource.prototype.mayHave = function(c) {
      return !this.ended || this.queue.length >= c;
    };

    ConsumingSource.prototype.hasAtLeast = function(c) {
      return this.queue.length >= c;
    };

    ConsumingSource.prototype.flatten = false;

    return ConsumingSource;

  })(Source);

  BufferingSource = (function(superClass) {
    extend(BufferingSource, superClass);

    function BufferingSource(obs) {
      BufferingSource.__super__.constructor.call(this, obs, true);
    }

    BufferingSource.prototype.consume = function() {
      var values;
      values = this.queue;
      this.queue = [];
      return {
        value: function() {
          return values;
        }
      };
    };

    BufferingSource.prototype.push = function(x) {
      return this.queue.push(x.value());
    };

    BufferingSource.prototype.hasAtLeast = function() {
      return true;
    };

    return BufferingSource;

  })(Source);

  Source.isTrigger = function(s) {
    if (s instanceof Source) {
      return s.sync;
    } else {
      return s instanceof EventStream;
    }
  };

  Source.fromObservable = function(s) {
    if (s instanceof Source) {
      return s;
    } else if (s instanceof Property) {
      return new Source(s, false);
    } else {
      return new ConsumingSource(s, true);
    }
  };

  Desc = (function() {
    function Desc(context1, method1, args1) {
      this.context = context1;
      this.method = method1;
      this.args = args1;
    }

    Desc.prototype.deps = function() {
      return this.cached || (this.cached = findDeps([this.context].concat(this.args)));
    };

    Desc.prototype.toString = function() {
      return _.toString(this.context) + "." + _.toString(this.method) + "(" + _.map(_.toString, this.args) + ")";
    };

    return Desc;

  })();

  describe = function() {
    var args, context, method;
    context = arguments[0], method = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    if ((context || method) instanceof Desc) {
      return context || method;
    } else {
      return new Desc(context, method, args);
    }
  };

  withDesc = function(desc, obs) {
    obs.desc = desc;
    return obs;
  };

  findDeps = function(x) {
    if (isArray(x)) {
      return _.flatMap(findDeps, x);
    } else if (isObservable(x)) {
      return [x];
    } else if (x instanceof Source) {
      return [x.obs];
    } else {
      return [];
    }
  };

  Bacon.Desc = Desc;

  Bacon.Desc.empty = new Bacon.Desc("", "", []);

  withMethodCallSupport = function(wrapped) {
    return function() {
      var args, context, f, methodName;
      f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (typeof f === "object" && args.length) {
        context = f;
        methodName = args[0];
        f = function() {
          return context[methodName].apply(context, arguments);
        };
        args = args.slice(1);
      }
      return wrapped.apply(null, [f].concat(slice.call(args)));
    };
  };

  makeFunctionArgs = function(args) {
    args = Array.prototype.slice.call(args);
    return makeFunction_.apply(null, args);
  };

  partiallyApplied = function(f, applied) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return f.apply(null, applied.concat(args));
    };
  };

  toSimpleExtractor = function(args) {
    return function(key) {
      return function(value) {
        var fieldValue;
        if (value == null) {
          return void 0;
        } else {
          fieldValue = value[key];
          if (_.isFunction(fieldValue)) {
            return fieldValue.apply(value, args);
          } else {
            return fieldValue;
          }
        }
      };
    };
  };

  toFieldExtractor = function(f, args) {
    var partFuncs, parts;
    parts = f.slice(1).split(".");
    partFuncs = _.map(toSimpleExtractor(args), parts);
    return function(value) {
      var j, len1;
      for (j = 0, len1 = partFuncs.length; j < len1; j++) {
        f = partFuncs[j];
        value = f(value);
      }
      return value;
    };
  };

  isFieldKey = function(f) {
    return (typeof f === "string") && f.length > 1 && f.charAt(0) === ".";
  };

  makeFunction_ = withMethodCallSupport(function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (_.isFunction(f)) {
      if (args.length) {
        return partiallyApplied(f, args);
      } else {
        return f;
      }
    } else if (isFieldKey(f)) {
      return toFieldExtractor(f, args);
    } else {
      return _.always(f);
    }
  });

  makeFunction = function(f, args) {
    return makeFunction_.apply(null, [f].concat(slice.call(args)));
  };

  convertArgsToFunction = function(obs, f, args, method) {
    var sampled;
    if (f instanceof Property) {
      sampled = f.sampledBy(obs, function(p, s) {
        return [p, s];
      });
      return method.call(sampled, function(arg) {
        var p, s;
        p = arg[0], s = arg[1];
        return p;
      }).map(function(arg) {
        var p, s;
        p = arg[0], s = arg[1];
        return s;
      });
    } else {
      f = makeFunction(f, args);
      return method.call(obs, f);
    }
  };

  toCombinator = function(f) {
    var key;
    if (_.isFunction(f)) {
      return f;
    } else if (isFieldKey(f)) {
      key = toFieldKey(f);
      return function(left, right) {
        return left[key](right);
      };
    } else {
      throw new Exception("not a function or a field key: " + f);
    }
  };

  toFieldKey = function(f) {
    return f.slice(1);
  };

  Some = (function() {
    function Some(value1) {
      this.value = value1;
    }

    Some.prototype.getOrElse = function() {
      return this.value;
    };

    Some.prototype.get = function() {
      return this.value;
    };

    Some.prototype.filter = function(f) {
      if (f(this.value)) {
        return new Some(this.value);
      } else {
        return None;
      }
    };

    Some.prototype.map = function(f) {
      return new Some(f(this.value));
    };

    Some.prototype.forEach = function(f) {
      return f(this.value);
    };

    Some.prototype.isDefined = true;

    Some.prototype.toArray = function() {
      return [this.value];
    };

    Some.prototype.inspect = function() {
      return "Some(" + this.value + ")";
    };

    Some.prototype.toString = function() {
      return this.inspect();
    };

    return Some;

  })();

  None = {
    getOrElse: function(value) {
      return value;
    },
    filter: function() {
      return None;
    },
    map: function() {
      return None;
    },
    forEach: function() {},
    isDefined: false,
    toArray: function() {
      return [];
    },
    inspect: function() {
      return "None";
    },
    toString: function() {
      return this.inspect();
    }
  };

  toOption = function(v) {
    if (v instanceof Some || v === None) {
      return v;
    } else {
      return new Some(v);
    }
  };

  Bacon.noMore = ["<no-more>"];

  Bacon.more = ["<more>"];

  eventIdCounter = 0;

  Event = (function() {
    function Event() {
      this.id = ++eventIdCounter;
    }

    Event.prototype.isEvent = function() {
      return true;
    };

    Event.prototype.isEnd = function() {
      return false;
    };

    Event.prototype.isInitial = function() {
      return false;
    };

    Event.prototype.isNext = function() {
      return false;
    };

    Event.prototype.isError = function() {
      return false;
    };

    Event.prototype.hasValue = function() {
      return false;
    };

    Event.prototype.filter = function() {
      return true;
    };

    Event.prototype.inspect = function() {
      return this.toString();
    };

    Event.prototype.log = function() {
      return this.toString();
    };

    return Event;

  })();

  Next = (function(superClass) {
    extend(Next, superClass);

    function Next(valueF, eager) {
      Next.__super__.constructor.call(this);
      if (!eager && _.isFunction(valueF) || valueF instanceof Next) {
        this.valueF = valueF;
        this.valueInternal = void 0;
      } else {
        this.valueF = void 0;
        this.valueInternal = valueF;
      }
    }

    Next.prototype.isNext = function() {
      return true;
    };

    Next.prototype.hasValue = function() {
      return true;
    };

    Next.prototype.value = function() {
      if (this.valueF instanceof Next) {
        this.valueInternal = this.valueF.value();
        this.valueF = void 0;
      } else if (this.valueF) {
        this.valueInternal = this.valueF();
        this.valueF = void 0;
      }
      return this.valueInternal;
    };

    Next.prototype.fmap = function(f) {
      var event, value;
      if (this.valueInternal) {
        value = this.valueInternal;
        return this.apply(function() {
          return f(value);
        });
      } else {
        event = this;
        return this.apply(function() {
          return f(event.value());
        });
      }
    };

    Next.prototype.apply = function(value) {
      return new Next(value);
    };

    Next.prototype.filter = function(f) {
      return f(this.value());
    };

    Next.prototype.toString = function() {
      return _.toString(this.value());
    };

    Next.prototype.log = function() {
      return this.value();
    };

    return Next;

  })(Event);

  Initial = (function(superClass) {
    extend(Initial, superClass);

    function Initial() {
      return Initial.__super__.constructor.apply(this, arguments);
    }

    Initial.prototype.isInitial = function() {
      return true;
    };

    Initial.prototype.isNext = function() {
      return false;
    };

    Initial.prototype.apply = function(value) {
      return new Initial(value);
    };

    Initial.prototype.toNext = function() {
      return new Next(this);
    };

    return Initial;

  })(Next);

  End = (function(superClass) {
    extend(End, superClass);

    function End() {
      return End.__super__.constructor.apply(this, arguments);
    }

    End.prototype.isEnd = function() {
      return true;
    };

    End.prototype.fmap = function() {
      return this;
    };

    End.prototype.apply = function() {
      return this;
    };

    End.prototype.toString = function() {
      return "<end>";
    };

    return End;

  })(Event);

  Error = (function(superClass) {
    extend(Error, superClass);

    function Error(error1) {
      this.error = error1;
    }

    Error.prototype.isError = function() {
      return true;
    };

    Error.prototype.fmap = function() {
      return this;
    };

    Error.prototype.apply = function() {
      return this;
    };

    Error.prototype.toString = function() {
      return "<error> " + _.toString(this.error);
    };

    return Error;

  })(Event);

  Bacon.Event = Event;

  Bacon.Initial = Initial;

  Bacon.Next = Next;

  Bacon.End = End;

  Bacon.Error = Error;

  initialEvent = function(value) {
    return new Initial(value, true);
  };

  nextEvent = function(value) {
    return new Next(value, true);
  };

  endEvent = function() {
    return new End();
  };

  toEvent = function(x) {
    if (x instanceof Event) {
      return x;
    } else {
      return nextEvent(x);
    }
  };

  idCounter = 0;

  registerObs = function() {};

  Observable = (function() {
    function Observable(desc1) {
      this.desc = desc1;
      this.id = ++idCounter;
      this.initialDesc = this.desc;
    }

    Observable.prototype.subscribe = function(sink) {
      return UpdateBarrier.wrappedSubscribe(this, sink);
    };

    Observable.prototype.subscribeInternal = function(sink) {
      return this.dispatcher.subscribe(sink);
    };

    Observable.prototype.onValue = function() {
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event) {
        if (event.hasValue()) {
          return f(event.value());
        }
      });
    };

    Observable.prototype.onValues = function(f) {
      return this.onValue(function(args) {
        return f.apply(null, args);
      });
    };

    Observable.prototype.onError = function() {
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event) {
        if (event.isError()) {
          return f(event.error);
        }
      });
    };

    Observable.prototype.onEnd = function() {
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event) {
        if (event.isEnd()) {
          return f();
        }
      });
    };

    Observable.prototype.name = function(name) {
      this._name = name;
      return this;
    };

    Observable.prototype.withDescription = function() {
      this.desc = describe.apply(null, arguments);
      return this;
    };

    Observable.prototype.toString = function() {
      if (this._name) {
        return this._name;
      } else {
        return this.desc.toString();
      }
    };

    Observable.prototype.internalDeps = function() {
      return this.initialDesc.deps();
    };

    return Observable;

  })();

  Observable.prototype.assign = Observable.prototype.onValue;

  Observable.prototype.forEach = Observable.prototype.onValue;

  Observable.prototype.inspect = Observable.prototype.toString;

  Bacon.Observable = Observable;

  CompositeUnsubscribe = (function() {
    function CompositeUnsubscribe(ss) {
      var j, len1, s;
      if (ss == null) {
        ss = [];
      }
      this.unsubscribe = bind(this.unsubscribe, this);
      this.unsubscribed = false;
      this.subscriptions = [];
      this.starting = [];
      for (j = 0, len1 = ss.length; j < len1; j++) {
        s = ss[j];
        this.add(s);
      }
    }

    CompositeUnsubscribe.prototype.add = function(subscription) {
      var ended, unsub, unsubMe;
      if (this.unsubscribed) {
        return;
      }
      ended = false;
      unsub = nop;
      this.starting.push(subscription);
      unsubMe = (function(_this) {
        return function() {
          if (_this.unsubscribed) {
            return;
          }
          ended = true;
          _this.remove(unsub);
          return _.remove(subscription, _this.starting);
        };
      })(this);
      unsub = subscription(this.unsubscribe, unsubMe);
      if (!(this.unsubscribed || ended)) {
        this.subscriptions.push(unsub);
      } else {
        unsub();
      }
      _.remove(subscription, this.starting);
      return unsub;
    };

    CompositeUnsubscribe.prototype.remove = function(unsub) {
      if (this.unsubscribed) {
        return;
      }
      if ((_.remove(unsub, this.subscriptions)) !== void 0) {
        return unsub();
      }
    };

    CompositeUnsubscribe.prototype.unsubscribe = function() {
      var j, len1, ref, s;
      if (this.unsubscribed) {
        return;
      }
      this.unsubscribed = true;
      ref = this.subscriptions;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        s = ref[j];
        s();
      }
      this.subscriptions = [];
      return this.starting = [];
    };

    CompositeUnsubscribe.prototype.count = function() {
      if (this.unsubscribed) {
        return 0;
      }
      return this.subscriptions.length + this.starting.length;
    };

    CompositeUnsubscribe.prototype.empty = function() {
      return this.count() === 0;
    };

    return CompositeUnsubscribe;

  })();

  Bacon.CompositeUnsubscribe = CompositeUnsubscribe;

  Dispatcher = (function() {
    Dispatcher.prototype.pushing = false;

    Dispatcher.prototype.ended = false;

    Dispatcher.prototype.prevError = void 0;

    Dispatcher.prototype.unsubSrc = void 0;

    function Dispatcher(_subscribe, _handleEvent) {
      this._subscribe = _subscribe;
      this._handleEvent = _handleEvent;
      this.subscribe = bind(this.subscribe, this);
      this.handleEvent = bind(this.handleEvent, this);
      this.subscriptions = [];
      this.queue = [];
    }

    Dispatcher.prototype.hasSubscribers = function() {
      return this.subscriptions.length > 0;
    };

    Dispatcher.prototype.removeSub = function(subscription) {
      return this.subscriptions = _.without(subscription, this.subscriptions);
    };

    Dispatcher.prototype.push = function(event) {
      if (event.isEnd()) {
        this.ended = true;
      }
      return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
    };

    Dispatcher.prototype.pushToSubscriptions = function(event) {
      var e, j, len1, reply, sub, tmp;
      try {
        tmp = this.subscriptions;
        for (j = 0, len1 = tmp.length; j < len1; j++) {
          sub = tmp[j];
          reply = sub.sink(event);
          if (reply === Bacon.noMore || event.isEnd()) {
            this.removeSub(sub);
          }
        }
        return true;
      } catch (_error) {
        e = _error;
        this.pushing = false;
        this.queue = [];
        throw e;
      }
    };

    Dispatcher.prototype.pushIt = function(event) {
      if (!this.pushing) {
        if (event === this.prevError) {
          return;
        }
        if (event.isError()) {
          this.prevError = event;
        }
        this.pushing = true;
        this.pushToSubscriptions(event);
        this.pushing = false;
        while (this.queue.length) {
          event = this.queue.shift();
          this.push(event);
        }
        if (this.hasSubscribers()) {
          return Bacon.more;
        } else {
          this.unsubscribeFromSource();
          return Bacon.noMore;
        }
      } else {
        this.queue.push(event);
        return Bacon.more;
      }
    };

    Dispatcher.prototype.handleEvent = function(event) {
      if (this._handleEvent) {
        return this._handleEvent(event);
      } else {
        return this.push(event);
      }
    };

    Dispatcher.prototype.unsubscribeFromSource = function() {
      if (this.unsubSrc) {
        this.unsubSrc();
      }
      return this.unsubSrc = void 0;
    };

    Dispatcher.prototype.subscribe = function(sink) {
      var subscription;
      if (this.ended) {
        sink(endEvent());
        return nop;
      } else {
        assertFunction(sink);
        subscription = {
          sink: sink
        };
        this.subscriptions.push(subscription);
        if (this.subscriptions.length === 1) {
          this.unsubSrc = this._subscribe(this.handleEvent);
          assertFunction(this.unsubSrc);
        }
        return (function(_this) {
          return function() {
            _this.removeSub(subscription);
            if (!_this.hasSubscribers()) {
              return _this.unsubscribeFromSource();
            }
          };
        })(this);
      }
    };

    return Dispatcher;

  })();

  Bacon.Dispatcher = Dispatcher;

  EventStream = (function(superClass) {
    extend(EventStream, superClass);

    function EventStream(desc, subscribe, handler) {
      if (_.isFunction(desc)) {
        handler = subscribe;
        subscribe = desc;
        desc = Desc.empty;
      }
      EventStream.__super__.constructor.call(this, desc);
      assertFunction(subscribe);
      this.dispatcher = new Dispatcher(subscribe, handler);
      registerObs(this);
    }

    EventStream.prototype.toProperty = function(initValue_) {
      var disp, initValue;
      initValue = arguments.length === 0 ? None : toOption(function() {
        return initValue_;
      });
      disp = this.dispatcher;
      return new Property(new Bacon.Desc(this, "toProperty", [initValue_]), function(sink) {
        var initSent, reply, sendInit, unsub;
        initSent = false;
        unsub = nop;
        reply = Bacon.more;
        sendInit = function() {
          if (!initSent) {
            return initValue.forEach(function(value) {
              initSent = true;
              reply = sink(new Initial(value));
              if (reply === Bacon.noMore) {
                unsub();
                return unsub = nop;
              }
            });
          }
        };
        unsub = disp.subscribe(function(event) {
          if (event.hasValue()) {
            if (initSent && event.isInitial()) {
              return Bacon.more;
            } else {
              if (!event.isInitial()) {
                sendInit();
              }
              initSent = true;
              initValue = new Some(event);
              return sink(event);
            }
          } else {
            if (event.isEnd()) {
              reply = sendInit();
            }
            if (reply !== Bacon.noMore) {
              return sink(event);
            }
          }
        });
        sendInit();
        return unsub;
      });
    };

    EventStream.prototype.toEventStream = function() {
      return this;
    };

    EventStream.prototype.withHandler = function(handler) {
      return new EventStream(new Bacon.Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
    };

    return EventStream;

  })(Observable);

  Bacon.EventStream = EventStream;

  Bacon.never = function() {
    return new EventStream(describe(Bacon, "never"), function(sink) {
      sink(endEvent());
      return nop;
    });
  };

  Bacon.when = function() {
    var f, i, index, ix, j, k, len, len1, len2, needsBarrier, pat, patSources, pats, patterns, ref, resultStream, s, sources, triggerFound, usage;
    if (arguments.length === 0) {
      return Bacon.never();
    }
    len = arguments.length;
    usage = "when: expecting arguments in the form (Observable+,function)+";
    assert(usage, len % 2 === 0);
    sources = [];
    pats = [];
    i = 0;
    patterns = [];
    while (i < len) {
      patterns[i] = arguments[i];
      patterns[i + 1] = arguments[i + 1];
      patSources = _.toArray(arguments[i]);
      f = constantToFunction(arguments[i + 1]);
      pat = {
        f: f,
        ixs: []
      };
      triggerFound = false;
      for (j = 0, len1 = patSources.length; j < len1; j++) {
        s = patSources[j];
        index = _.indexOf(sources, s);
        if (!triggerFound) {
          triggerFound = Source.isTrigger(s);
        }
        if (index < 0) {
          sources.push(s);
          index = sources.length - 1;
        }
        ref = pat.ixs;
        for (k = 0, len2 = ref.length; k < len2; k++) {
          ix = ref[k];
          if (ix.index === index) {
            ix.count++;
          }
        }
        pat.ixs.push({
          index: index,
          count: 1
        });
      }
      assert("At least one EventStream required", triggerFound || (!patSources.length));
      if (patSources.length > 0) {
        pats.push(pat);
      }
      i = i + 2;
    }
    if (!sources.length) {
      return Bacon.never();
    }
    sources = _.map(Source.fromObservable, sources);
    needsBarrier = (_.any(sources, function(s) {
      return s.flatten;
    })) && (containsDuplicateDeps(_.map((function(s) {
      return s.obs;
    }), sources)));
    return resultStream = new EventStream(new Bacon.Desc(Bacon, "when", patterns), function(sink) {
      var cannotMatch, cannotSync, ends, match, nonFlattened, part, triggers;
      triggers = [];
      ends = false;
      match = function(p) {
        var l, len3, ref1;
        ref1 = p.ixs;
        for (l = 0, len3 = ref1.length; l < len3; l++) {
          i = ref1[l];
          if (!sources[i.index].hasAtLeast(i.count)) {
            return false;
          }
        }
        return true;
      };
      cannotSync = function(source) {
        return !source.sync || source.ended;
      };
      cannotMatch = function(p) {
        var l, len3, ref1;
        ref1 = p.ixs;
        for (l = 0, len3 = ref1.length; l < len3; l++) {
          i = ref1[l];
          if (!sources[i.index].mayHave(i.count)) {
            return true;
          }
        }
      };
      nonFlattened = function(trigger) {
        return !trigger.source.flatten;
      };
      part = function(source) {
        return function(unsubAll) {
          var flush, flushLater, flushWhileTriggers;
          flushLater = function() {
            return UpdateBarrier.whenDoneWith(resultStream, flush);
          };
          flushWhileTriggers = function() {
            var events, l, len3, p, reply, trigger;
            if (triggers.length > 0) {
              reply = Bacon.more;
              trigger = triggers.pop();
              for (l = 0, len3 = pats.length; l < len3; l++) {
                p = pats[l];
                if (match(p)) {
                  events = (function() {
                    var len4, m, ref1, results;
                    ref1 = p.ixs;
                    results = [];
                    for (m = 0, len4 = ref1.length; m < len4; m++) {
                      i = ref1[m];
                      results.push(sources[i.index].consume());
                    }
                    return results;
                  })();
                  reply = sink(trigger.e.apply(function() {
                    var event, values;
                    values = (function() {
                      var len4, m, results;
                      results = [];
                      for (m = 0, len4 = events.length; m < len4; m++) {
                        event = events[m];
                        results.push(event.value());
                      }
                      return results;
                    })();
                    return p.f.apply(p, values);
                  }));
                  if (triggers.length) {
                    triggers = _.filter(nonFlattened, triggers);
                  }
                  if (reply === Bacon.noMore) {
                    return reply;
                  } else {
                    return flushWhileTriggers();
                  }
                }
              }
            } else {
              return Bacon.more;
            }
          };
          flush = function() {
            var reply;
            reply = flushWhileTriggers();
            if (ends) {
              ends = false;
              if (_.all(sources, cannotSync) || _.all(pats, cannotMatch)) {
                reply = Bacon.noMore;
                sink(endEvent());
              }
            }
            if (reply === Bacon.noMore) {
              unsubAll();
            }
            return reply;
          };
          return source.subscribe(function(e) {
            var reply;
            if (e.isEnd()) {
              ends = true;
              source.markEnded();
              flushLater();
            } else if (e.isError()) {
              reply = sink(e);
            } else {
              source.push(e);
              if (source.sync) {
                triggers.push({
                  source: source,
                  e: e
                });
                if (needsBarrier || UpdateBarrier.hasWaiters()) {
                  flushLater();
                } else {
                  flush();
                }
              }
            }
            if (reply === Bacon.noMore) {
              unsubAll();
            }
            return reply || Bacon.more;
          });
        };
      };
      return new Bacon.CompositeUnsubscribe((function() {
        var l, len3, results;
        results = [];
        for (l = 0, len3 = sources.length; l < len3; l++) {
          s = sources[l];
          results.push(part(s));
        }
        return results;
      })()).unsubscribe;
    });
  };

  containsDuplicateDeps = function(observables, state) {
    var checkObservable;
    if (state == null) {
      state = [];
    }
    checkObservable = function(obs) {
      var deps;
      if (_.contains(state, obs)) {
        return true;
      } else {
        deps = obs.internalDeps();
        if (deps.length) {
          state.push(obs);
          return _.any(deps, checkObservable);
        } else {
          state.push(obs);
          return false;
        }
      }
    };
    return _.any(observables, checkObservable);
  };

  constantToFunction = function(f) {
    if (_.isFunction(f)) {
      return f;
    } else {
      return _.always(f);
    }
  };

  Bacon.groupSimultaneous = function() {
    var s, sources, streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (streams.length === 1 && isArray(streams[0])) {
      streams = streams[0];
    }
    sources = (function() {
      var j, len1, results;
      results = [];
      for (j = 0, len1 = streams.length; j < len1; j++) {
        s = streams[j];
        results.push(new BufferingSource(s));
      }
      return results;
    })();
    return withDesc(new Bacon.Desc(Bacon, "groupSimultaneous", streams), Bacon.when(sources, (function() {
      var xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return xs;
    })));
  };

  PropertyDispatcher = (function(superClass) {
    extend(PropertyDispatcher, superClass);

    function PropertyDispatcher(property1, subscribe, handleEvent) {
      this.property = property1;
      this.subscribe = bind(this.subscribe, this);
      PropertyDispatcher.__super__.constructor.call(this, subscribe, handleEvent);
      this.current = None;
      this.currentValueRootId = void 0;
      this.propertyEnded = false;
    }

    PropertyDispatcher.prototype.push = function(event) {
      if (event.isEnd()) {
        this.propertyEnded = true;
      }
      if (event.hasValue()) {
        this.current = new Some(event);
        this.currentValueRootId = UpdateBarrier.currentEventId();
      }
      return PropertyDispatcher.__super__.push.call(this, event);
    };

    PropertyDispatcher.prototype.maybeSubSource = function(sink, reply) {
      if (reply === Bacon.noMore) {
        return nop;
      } else if (this.propertyEnded) {
        sink(endEvent());
        return nop;
      } else {
        return Dispatcher.prototype.subscribe.call(this, sink);
      }
    };

    PropertyDispatcher.prototype.subscribe = function(sink) {
      var dispatchingId, initSent, reply, valId;
      initSent = false;
      reply = Bacon.more;
      if (this.current.isDefined && (this.hasSubscribers() || this.propertyEnded)) {
        dispatchingId = UpdateBarrier.currentEventId();
        valId = this.currentValueRootId;
        if (!this.propertyEnded && valId && dispatchingId && dispatchingId !== valId) {
          UpdateBarrier.whenDoneWith(this.property, (function(_this) {
            return function() {
              if (_this.currentValueRootId === valId) {
                return sink(initialEvent(_this.current.get().value()));
              }
            };
          })(this));
          return this.maybeSubSource(sink, reply);
        } else {
          UpdateBarrier.inTransaction(void 0, this, (function() {
            return reply = sink(initialEvent(this.current.get().value()));
          }), []);
          return this.maybeSubSource(sink, reply);
        }
      } else {
        return this.maybeSubSource(sink, reply);
      }
    };

    return PropertyDispatcher;

  })(Dispatcher);

  Property = (function(superClass) {
    extend(Property, superClass);

    function Property(desc, subscribe, handler) {
      Property.__super__.constructor.call(this, desc);
      assertFunction(subscribe);
      this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
      registerObs(this);
    }

    Property.prototype.changes = function() {
      return new EventStream(new Bacon.Desc(this, "changes", []), (function(_this) {
        return function(sink) {
          return _this.dispatcher.subscribe(function(event) {
            if (!event.isInitial()) {
              return sink(event);
            }
          });
        };
      })(this));
    };

    Property.prototype.withHandler = function(handler) {
      return new Property(new Bacon.Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
    };

    Property.prototype.toProperty = function() {
      assertNoArguments(arguments);
      return this;
    };

    Property.prototype.toEventStream = function() {
      return new EventStream(new Bacon.Desc(this, "toEventStream", []), (function(_this) {
        return function(sink) {
          return _this.dispatcher.subscribe(function(event) {
            if (event.isInitial()) {
              event = event.toNext();
            }
            return sink(event);
          });
        };
      })(this));
    };

    return Property;

  })(Observable);

  Bacon.Property = Property;

  Bacon.constant = function(value) {
    return new Property(new Bacon.Desc(Bacon, "constant", [value]), function(sink) {
      sink(initialEvent(value));
      sink(endEvent());
      return nop;
    });
  };

  Bacon.fromBinder = function(binder, eventTransformer) {
    if (eventTransformer == null) {
      eventTransformer = _.id;
    }
    return new EventStream(new Bacon.Desc(Bacon, "fromBinder", [binder, eventTransformer]), function(sink) {
      var shouldUnbind, unbind, unbinder, unbound;
      unbound = false;
      shouldUnbind = false;
      unbind = function() {
        if (!unbound) {
          if (typeof unbinder !== "undefined" && unbinder !== null) {
            unbinder();
            return unbound = true;
          } else {
            return shouldUnbind = true;
          }
        }
      };
      unbinder = binder(function() {
        var args, event, j, len1, reply, value;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        value = eventTransformer.apply(this, args);
        if (!(isArray(value) && _.last(value) instanceof Event)) {
          value = [value];
        }
        reply = Bacon.more;
        for (j = 0, len1 = value.length; j < len1; j++) {
          event = value[j];
          reply = sink(event = toEvent(event));
          if (reply === Bacon.noMore || event.isEnd()) {
            unbind();
            return reply;
          }
        }
        return reply;
      });
      if (shouldUnbind) {
        unbind();
      }
      return unbind;
    });
  };

  eventMethods = [["addEventListener", "removeEventListener"], ["addListener", "removeListener"], ["on", "off"], ["bind", "unbind"]];

  findHandlerMethods = function(target) {
    var j, len1, methodPair, pair;
    for (j = 0, len1 = eventMethods.length; j < len1; j++) {
      pair = eventMethods[j];
      methodPair = [target[pair[0]], target[pair[1]]];
      if (methodPair[0] && methodPair[1]) {
        return methodPair;
      }
    }
    throw new Error("No suitable event methods in " + target);
  };

  Bacon.fromEventTarget = function(target, eventName, eventTransformer) {
    var ref, sub, unsub;
    ref = findHandlerMethods(target), sub = ref[0], unsub = ref[1];
    return withDesc(new Bacon.Desc(Bacon, "fromEvent", [target, eventName]), Bacon.fromBinder(function(handler) {
      sub.call(target, eventName, handler);
      return function() {
        return unsub.call(target, eventName, handler);
      };
    }, eventTransformer));
  };

  Bacon.fromEvent = Bacon.fromEventTarget;

  Bacon.Observable.prototype.map = function() {
    var args, p;
    p = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return convertArgsToFunction(this, p, args, function(f) {
      return withDesc(new Bacon.Desc(this, "map", [f]), this.withHandler(function(event) {
        return this.push(event.fmap(f));
      }));
    });
  };

  Bacon.combineAsArray = function() {
    var index, j, len1, s, sources, stream, streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (streams.length === 1 && isArray(streams[0])) {
      streams = streams[0];
    }
    for (index = j = 0, len1 = streams.length; j < len1; index = ++j) {
      stream = streams[index];
      if (!(isObservable(stream))) {
        streams[index] = Bacon.constant(stream);
      }
    }
    if (streams.length) {
      sources = (function() {
        var k, len2, results;
        results = [];
        for (k = 0, len2 = streams.length; k < len2; k++) {
          s = streams[k];
          results.push(new Source(s, true));
        }
        return results;
      })();
      return withDesc(new Bacon.Desc(Bacon, "combineAsArray", streams), Bacon.when(sources, (function() {
        var xs;
        xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return xs;
      })).toProperty());
    } else {
      return Bacon.constant([]);
    }
  };

  Bacon.onValues = function() {
    var f, j, streams;
    streams = 2 <= arguments.length ? slice.call(arguments, 0, j = arguments.length - 1) : (j = 0, []), f = arguments[j++];
    return Bacon.combineAsArray(streams).onValues(f);
  };

  Bacon.combineWith = function() {
    var f, streams;
    f = arguments[0], streams = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return withDesc(new Bacon.Desc(Bacon, "combineWith", [f].concat(slice.call(streams))), Bacon.combineAsArray(streams).map(function(values) {
      return f.apply(null, values);
    }));
  };

  Bacon.combineTemplate = function(template) {
    var applyStreamValue, combinator, compile, compileTemplate, constantValue, current, funcs, mkContext, setValue, streams;
    funcs = [];
    streams = [];
    current = function(ctxStack) {
      return ctxStack[ctxStack.length - 1];
    };
    setValue = function(ctxStack, key, value) {
      return current(ctxStack)[key] = value;
    };
    applyStreamValue = function(key, index) {
      return function(ctxStack, values) {
        return setValue(ctxStack, key, values[index]);
      };
    };
    constantValue = function(key, value) {
      return function(ctxStack) {
        return setValue(ctxStack, key, value);
      };
    };
    mkContext = function(template) {
      if (isArray(template)) {
        return [];
      } else {
        return {};
      }
    };
    compile = function(key, value) {
      var popContext, pushContext;
      if (isObservable(value)) {
        streams.push(value);
        return funcs.push(applyStreamValue(key, streams.length - 1));
      } else if (value === Object(value) && typeof value !== "function" && !(value instanceof RegExp) && !(value instanceof Date)) {
        pushContext = function(key) {
          return function(ctxStack) {
            var newContext;
            newContext = mkContext(value);
            setValue(ctxStack, key, newContext);
            return ctxStack.push(newContext);
          };
        };
        popContext = function(ctxStack) {
          return ctxStack.pop();
        };
        funcs.push(pushContext(key));
        compileTemplate(value);
        return funcs.push(popContext);
      } else {
        return funcs.push(constantValue(key, value));
      }
    };
    compileTemplate = function(template) {
      return _.each(template, compile);
    };
    compileTemplate(template);
    combinator = function(values) {
      var ctxStack, f, j, len1, rootContext;
      rootContext = mkContext(template);
      ctxStack = [rootContext];
      for (j = 0, len1 = funcs.length; j < len1; j++) {
        f = funcs[j];
        f(ctxStack, values);
      }
      return rootContext;
    };
    return withDesc(new Bacon.Desc(Bacon, "combineTemplate", [template]), Bacon.combineAsArray(streams).map(combinator));
  };

  Bacon.Observable.prototype.combine = function(other, f) {
    var combinator;
    combinator = toCombinator(f);
    return withDesc(new Bacon.Desc(this, "combine", [other, f]), Bacon.combineAsArray(this, other).map(function(values) {
      return combinator(values[0], values[1]);
    }));
  };

  Bacon.Observable.prototype.decode = function(cases) {
    return withDesc(new Bacon.Desc(this, "decode", [cases]), this.combine(Bacon.combineTemplate(cases), function(key, values) {
      return values[key];
    }));
  };

  Bacon.Observable.prototype.withStateMachine = function(initState, f) {
    var state;
    state = initState;
    return withDesc(new Bacon.Desc(this, "withStateMachine", [initState, f]), this.withHandler(function(event) {
      var fromF, j, len1, newState, output, outputs, reply;
      fromF = f(state, event);
      newState = fromF[0], outputs = fromF[1];
      state = newState;
      reply = Bacon.more;
      for (j = 0, len1 = outputs.length; j < len1; j++) {
        output = outputs[j];
        reply = this.push(output);
        if (reply === Bacon.noMore) {
          return reply;
        }
      }
      return reply;
    }));
  };

  Bacon.Observable.prototype.skipDuplicates = function(isEqual) {
    if (isEqual == null) {
      isEqual = function(a, b) {
        return a === b;
      };
    }
    return withDesc(new Bacon.Desc(this, "skipDuplicates", []), this.withStateMachine(None, function(prev, event) {
      if (!event.hasValue()) {
        return [prev, [event]];
      } else if (event.isInitial() || prev === None || !isEqual(prev.get(), event.value())) {
        return [new Some(event.value()), [event]];
      } else {
        return [prev, []];
      }
    }));
  };

  Bacon.Observable.prototype.awaiting = function(other) {
    return withDesc(new Bacon.Desc(this, "awaiting", [other]), Bacon.groupSimultaneous(this, other).map(function(arg) {
      var myValues, otherValues;
      myValues = arg[0], otherValues = arg[1];
      return otherValues.length === 0;
    }).toProperty(false).skipDuplicates());
  };

  Bacon.Observable.prototype.not = function() {
    return withDesc(new Bacon.Desc(this, "not", []), this.map(function(x) {
      return !x;
    }));
  };

  Bacon.Property.prototype.and = function(other) {
    return withDesc(new Bacon.Desc(this, "and", [other]), this.combine(other, function(x, y) {
      return x && y;
    }));
  };

  Bacon.Property.prototype.or = function(other) {
    return withDesc(new Bacon.Desc(this, "or", [other]), this.combine(other, function(x, y) {
      return x || y;
    }));
  };

  Bacon.scheduler = {
    setTimeout: function(f, d) {
      return setTimeout(f, d);
    },
    setInterval: function(f, i) {
      return setInterval(f, i);
    },
    clearInterval: function(id) {
      return clearInterval(id);
    },
    clearTimeout: function(id) {
      return clearTimeout(id);
    },
    now: function() {
      return new Date().getTime();
    }
  };

  Bacon.EventStream.prototype.bufferWithTime = function(delay) {
    return withDesc(new Bacon.Desc(this, "bufferWithTime", [delay]), this.bufferWithTimeOrCount(delay, Number.MAX_VALUE));
  };

  Bacon.EventStream.prototype.bufferWithCount = function(count) {
    return withDesc(new Bacon.Desc(this, "bufferWithCount", [count]), this.bufferWithTimeOrCount(void 0, count));
  };

  Bacon.EventStream.prototype.bufferWithTimeOrCount = function(delay, count) {
    var flushOrSchedule;
    flushOrSchedule = function(buffer) {
      if (buffer.values.length === count) {
        return buffer.flush();
      } else if (delay !== void 0) {
        return buffer.schedule();
      }
    };
    return withDesc(new Bacon.Desc(this, "bufferWithTimeOrCount", [delay, count]), this.buffer(delay, flushOrSchedule, flushOrSchedule));
  };

  Bacon.EventStream.prototype.buffer = function(delay, onInput, onFlush) {
    var buffer, delayMs, reply;
    if (onInput == null) {
      onInput = nop;
    }
    if (onFlush == null) {
      onFlush = nop;
    }
    buffer = {
      scheduled: null,
      end: void 0,
      values: [],
      flush: function() {
        var reply;
        if (this.scheduled) {
          Bacon.scheduler.clearTimeout(this.scheduled);
          this.scheduled = null;
        }
        if (this.values.length > 0) {
          reply = this.push(nextEvent(this.values));
          this.values = [];
          if (this.end != null) {
            return this.push(this.end);
          } else if (reply !== Bacon.noMore) {
            return onFlush(this);
          }
        } else {
          if (this.end != null) {
            return this.push(this.end);
          }
        }
      },
      schedule: function() {
        if (!this.scheduled) {
          return this.scheduled = delay((function(_this) {
            return function() {
              return _this.flush();
            };
          })(this));
        }
      }
    };
    reply = Bacon.more;
    if (!_.isFunction(delay)) {
      delayMs = delay;
      delay = function(f) {
        return Bacon.scheduler.setTimeout(f, delayMs);
      };
    }
    return withDesc(new Bacon.Desc(this, "buffer", []), this.withHandler(function(event) {
      buffer.push = (function(_this) {
        return function(event) {
          return _this.push(event);
        };
      })(this);
      if (event.isError()) {
        reply = this.push(event);
      } else if (event.isEnd()) {
        buffer.end = event;
        if (!buffer.scheduled) {
          buffer.flush();
        }
      } else {
        buffer.values.push(event.value());
        onInput(buffer);
      }
      return reply;
    }));
  };

  Bacon.Observable.prototype.filter = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    assertObservableIsProperty(f);
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "filter", [f]), this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          return Bacon.more;
        }
      }));
    });
  };

  Bacon.once = function(value) {
    return new EventStream(new Desc(Bacon, "once", [value]), function(sink) {
      sink(toEvent(value));
      sink(endEvent());
      return nop;
    });
  };

  Bacon.EventStream.prototype.concat = function(right) {
    var left;
    left = this;
    return new EventStream(new Bacon.Desc(left, "concat", [right]), function(sink) {
      var unsubLeft, unsubRight;
      unsubRight = nop;
      unsubLeft = left.dispatcher.subscribe(function(e) {
        if (e.isEnd()) {
          return unsubRight = right.dispatcher.subscribe(sink);
        } else {
          return sink(e);
        }
      });
      return function() {
        unsubLeft();
        return unsubRight();
      };
    });
  };

  Bacon.Observable.prototype.flatMap = function() {
    return flatMap_(this, makeSpawner(arguments));
  };

  Bacon.Observable.prototype.flatMapFirst = function() {
    return flatMap_(this, makeSpawner(arguments), true);
  };

  flatMap_ = function(root, f, firstOnly, limit) {
    var childDeps, result, rootDep;
    rootDep = [root];
    childDeps = [];
    result = new EventStream(new Bacon.Desc(root, "flatMap" + (firstOnly ? "First" : ""), [f]), function(sink) {
      var checkEnd, checkQueue, composite, queue, spawn;
      composite = new CompositeUnsubscribe();
      queue = [];
      spawn = function(event) {
        var child;
        child = makeObservable(f(event.value()));
        childDeps.push(child);
        return composite.add(function(unsubAll, unsubMe) {
          return child.dispatcher.subscribe(function(event) {
            var reply;
            if (event.isEnd()) {
              _.remove(child, childDeps);
              checkQueue();
              checkEnd(unsubMe);
              return Bacon.noMore;
            } else {
              if (event instanceof Initial) {
                event = event.toNext();
              }
              reply = sink(event);
              if (reply === Bacon.noMore) {
                unsubAll();
              }
              return reply;
            }
          });
        });
      };
      checkQueue = function() {
        var event;
        event = queue.shift();
        if (event) {
          return spawn(event);
        }
      };
      checkEnd = function(unsub) {
        unsub();
        if (composite.empty()) {
          return sink(endEvent());
        }
      };
      composite.add(function(__, unsubRoot) {
        return root.dispatcher.subscribe(function(event) {
          if (event.isEnd()) {
            return checkEnd(unsubRoot);
          } else if (event.isError()) {
            return sink(event);
          } else if (firstOnly && composite.count() > 1) {
            return Bacon.more;
          } else {
            if (composite.unsubscribed) {
              return Bacon.noMore;
            }
            if (limit && composite.count() > limit) {
              return queue.push(event);
            } else {
              return spawn(event);
            }
          }
        });
      });
      return composite.unsubscribe;
    });
    result.internalDeps = function() {
      if (childDeps.length) {
        return rootDep.concat(childDeps);
      } else {
        return rootDep;
      }
    };
    return result;
  };

  makeSpawner = function(args) {
    if (args.length === 1 && isObservable(args[0])) {
      return _.always(args[0]);
    } else {
      return makeFunctionArgs(args);
    }
  };

  makeObservable = function(x) {
    if (isObservable(x)) {
      return x;
    } else {
      return Bacon.once(x);
    }
  };

  Bacon.Observable.prototype.flatMapWithConcurrencyLimit = function() {
    var args, limit;
    limit = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return withDesc(new Bacon.Desc(this, "flatMapWithConcurrencyLimit", [limit].concat(slice.call(args))), flatMap_(this, makeSpawner(args), false, limit));
  };

  Bacon.Observable.prototype.flatMapConcat = function() {
    return withDesc(new Bacon.Desc(this, "flatMapConcat", Array.prototype.slice.call(arguments, 0)), this.flatMapWithConcurrencyLimit.apply(this, [1].concat(slice.call(arguments))));
  };

  Bacon.later = function(delay, value) {
    return withDesc(new Bacon.Desc(Bacon, "later", [delay, value]), Bacon.fromBinder(function(sink) {
      var id, sender;
      sender = function() {
        return sink([value, endEvent()]);
      };
      id = Bacon.scheduler.setTimeout(sender, delay);
      return function() {
        return Bacon.scheduler.clearTimeout(id);
      };
    }));
  };

  Bacon.Observable.prototype.bufferingThrottle = function(minimumInterval) {
    return withDesc(new Bacon.Desc(this, "bufferingThrottle", [minimumInterval]), this.flatMapConcat(function(x) {
      return Bacon.once(x).concat(Bacon.later(minimumInterval).filter(false));
    }));
  };

  Bacon.Property.prototype.bufferingThrottle = function() {
    return Bacon.Observable.prototype.bufferingThrottle.apply(this, arguments).toProperty();
  };

  Bus = (function(superClass) {
    extend(Bus, superClass);

    function Bus() {
      this.guardedSink = bind(this.guardedSink, this);
      this.subscribeAll = bind(this.subscribeAll, this);
      this.unsubAll = bind(this.unsubAll, this);
      this.sink = void 0;
      this.subscriptions = [];
      this.ended = false;
      Bus.__super__.constructor.call(this, new Bacon.Desc(Bacon, "Bus", []), this.subscribeAll);
    }

    Bus.prototype.unsubAll = function() {
      var j, len1, ref, sub;
      ref = this.subscriptions;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        sub = ref[j];
        if (typeof sub.unsub === "function") {
          sub.unsub();
        }
      }
      return void 0;
    };

    Bus.prototype.subscribeAll = function(newSink) {
      var j, len1, ref, subscription;
      if (this.ended) {
        newSink(endEvent());
      } else {
        this.sink = newSink;
        ref = cloneArray(this.subscriptions);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          subscription = ref[j];
          this.subscribeInput(subscription);
        }
      }
      return this.unsubAll;
    };

    Bus.prototype.guardedSink = function(input) {
      return (function(_this) {
        return function(event) {
          if (event.isEnd()) {
            _this.unsubscribeInput(input);
            return Bacon.noMore;
          } else {
            return _this.sink(event);
          }
        };
      })(this);
    };

    Bus.prototype.subscribeInput = function(subscription) {
      return subscription.unsub = subscription.input.dispatcher.subscribe(this.guardedSink(subscription.input));
    };

    Bus.prototype.unsubscribeInput = function(input) {
      var i, j, len1, ref, sub;
      ref = this.subscriptions;
      for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
        sub = ref[i];
        if (sub.input === input) {
          if (typeof sub.unsub === "function") {
            sub.unsub();
          }
          this.subscriptions.splice(i, 1);
          return;
        }
      }
    };

    Bus.prototype.plug = function(input) {
      var sub;
      assertObservable(input);
      if (this.ended) {
        return;
      }
      sub = {
        input: input
      };
      this.subscriptions.push(sub);
      if ((this.sink != null)) {
        this.subscribeInput(sub);
      }
      return (function(_this) {
        return function() {
          return _this.unsubscribeInput(input);
        };
      })(this);
    };

    Bus.prototype.end = function() {
      this.ended = true;
      this.unsubAll();
      return typeof this.sink === "function" ? this.sink(endEvent()) : void 0;
    };

    Bus.prototype.push = function(value) {
      if (!this.ended) {
        return typeof this.sink === "function" ? this.sink(nextEvent(value)) : void 0;
      }
    };

    Bus.prototype.error = function(error) {
      return typeof this.sink === "function" ? this.sink(new Error(error)) : void 0;
    };

    return Bus;

  })(EventStream);

  Bacon.Bus = Bus;

  liftCallback = function(desc, wrapped) {
    return withMethodCallSupport(function() {
      var args, f, stream;
      f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      stream = partiallyApplied(wrapped, [
        function(values, callback) {
          return f.apply(null, slice.call(values).concat([callback]));
        }
      ]);
      return withDesc(new Bacon.Desc(Bacon, desc, [f].concat(slice.call(args))), Bacon.combineAsArray(args).flatMap(stream));
    });
  };

  Bacon.fromCallback = liftCallback("fromCallback", function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return Bacon.fromBinder(function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    }, (function(value) {
      return [value, endEvent()];
    }));
  });

  Bacon.fromNodeCallback = liftCallback("fromNodeCallback", function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return Bacon.fromBinder(function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    }, function(error, value) {
      if (error) {
        return [new Error(error), endEvent()];
      }
      return [value, endEvent()];
    });
  });

  addPropertyInitValueToStream = function(property, stream) {
    var justInitValue;
    justInitValue = new EventStream(describe(property, "justInitValue"), function(sink) {
      var unsub, value;
      value = void 0;
      unsub = property.dispatcher.subscribe(function(event) {
        if (!event.isEnd()) {
          value = event;
        }
        return Bacon.noMore;
      });
      UpdateBarrier.whenDoneWith(justInitValue, function() {
        if (value != null) {
          sink(value);
        }
        return sink(endEvent());
      });
      return unsub;
    });
    return justInitValue.concat(stream).toProperty();
  };

  Bacon.Observable.prototype.mapEnd = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "mapEnd", [f]), this.withHandler(function(event) {
      if (event.isEnd()) {
        this.push(nextEvent(f(event)));
        this.push(endEvent());
        return Bacon.noMore;
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.Observable.prototype.skipErrors = function() {
    return withDesc(new Bacon.Desc(this, "skipErrors", []), this.withHandler(function(event) {
      if (event.isError()) {
        return Bacon.more;
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.EventStream.prototype.takeUntil = function(stopper) {
    var endMarker;
    endMarker = {};
    return withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), Bacon.groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors()).withHandler(function(event) {
      var data, j, len1, ref, reply, value;
      if (!event.hasValue()) {
        return this.push(event);
      } else {
        ref = event.value(), data = ref[0], stopper = ref[1];
        if (stopper.length) {
          return this.push(endEvent());
        } else {
          reply = Bacon.more;
          for (j = 0, len1 = data.length; j < len1; j++) {
            value = data[j];
            if (value === endMarker) {
              reply = this.push(endEvent());
            } else {
              reply = this.push(nextEvent(value));
            }
          }
          return reply;
        }
      }
    }));
  };

  Bacon.Property.prototype.takeUntil = function(stopper) {
    var changes;
    changes = this.changes().takeUntil(stopper);
    return withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), addPropertyInitValueToStream(this, changes));
  };

  Bacon.Observable.prototype.flatMapLatest = function() {
    var f, stream;
    f = makeSpawner(arguments);
    stream = this.toEventStream();
    return withDesc(new Bacon.Desc(this, "flatMapLatest", [f]), stream.flatMap(function(value) {
      return makeObservable(f(value)).takeUntil(stream);
    }));
  };

  Bacon.Property.prototype.delayChanges = function(desc, f) {
    return withDesc(desc, addPropertyInitValueToStream(this, f(this.changes())));
  };

  Bacon.EventStream.prototype.delay = function(delay) {
    return withDesc(new Bacon.Desc(this, "delay", [delay]), this.flatMap(function(value) {
      return Bacon.later(delay, value);
    }));
  };

  Bacon.Property.prototype.delay = function(delay) {
    return this.delayChanges(new Bacon.Desc(this, "delay", [delay]), function(changes) {
      return changes.delay(delay);
    });
  };

  Bacon.EventStream.prototype.debounce = function(delay) {
    return withDesc(new Bacon.Desc(this, "debounce", [delay]), this.flatMapLatest(function(value) {
      return Bacon.later(delay, value);
    }));
  };

  Bacon.Property.prototype.debounce = function(delay) {
    return this.delayChanges(new Bacon.Desc(this, "debounce", [delay]), function(changes) {
      return changes.debounce(delay);
    });
  };

  Bacon.EventStream.prototype.debounceImmediate = function(delay) {
    return withDesc(new Bacon.Desc(this, "debounceImmediate", [delay]), this.flatMapFirst(function(value) {
      return Bacon.once(value).concat(Bacon.later(delay).filter(false));
    }));
  };

  Bacon.Observable.prototype.scan = function(seed, f) {
    var acc, resultProperty, subscribe;
    f = toCombinator(f);
    acc = toOption(seed);
    subscribe = (function(_this) {
      return function(sink) {
        var initSent, reply, sendInit, unsub;
        initSent = false;
        unsub = nop;
        reply = Bacon.more;
        sendInit = function() {
          if (!initSent) {
            return acc.forEach(function(value) {
              initSent = true;
              reply = sink(new Initial(function() {
                return value;
              }));
              if (reply === Bacon.noMore) {
                unsub();
                return unsub = nop;
              }
            });
          }
        };
        unsub = _this.dispatcher.subscribe(function(event) {
          var next, prev;
          if (event.hasValue()) {
            if (initSent && event.isInitial()) {
              return Bacon.more;
            } else {
              if (!event.isInitial()) {
                sendInit();
              }
              initSent = true;
              prev = acc.getOrElse(void 0);
              next = f(prev, event.value());
              acc = new Some(next);
              return sink(event.apply(function() {
                return next;
              }));
            }
          } else {
            if (event.isEnd()) {
              reply = sendInit();
            }
            if (reply !== Bacon.noMore) {
              return sink(event);
            }
          }
        });
        UpdateBarrier.whenDoneWith(resultProperty, sendInit);
        return unsub;
      };
    })(this);
    return resultProperty = new Property(new Bacon.Desc(this, "scan", [seed, f]), subscribe);
  };

  Bacon.Observable.prototype.diff = function(start, f) {
    f = toCombinator(f);
    return withDesc(new Bacon.Desc(this, "diff", [start, f]), this.scan([start], function(prevTuple, next) {
      return [next, f(prevTuple[0], next)];
    }).filter(function(tuple) {
      return tuple.length === 2;
    }).map(function(tuple) {
      return tuple[1];
    }));
  };

  Bacon.Observable.prototype.doAction = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "doAction", [f]), this.withHandler(function(event) {
      if (event.hasValue()) {
        f(event.value());
      }
      return this.push(event);
    }));
  };

  Bacon.Observable.prototype.doError = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "doError", [f]), this.withHandler(function(event) {
      if (event.isError()) {
        f(event.error);
      }
      return this.push(event);
    }));
  };

  Bacon.Observable.prototype.doLog = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return withDesc(new Bacon.Desc(this, "doLog", args), this.withHandler(function(event) {
      if (typeof console !== "undefined" && console !== null) {
        if (typeof console.log === "function") {
          console.log.apply(console, slice.call(args).concat([event.log()]));
        }
      }
      return this.push(event);
    }));
  };

  Bacon.Observable.prototype.endOnError = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (f == null) {
      f = true;
    }
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "endOnError", []), this.withHandler(function(event) {
        if (event.isError() && f(event.error)) {
          this.push(event);
          return this.push(endEvent());
        } else {
          return this.push(event);
        }
      }));
    });
  };

  Observable.prototype.errors = function() {
    return withDesc(new Bacon.Desc(this, "errors", []), this.filter(function() {
      return false;
    }));
  };

  valueAndEnd = (function(value) {
    return [value, endEvent()];
  });

  Bacon.fromPromise = function(promise, abort, eventTransformer) {
    if (eventTransformer == null) {
      eventTransformer = valueAndEnd;
    }
    return withDesc(new Bacon.Desc(Bacon, "fromPromise", [promise]), Bacon.fromBinder(function(handler) {
      var ref;
      if ((ref = promise.then(handler, function(e) {
        return handler(new Error(e));
      })) != null) {
        if (typeof ref.done === "function") {
          ref.done();
        }
      }
      return function() {
        if (abort) {
          return typeof promise.abort === "function" ? promise.abort() : void 0;
        }
      };
    }, eventTransformer));
  };

  Bacon.Observable.prototype.mapError = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "mapError", [f]), this.withHandler(function(event) {
      if (event.isError()) {
        return this.push(nextEvent(f(event.error)));
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.Observable.prototype.flatMapError = function(fn) {
    return withDesc(new Bacon.Desc(this, "flatMapError", [fn]), this.mapError(function(err) {
      return new Error(err);
    }).flatMap(function(x) {
      if (x instanceof Error) {
        return fn(x.error);
      } else {
        return Bacon.once(x);
      }
    }));
  };

  Bacon.EventStream.prototype.sampledBy = function(sampler, combinator) {
    return withDesc(new Bacon.Desc(this, "sampledBy", [sampler, combinator]), this.toProperty().sampledBy(sampler, combinator));
  };

  Bacon.Property.prototype.sampledBy = function(sampler, combinator) {
    var lazy, result, samplerSource, stream, thisSource;
    if (combinator != null) {
      combinator = toCombinator(combinator);
    } else {
      lazy = true;
      combinator = function(f) {
        return f.value();
      };
    }
    thisSource = new Source(this, false, lazy);
    samplerSource = new Source(sampler, true, lazy);
    stream = Bacon.when([thisSource, samplerSource], combinator);
    result = sampler instanceof Property ? stream.toProperty() : stream;
    return withDesc(new Bacon.Desc(this, "sampledBy", [sampler, combinator]), result);
  };

  Bacon.Property.prototype.sample = function(interval) {
    return withDesc(new Bacon.Desc(this, "sample", [interval]), this.sampledBy(Bacon.interval(interval, {})));
  };

  Bacon.Observable.prototype.map = function() {
    var args, p;
    p = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (p instanceof Property) {
      return p.sampledBy(this, former);
    } else {
      return convertArgsToFunction(this, p, args, function(f) {
        return withDesc(new Bacon.Desc(this, "map", [f]), this.withHandler(function(event) {
          return this.push(event.fmap(f));
        }));
      });
    }
  };

  Bacon.Observable.prototype.fold = function(seed, f) {
    return withDesc(new Bacon.Desc(this, "fold", [seed, f]), this.scan(seed, f).sampledBy(this.filter(false).mapEnd().toProperty()));
  };

  Observable.prototype.reduce = Observable.prototype.fold;

  Bacon.fromPoll = function(delay, poll) {
    return withDesc(new Bacon.Desc(Bacon, "fromPoll", [delay, poll]), Bacon.fromBinder((function(handler) {
      var id;
      id = Bacon.scheduler.setInterval(handler, delay);
      return function() {
        return Bacon.scheduler.clearInterval(id);
      };
    }), poll));
  };

  Bacon.fromArray = function(values) {
    var i;
    assertArray(values);
    if (!values.length) {
      return withDesc(new Bacon.Desc(Bacon, "fromArray", values), Bacon.never());
    } else {
      i = 0;
      return new EventStream(new Bacon.Desc(Bacon, "fromArray", [values]), function(sink) {
        var push, pushNeeded, pushing, reply, unsubd;
        unsubd = false;
        reply = Bacon.more;
        pushing = false;
        pushNeeded = false;
        push = function() {
          var value;
          pushNeeded = true;
          if (pushing) {
            return;
          }
          pushing = true;
          while (pushNeeded) {
            pushNeeded = false;
            if ((reply !== Bacon.noMore) && !unsubd) {
              value = values[i++];
              reply = sink(toEvent(value));
              if (reply !== Bacon.noMore) {
                if (i === values.length) {
                  sink(endEvent());
                } else {
                  UpdateBarrier.afterTransaction(push);
                }
              }
            }
          }
          return pushing = false;
        };
        push();
        return function() {
          return unsubd = true;
        };
      });
    }
  };

  Bacon.EventStream.prototype.holdWhen = function(valve) {
    var bufferedValues, composite, onHold, src, subscribed;
    composite = new CompositeUnsubscribe();
    onHold = false;
    bufferedValues = [];
    subscribed = false;
    src = this;
    return new EventStream(new Bacon.Desc(this, "holdWhen", [valve]), function(sink) {
      var endIfBothEnded;
      endIfBothEnded = function(unsub) {
        if (typeof unsub === "function") {
          unsub();
        }
        if (composite.empty() && subscribed) {
          return sink(endEvent());
        }
      };
      composite.add(function(unsubAll, unsubMe) {
        return valve.subscribeInternal(function(event) {
          var j, len1, results, toSend, value;
          if (event.hasValue()) {
            onHold = event.value();
            if (!onHold) {
              toSend = bufferedValues;
              bufferedValues = [];
              results = [];
              for (j = 0, len1 = toSend.length; j < len1; j++) {
                value = toSend[j];
                results.push(sink(nextEvent(value)));
              }
              return results;
            }
          } else if (event.isEnd()) {
            return endIfBothEnded(unsubMe);
          } else {
            return sink(event);
          }
        });
      });
      composite.add(function(unsubAll, unsubMe) {
        return src.subscribeInternal(function(event) {
          if (onHold && event.hasValue()) {
            return bufferedValues.push(event.value());
          } else if (event.isEnd() && bufferedValues.length) {
            return endIfBothEnded(unsubMe);
          } else {
            return sink(event);
          }
        });
      });
      subscribed = true;
      endIfBothEnded();
      return composite.unsubscribe;
    });
  };

  Bacon.interval = function(delay, value) {
    if (value == null) {
      value = {};
    }
    return withDesc(new Bacon.Desc(Bacon, "interval", [delay, value]), Bacon.fromPoll(delay, function() {
      return nextEvent(value);
    }));
  };

  Bacon.$ = {};

  Bacon.$.asEventStream = function(eventName, selector, eventTransformer) {
    var ref;
    if (_.isFunction(selector)) {
      ref = [selector, void 0], eventTransformer = ref[0], selector = ref[1];
    }
    return withDesc(new Bacon.Desc(this.selector || this, "asEventStream", [eventName]), Bacon.fromBinder((function(_this) {
      return function(handler) {
        _this.on(eventName, selector, handler);
        return function() {
          return _this.off(eventName, selector, handler);
        };
      };
    })(this), eventTransformer));
  };

  if ((ref = typeof jQuery !== "undefined" && jQuery !== null ? jQuery : typeof Zepto !== "undefined" && Zepto !== null ? Zepto : void 0) != null) {
    ref.fn.asEventStream = Bacon.$.asEventStream;
  }

  Bacon.Observable.prototype.log = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.subscribe(function(event) {
      return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log.apply(console, slice.call(args).concat([event.log()])) : void 0 : void 0;
    });
    return this;
  };

  Bacon.EventStream.prototype.merge = function(right) {
    var left;
    assertEventStream(right);
    left = this;
    return withDesc(new Bacon.Desc(left, "merge", [right]), Bacon.mergeAll(this, right));
  };

  Bacon.mergeAll = function() {
    var streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (isArray(streams[0])) {
      streams = streams[0];
    }
    if (streams.length) {
      return new EventStream(new Bacon.Desc(Bacon, "mergeAll", streams), function(sink) {
        var ends, sinks, smartSink;
        ends = 0;
        smartSink = function(obs) {
          return function(unsubBoth) {
            return obs.dispatcher.subscribe(function(event) {
              var reply;
              if (event.isEnd()) {
                ends++;
                if (ends === streams.length) {
                  return sink(endEvent());
                } else {
                  return Bacon.more;
                }
              } else {
                reply = sink(event);
                if (reply === Bacon.noMore) {
                  unsubBoth();
                }
                return reply;
              }
            });
          };
        };
        sinks = _.map(smartSink, streams);
        return new Bacon.CompositeUnsubscribe(sinks).unsubscribe;
      });
    } else {
      return Bacon.never();
    }
  };

  Bacon.repeatedly = function(delay, values) {
    var index;
    index = 0;
    return withDesc(new Bacon.Desc(Bacon, "repeatedly", [delay, values]), Bacon.fromPoll(delay, function() {
      return values[index++ % values.length];
    }));
  };

  Bacon.repeat = function(generator) {
    var index;
    index = 0;
    return Bacon.fromBinder(function(sink) {
      var flag, handleEvent, reply, subscribeNext, unsub;
      flag = false;
      reply = Bacon.more;
      unsub = function() {};
      handleEvent = function(event) {
        if (event.isEnd()) {
          if (!flag) {
            return flag = true;
          } else {
            return subscribeNext();
          }
        } else {
          return reply = sink(event);
        }
      };
      subscribeNext = function() {
        var next;
        flag = true;
        while (flag && reply !== Bacon.noMore) {
          next = generator(index++);
          flag = false;
          if (next) {
            unsub = next.subscribeInternal(handleEvent);
          } else {
            sink(endEvent());
          }
        }
        return flag = true;
      };
      subscribeNext();
      return function() {
        return unsub();
      };
    });
  };

  Bacon.retry = function(options) {
    var delay, error, finished, isRetryable, maxRetries, retries, source;
    if (!_.isFunction(options.source)) {
      throw new Exception("'source' option has to be a function");
    }
    source = options.source;
    retries = options.retries || 0;
    maxRetries = options.maxRetries || retries;
    delay = options.delay || function() {
      return 0;
    };
    isRetryable = options.isRetryable || function() {
      return true;
    };
    finished = false;
    error = null;
    return withDesc(new Bacon.Desc(Bacon, "retry", [options]), Bacon.repeat(function() {
      var context, pause, valueStream;
      if (finished) {
        return null;
      } else {
        valueStream = function() {
          return source().endOnError().withHandler(function(event) {
            if (event.isError()) {
              error = event;
              if (isRetryable(error.error) && retries > 0) {

              } else {
                finished = true;
                return this.push(event);
              }
            } else {
              if (event.hasValue()) {
                error = null;
                finished = true;
              }
              return this.push(event);
            }
          });
        };
        if (error) {
          context = {
            error: error.error,
            retriesDone: maxRetries - retries
          };
          pause = Bacon.later(delay(context)).filter(false);
          retries = retries - 1;
          return pause.concat(Bacon.once().flatMap(valueStream));
        } else {
          return valueStream();
        }
      }
    }));
  };

  Bacon.sequentially = function(delay, values) {
    var index;
    index = 0;
    return withDesc(new Bacon.Desc(Bacon, "sequentially", [delay, values]), Bacon.fromPoll(delay, function() {
      var value;
      value = values[index++];
      if (index < values.length) {
        return value;
      } else if (index === values.length) {
        return [value, endEvent()];
      } else {
        return endEvent();
      }
    }));
  };

  Bacon.Observable.prototype.skip = function(count) {
    return withDesc(new Bacon.Desc(this, "skip", [count]), this.withHandler(function(event) {
      if (!event.hasValue()) {
        return this.push(event);
      } else if (count > 0) {
        count--;
        return Bacon.more;
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.Observable.prototype.take = function(count) {
    if (count <= 0) {
      return Bacon.never();
    }
    return withDesc(new Bacon.Desc(this, "take", [count]), this.withHandler(function(event) {
      if (!event.hasValue()) {
        return this.push(event);
      } else {
        count--;
        if (count > 0) {
          return this.push(event);
        } else {
          if (count === 0) {
            this.push(event);
          }
          this.push(endEvent());
          return Bacon.noMore;
        }
      }
    }));
  };

  Bacon.EventStream.prototype.skipUntil = function(starter) {
    var started;
    started = starter.take(1).map(true).toProperty(false);
    return withDesc(new Bacon.Desc(this, "skipUntil", [starter]), this.filter(started));
  };

  Bacon.EventStream.prototype.skipWhile = function() {
    var args, f, ok;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    assertObservableIsProperty(f);
    ok = false;
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "skipWhile", [f]), this.withHandler(function(event) {
        if (ok || !event.hasValue() || !f(event.value())) {
          if (event.hasValue()) {
            ok = true;
          }
          return this.push(event);
        } else {
          return Bacon.more;
        }
      }));
    });
  };

  Bacon.Observable.prototype.slidingWindow = function(n, minValues) {
    if (minValues == null) {
      minValues = 0;
    }
    return withDesc(new Bacon.Desc(this, "slidingWindow", [n, minValues]), this.scan([], (function(window, value) {
      return window.concat([value]).slice(-n);
    })).filter((function(values) {
      return values.length >= minValues;
    })));
  };

  Bacon.spy = function(spy) {
    return spys.push(spy);
  };

  spys = [];

  registerObs = function(obs) {
    var j, len1, spy;
    if (spys.length) {
      if (!registerObs.running) {
        try {
          registerObs.running = true;
          for (j = 0, len1 = spys.length; j < len1; j++) {
            spy = spys[j];
            spy(obs);
          }
        } finally {
          delete registerObs.running;
        }
      }
    }
    return void 0;
  };

  Bacon.Property.prototype.startWith = function(seed) {
    return withDesc(new Bacon.Desc(this, "startWith", [seed]), this.scan(seed, function(prev, next) {
      return next;
    }));
  };

  Bacon.EventStream.prototype.startWith = function(seed) {
    return withDesc(new Bacon.Desc(this, "startWith", [seed]), Bacon.once(seed).concat(this));
  };

  Bacon.Observable.prototype.takeWhile = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    assertObservableIsProperty(f);
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "takeWhile", [f]), this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          this.push(endEvent());
          return Bacon.noMore;
        }
      }));
    });
  };

  Bacon.update = function() {
    var i, initial, lateBindFirst, patterns;
    initial = arguments[0], patterns = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    lateBindFirst = function(f) {
      return function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return function(i) {
          return f.apply(null, [i].concat(args));
        };
      };
    };
    i = patterns.length - 1;
    while (i > 0) {
      if (!(patterns[i] instanceof Function)) {
        patterns[i] = (function(x) {
          return function() {
            return x;
          };
        })(patterns[i]);
      }
      patterns[i] = lateBindFirst(patterns[i]);
      i = i - 2;
    }
    return withDesc(new Bacon.Desc(Bacon, "update", [initial].concat(slice.call(patterns))), Bacon.when.apply(Bacon, patterns).scan(initial, (function(x, f) {
      return f(x);
    })));
  };

  Bacon.zipAsArray = function() {
    var streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (isArray(streams[0])) {
      streams = streams[0];
    }
    return withDesc(new Bacon.Desc(Bacon, "zipAsArray", streams), Bacon.zipWith(streams, function() {
      var xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return xs;
    }));
  };

  Bacon.zipWith = function() {
    var f, ref1, streams;
    f = arguments[0], streams = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (!_.isFunction(f)) {
      ref1 = [f, streams[0]], streams = ref1[0], f = ref1[1];
    }
    streams = _.map((function(s) {
      return s.toEventStream();
    }), streams);
    return withDesc(new Bacon.Desc(Bacon, "zipWith", [f].concat(slice.call(streams))), Bacon.when(streams, f));
  };

  Bacon.Observable.prototype.zip = function(other, f) {
    if (f == null) {
      f = Array;
    }
    return withDesc(new Bacon.Desc(this, "zip", [other]), Bacon.zipWith([this, other], f));
  };

  

Bacon.Observable.prototype.first = function () {
  return withDesc(new Bacon.Desc(this, "first", []), this.take(1));
};

Bacon.Observable.prototype.last = function () {
  var lastEvent;

  return withDesc(new Bacon.Desc(this, "last", []), this.withHandler(function (event) {
    if (event.isEnd()) {
      if (lastEvent) {
        this.push(lastEvent);
      }
      this.push(endEvent());
      return Bacon.noMore;
    } else {
      lastEvent = event;
    }
  }));
};

Bacon.EventStream.prototype.throttle = function (delay) {
  return withDesc(new Bacon.Desc(this, "throttle", [delay]), this.bufferWithTime(delay).map(function (values) {
    return values[values.length - 1];
  }));
};

Bacon.Property.prototype.throttle = function (delay) {
  return this.delayChanges(new Bacon.Desc(this, "throttle", [delay]), function (changes) {
    return changes.throttle(delay);
  });
};

Observable.prototype.firstToPromise = function (PromiseCtr) {
  var _this = this;

  if (typeof PromiseCtr !== "function") {
    if (typeof Promise === "function") {
      PromiseCtr = Promise;
    } else {
      throw new Exception("There isn't default Promise, use shim or parameter");
    }
  }

  return new PromiseCtr(function (resolve, reject) {
    return _this.subscribe(function (event) {
      if (event.hasValue()) {
        resolve(event.value());
      }
      if (event.isError()) {
        reject(event.error);
      }

      return Bacon.noMore;
    });
  });
};

Observable.prototype.toPromise = function (PromiseCtr) {
  return this.last().firstToPromise(PromiseCtr);
};

if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
    define([], function() {
      return Bacon;
    });
    this.Bacon = Bacon;
  } else if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    module.exports = Bacon;
    Bacon.Bacon = Bacon;
  } else {
    this.Bacon = Bacon;
  }

}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
'use strict';

var $Nav = $('#nav');

/*
 * scroll and nav placement
 */
$Nav.affix({
    offset: {
        top: $('header').height() - $Nav.height()
    }
});

$('body').scrollspy({ target: '#nav' });

$('.scroll-top').click(function () {
    $('body, html').animate({ scrollTop: 0 }, 1000);
});

},{}],3:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _baconjs = require('baconjs');

var _baconjs2 = _interopRequireDefault(_baconjs);

require('./search/');

require('./speech');

require('./animations');

var $ = window.$;

$.fn.asEventStream = _baconjs2['default'].$.asEventStream;
window.Bacon = _baconjs2['default'];

},{"./animations":2,"./search/":4,"./speech":5,"baconjs":1}],4:[function(require,module,exports){
'use strict';

var _speechJs = require('./speech.js');

var _utilsJs = require('./utils.js');

var $searchAudio = $('.js-recipe--search--audio');
var $searchTextArea = $('.js-recipe--search');
var $searchButton = $('.js-recipe--search--button');
var $searchAdvanced = $('.js-recipe--search--advanced');
var $searchOptions = $('.js-recipe--search--advanced-options');
var $searchResults = $('.js-recipe--results');

var throttleSearch = $searchTextArea.asEventStream('keyup change').map(function (ev) {
    return ev.target.value ? ev.target.value.trim().toLowerCase() : '';
}).filter(function (text) {
    return text.length > 2;
}).throttle(1000).skipDuplicates();

var searchApi = function searchApi(term) {
    var options = '';
    $searchOptions.find('input:checked').each(function (_, elm) {
        options += '&' + encodeURIComponent(elm.value);
    });

    return Bacon.fromPromise($.ajax('/api/recipes?q=' + term + options));
};

var suggestions = throttleSearch.flatMapLatest(searchApi);

var subscription = suggestions.subscribe(function (data) {
    displayResults(JSON.parse(data.value()).matches);
}, function (error) {
    displayError();
});

$searchAudio.bind('click', _speechJs.speechListener);

$searchAdvanced.bind('click', function (e) {
    return $searchOptions.toggleClass('hidden');
});

var displayResults = function displayResults(recipes) {
    var html = recipes.map(function (recipe) {
        var image = recipe.imageUrlsBySize[Object.keys(recipe.imageUrlsBySize).reduce(function (pre, curr) {
            return pre < curr ? curr : pre;
        }, 0)];
        var name = recipe.recipeName;
        var rating = recipe.rating;

        var existingIngredients = $searchTextArea.val().toLowerCase().trim().split(' ');

        var missingIngredients = [];
        recipe.ingredients.forEach(function (ingredient) {
            var _ingredient = ingredient.toLowerCase().trim();

            var shouldPush = existingIngredients.every(function (existing) {
                var largest = undefined,
                    shortest = undefined;

                if (_ingredient.length > existing.length) {
                    largest = _ingredient;
                    shortest = existing;
                } else {
                    largest = existing;
                    shortest = _ingredient;
                }

                var l = _ingredient === existing || largest.indexOf(shortest) > -1;

                return !l;
            });

            if (shouldPush) {
                missingIngredients.push(_ingredient);
            }
        });

        var missingIngredientsString = missingIngredients.map(function (ingredient) {
            return '<span class=\'label label-default\' style="display:inline-block">' + ingredient + '</span>';
        }).join('&nbsp;');

        return '<div class="js-recipe--panel col-sm-4 col-xs-6">\n            <div class="panel panel-default">\n              <div>\n                <img src="' + image.replace('s90-', 's360-') + '" class="img-responsive"></img>\n              </div>\n              <div class="panel-body">\n                <h4>' + name + '</h4>\n                <small><button class=\'btn btn-primary js-recipe--checkout\'>Buy missing ingredients</button></small>\n                <p style="margin-top:15px;">' + missingIngredientsString + '</p>\n              </div>\n            </div>\n          </div>';
    }).reduce(function (acc, span, index) {
        if (index === 0 || index === 3 || index === 6) {
            return acc + '<div class="js-recipe--row row">' + span;
        } else if (index === 2 || index === 5 || index === 8) {
            return acc + span + '</div>';
        } else if (index === recipes.length - 1) {
            return acc;
        } else {
            return acc + span;
        }
    }, '');

    $searchResults.html($(html));

    $('.js-recipe--row').each(function (_, row) {
        var $row = $(row);

        var height = undefined;
        $row.find('.js-recipe--panel').each(function (i, el) {
            var $el = $(el);
            if (!height || $el.height() > height) {
                height = $el.height();
            }
        });

        $row.find('.js-recipe--panel').each(function (i, el) {
            var $el = $(el);
            $el.find('.panel-body').css('padding-bottom', height + 50 - $el.height());
            $el.css('min-height', height + 50);
        });
    });

    $('.js-recipe--checkout').bind('click', function (event) {
        var btn = $(event.target);
        var labels = btn.parent().parent().find('.label');

        $('.js-recipe--checkout').addClass('disabled');
        btn.removeClass('disabled');

        labels.css('cursor', 'pointer');
        labels.addClass('label-info');
        labels.removeClass('label-default');
        labels.bind('click', function (_event) {
            var $label = $(_event.target);
            $label.addClass('label-warning');
            $label.removeClass('label-info');

            var item = $label.text().trim().replace('fresh', '').replace('sliced', '').trim().replace(/ /g, '+');

            var image = new Image();

            image.onload = function () {
                $label.addClass('label-success').removeClass('label-warning');
            };

            image.onerror = function () {
                $label.addClass('label-success').removeClass('label-warning');
            };

            $.get('/api/cart/add?item=' + item, function (res) {
                image.src = res.url;
                document.body.appendChild(image);
            });
        });

        btn.off('click');

        btn.bind('click', function (_event) {
            labels.off('click');

            window.open('http://berlin.bringmeister.de/checkout/cart/', '_blank');
            //
            // labels.filter( 'label-success' ).each( el =>
            // {
            //     const item = $( el ).text()
            //         .replace( 'fresh', '' )
            //         .replace( 'sliced', '' )
            //         .replace( ' ', '+' );
            //
            //     $.get('/api/cart/add?item=' + item, res =>
            //     {
            //         var element = document.createElement('img');
            //         element.src = res.url;
            //         document.body.appendChild( element );
            //     });
            // } );
        });
    });
};

var displayError = function displayError() {};

},{"./speech.js":5,"./utils.js":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _utils = require('./utils');

var $searchTextArea = $('.js-recipe--search');
var start_img = $('.js-recipe--search--audio img');

var recognition = new window.webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';
var recognizing = false;
var final_transcript = undefined;
var timer = undefined;

recognition.onstart = function () {
    recognizing = true;
    start_img.attr('src', '//www.google.com/intl/en/chrome/assets/common/images/content/mic-animate.gif');
};

recognition.onend = function () {
    recognizing = false;

    start_img.attr('src', '//www.google.com/intl/en/chrome/assets/common/images/content/mic.gif');

    if (!final_transcript) {
        return;
    }
};

recognition.onresult = function (event) {
    var interim_transcript = '';

    if (typeof event.results === 'undefined') {
        recognition.onend = null;
        recognition.stop();
        return;
    }

    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
        } else {
            interim_transcript += event.results[i][0].transcript;
        }
    }

    $searchTextArea.text((0, _utils.capitalize)(final_transcript || interim_transcript));
    $searchTextArea.trigger('change');
};

var speechListener = function speechListener(event) {
    if (recognizing) {
        recognition.stop();
        clearInterval(timer);
        return;
    }
    final_transcript = '';
    $searchTextArea.text('');

    recognition.start();
    start_img.attr('src', '//www.google.com/intl/en/chrome/assets/common/images/content/mic-slash.gif');
    startTimer();
};

exports.speechListener = speechListener;
var startTimer = function startTimer() {
    timer = setTimeout(function () {
        recognition.stop();
        clearInterval(timer);
    }, 4000);
};

},{"./utils":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var first_char = /\S/;
var capitalize = function capitalize(s) {
    return s.replace(first_char, function (m) {
        return m.toUpperCase();
    });
};

exports.capitalize = capitalize;
// http://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_two_matrix_rows
var levenshtein = function levenshtein(str_m, str_n) {
    var str_m_len = str_m.length;
    var str_n_len = str_n.length;

    if (str_m === str_n) {
        return 0;
    }

    if (str_m_len === 0) {
        return str_n_len;
    }

    if (str_n_len === 0) {
        return str_m_len;
    }

    var v0 = new Uint8Array(str_n_len + 1);
    var v1 = new Uint8Array(str_n_len + 1);

    // initialize v0 (the previous row of distances)
    // this row is A[0][i]: edit distance for an empty s
    // the distance is just the number of characters to delete from t
    for (var i = 0; i < str_n_len + 1; i++) {
        v0[i] = i;
    }

    for (var i = 0; i < str_m_len; i++) {
        // calculate v1 (current row distances) from the previous row v0

        // first element of v1 is A[i+1][0]
        //   edit distance is delete (i+1) chars from s to match empty t
        v1[0] = i + 1;

        // use formula to fill in the rest of the row
        for (var j = 0; j < str_n_len; j++) {
            var cost = str_m[i] === str_n[j] ? 0 : 1;
            v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
        }

        // copy v1 (current row) to v0 (previous row) for next iteration
        for (var j = 0; j < str_m_len + 1; j++) {
            v0[j] = v1[j];
        }
    }

    return v1[str_n_len];
};

exports.levenshtein = levenshtein;
var fuzzyMatch = function fuzzyMatch(list, query) {
    var _query = RegExp(query.replace(/ /g, '').split('').join('.*?'), 'gi');

    return list.filter(function (song) {
        return !_query.test(song.title);
    });
};
exports.fuzzyMatch = fuzzyMatch;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFjb25qcy9kaXN0L0JhY29uLmpzIiwiL0xpYnJhcnkvV2ViU2VydmVyL0RvY3VtZW50cy93YXN0ZW5vdC9zcmNfanMvYW5pbWF0aW9ucy5qcyIsIi9MaWJyYXJ5L1dlYlNlcnZlci9Eb2N1bWVudHMvd2FzdGVub3Qvc3JjX2pzL21haW4uanMiLCIvTGlicmFyeS9XZWJTZXJ2ZXIvRG9jdW1lbnRzL3dhc3Rlbm90L3NyY19qcy9zZWFyY2guanMiLCIvTGlicmFyeS9XZWJTZXJ2ZXIvRG9jdW1lbnRzL3dhc3Rlbm90L3NyY19qcy9zcGVlY2guanMiLCIvTGlicmFyeS9XZWJTZXJ2ZXIvRG9jdW1lbnRzL3dhc3Rlbm90L3NyY19qcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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SUFBSSxFQUFFLEVBQUUsQ0FBRSxDQUFDLEtBQUssQ0FBRSxFQUFFLENBQUUsQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLEVBQUUsSUFBSSxDQUFFLENBQUM7O0FBRWpGLFdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBRSxVQUFFLElBQUksRUFDMUI7QUFDSSxlQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFFLENBQUM7S0FDckMsQ0FBRSxDQUFDO0NBQ1AsQ0FBQztRQVJXLFVBQVUsR0FBVixVQUFVIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEJhY29uLCBCdWZmZXJpbmdTb3VyY2UsIEJ1cywgQ29tcG9zaXRlVW5zdWJzY3JpYmUsIENvbnN1bWluZ1NvdXJjZSwgRGVzYywgRGlzcGF0Y2hlciwgRW5kLCBFcnJvciwgRXZlbnQsIEV2ZW50U3RyZWFtLCBFeGNlcHRpb24sIEluaXRpYWwsIE5leHQsIE5vbmUsIE9ic2VydmFibGUsIFByb3BlcnR5LCBQcm9wZXJ0eURpc3BhdGNoZXIsIFNvbWUsIFNvdXJjZSwgVXBkYXRlQmFycmllciwgXywgYWRkUHJvcGVydHlJbml0VmFsdWVUb1N0cmVhbSwgYXNzZXJ0LCBhc3NlcnRBcnJheSwgYXNzZXJ0RXZlbnRTdHJlYW0sIGFzc2VydEZ1bmN0aW9uLCBhc3NlcnROb0FyZ3VtZW50cywgYXNzZXJ0T2JzZXJ2YWJsZSwgYXNzZXJ0T2JzZXJ2YWJsZUlzUHJvcGVydHksIGFzc2VydFN0cmluZywgY2xvbmVBcnJheSwgY29uc3RhbnRUb0Z1bmN0aW9uLCBjb250YWluc0R1cGxpY2F0ZURlcHMsIGNvbnZlcnRBcmdzVG9GdW5jdGlvbiwgZGVzY3JpYmUsIGVuZEV2ZW50LCBldmVudElkQ291bnRlciwgZXZlbnRNZXRob2RzLCBmaW5kRGVwcywgZmluZEhhbmRsZXJNZXRob2RzLCBmbGF0TWFwXywgZm9ybWVyLCBpZENvdW50ZXIsIGluaXRpYWxFdmVudCwgaXNBcnJheSwgaXNGaWVsZEtleSwgaXNPYnNlcnZhYmxlLCBsYXR0ZXIsIGxpZnRDYWxsYmFjaywgbWFrZUZ1bmN0aW9uLCBtYWtlRnVuY3Rpb25BcmdzLCBtYWtlRnVuY3Rpb25fLCBtYWtlT2JzZXJ2YWJsZSwgbWFrZVNwYXduZXIsIG5leHRFdmVudCwgbm9wLCBwYXJ0aWFsbHlBcHBsaWVkLCByZWN1cnNpb25EZXB0aCwgcmVmLCByZWdpc3Rlck9icywgc3B5cywgdG9Db21iaW5hdG9yLCB0b0V2ZW50LCB0b0ZpZWxkRXh0cmFjdG9yLCB0b0ZpZWxkS2V5LCB0b09wdGlvbiwgdG9TaW1wbGVFeHRyYWN0b3IsIHZhbHVlQW5kRW5kLCB3aXRoRGVzYywgd2l0aE1ldGhvZENhbGxTdXBwb3J0LFxuICAgIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eSxcbiAgICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gICAgc2xpY2UgPSBbXS5zbGljZSxcbiAgICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuICBCYWNvbiA9IHtcbiAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXCJCYWNvblwiO1xuICAgIH1cbiAgfTtcblxuICBCYWNvbi52ZXJzaW9uID0gJzAuNy42NSc7XG5cbiAgRXhjZXB0aW9uID0gKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgJiYgZ2xvYmFsICE9PSBudWxsID8gZ2xvYmFsIDogdGhpcykuRXJyb3I7XG5cbiAgbm9wID0gZnVuY3Rpb24oKSB7fTtcblxuICBsYXR0ZXIgPSBmdW5jdGlvbihfLCB4KSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG5cbiAgZm9ybWVyID0gZnVuY3Rpb24oeCwgXykge1xuICAgIHJldHVybiB4O1xuICB9O1xuXG4gIGNsb25lQXJyYXkgPSBmdW5jdGlvbih4cykge1xuICAgIHJldHVybiB4cy5zbGljZSgwKTtcbiAgfTtcblxuICBhc3NlcnQgPSBmdW5jdGlvbihtZXNzYWdlLCBjb25kaXRpb24pIHtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihtZXNzYWdlKTtcbiAgICB9XG4gIH07XG5cbiAgYXNzZXJ0T2JzZXJ2YWJsZUlzUHJvcGVydHkgPSBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggaW5zdGFuY2VvZiBPYnNlcnZhYmxlICYmICEoeCBpbnN0YW5jZW9mIFByb3BlcnR5KSkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIk9ic2VydmFibGUgaXMgbm90IGEgUHJvcGVydHkgOiBcIiArIHgpO1xuICAgIH1cbiAgfTtcblxuICBhc3NlcnRFdmVudFN0cmVhbSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKCEoZXZlbnQgaW5zdGFuY2VvZiBFdmVudFN0cmVhbSkpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJub3QgYW4gRXZlbnRTdHJlYW0gOiBcIiArIGV2ZW50KTtcbiAgICB9XG4gIH07XG5cbiAgYXNzZXJ0T2JzZXJ2YWJsZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKCEoZXZlbnQgaW5zdGFuY2VvZiBPYnNlcnZhYmxlKSkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIm5vdCBhbiBPYnNlcnZhYmxlIDogXCIgKyBldmVudCk7XG4gICAgfVxuICB9O1xuXG4gIGFzc2VydEZ1bmN0aW9uID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBhc3NlcnQoXCJub3QgYSBmdW5jdGlvbiA6IFwiICsgZiwgXy5pc0Z1bmN0aW9uKGYpKTtcbiAgfTtcblxuICBpc0FycmF5ID0gZnVuY3Rpb24oeHMpIHtcbiAgICByZXR1cm4geHMgaW5zdGFuY2VvZiBBcnJheTtcbiAgfTtcblxuICBpc09ic2VydmFibGUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHggaW5zdGFuY2VvZiBPYnNlcnZhYmxlO1xuICB9O1xuXG4gIGFzc2VydEFycmF5ID0gZnVuY3Rpb24oeHMpIHtcbiAgICBpZiAoIWlzQXJyYXkoeHMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwibm90IGFuIGFycmF5IDogXCIgKyB4cyk7XG4gICAgfVxuICB9O1xuXG4gIGFzc2VydE5vQXJndW1lbnRzID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBhc3NlcnQoXCJubyBhcmd1bWVudHMgc3VwcG9ydGVkXCIsIGFyZ3MubGVuZ3RoID09PSAwKTtcbiAgfTtcblxuICBhc3NlcnRTdHJpbmcgPSBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHR5cGVvZiB4ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwibm90IGEgc3RyaW5nIDogXCIgKyB4KTtcbiAgICB9XG4gIH07XG5cbiAgXyA9IHtcbiAgICBpbmRleE9mOiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA/IGZ1bmN0aW9uKHhzLCB4KSB7XG4gICAgICByZXR1cm4geHMuaW5kZXhPZih4KTtcbiAgICB9IDogZnVuY3Rpb24oeHMsIHgpIHtcbiAgICAgIHZhciBpLCBqLCBsZW4xLCB5O1xuICAgICAgZm9yIChpID0gaiA9IDAsIGxlbjEgPSB4cy5sZW5ndGg7IGogPCBsZW4xOyBpID0gKytqKSB7XG4gICAgICAgIHkgPSB4c1tpXTtcbiAgICAgICAgaWYgKHggPT09IHkpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH0sXG4gICAgaW5kZXhXaGVyZTogZnVuY3Rpb24oeHMsIGYpIHtcbiAgICAgIHZhciBpLCBqLCBsZW4xLCB5O1xuICAgICAgZm9yIChpID0gaiA9IDAsIGxlbjEgPSB4cy5sZW5ndGg7IGogPCBsZW4xOyBpID0gKytqKSB7XG4gICAgICAgIHkgPSB4c1tpXTtcbiAgICAgICAgaWYgKGYoeSkpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH0sXG4gICAgaGVhZDogZnVuY3Rpb24oeHMpIHtcbiAgICAgIHJldHVybiB4c1swXTtcbiAgICB9LFxuICAgIGFsd2F5czogZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geDtcbiAgICAgIH07XG4gICAgfSxcbiAgICBuZWdhdGU6IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiAhZih4KTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBlbXB0eTogZnVuY3Rpb24oeHMpIHtcbiAgICAgIHJldHVybiB4cy5sZW5ndGggPT09IDA7XG4gICAgfSxcbiAgICB0YWlsOiBmdW5jdGlvbih4cykge1xuICAgICAgcmV0dXJuIHhzLnNsaWNlKDEsIHhzLmxlbmd0aCk7XG4gICAgfSxcbiAgICBmaWx0ZXI6IGZ1bmN0aW9uKGYsIHhzKSB7XG4gICAgICB2YXIgZmlsdGVyZWQsIGosIGxlbjEsIHg7XG4gICAgICBmaWx0ZXJlZCA9IFtdO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHhzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICB4ID0geHNbal07XG4gICAgICAgIGlmIChmKHgpKSB7XG4gICAgICAgICAgZmlsdGVyZWQucHVzaCh4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgIH0sXG4gICAgbWFwOiBmdW5jdGlvbihmLCB4cykge1xuICAgICAgdmFyIGosIGxlbjEsIHJlc3VsdHMsIHg7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGogPSAwLCBsZW4xID0geHMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgIHggPSB4c1tqXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGYoeCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSxcbiAgICBlYWNoOiBmdW5jdGlvbih4cywgZikge1xuICAgICAgdmFyIGtleSwgdmFsdWU7XG4gICAgICBmb3IgKGtleSBpbiB4cykge1xuICAgICAgICBpZiAoIWhhc1Byb3AuY2FsbCh4cywga2V5KSkgY29udGludWU7XG4gICAgICAgIHZhbHVlID0geHNba2V5XTtcbiAgICAgICAgZihrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfSxcbiAgICB0b0FycmF5OiBmdW5jdGlvbih4cykge1xuICAgICAgaWYgKGlzQXJyYXkoeHMpKSB7XG4gICAgICAgIHJldHVybiB4cztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbeHNdO1xuICAgICAgfVxuICAgIH0sXG4gICAgY29udGFpbnM6IGZ1bmN0aW9uKHhzLCB4KSB7XG4gICAgICByZXR1cm4gXy5pbmRleE9mKHhzLCB4KSAhPT0gLTE7XG4gICAgfSxcbiAgICBpZDogZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHg7XG4gICAgfSxcbiAgICBsYXN0OiBmdW5jdGlvbih4cykge1xuICAgICAgcmV0dXJuIHhzW3hzLmxlbmd0aCAtIDFdO1xuICAgIH0sXG4gICAgYWxsOiBmdW5jdGlvbih4cywgZikge1xuICAgICAgdmFyIGosIGxlbjEsIHg7XG4gICAgICBpZiAoZiA9PSBudWxsKSB7XG4gICAgICAgIGYgPSBfLmlkO1xuICAgICAgfVxuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHhzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICB4ID0geHNbal07XG4gICAgICAgIGlmICghZih4KSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBhbnk6IGZ1bmN0aW9uKHhzLCBmKSB7XG4gICAgICB2YXIgaiwgbGVuMSwgeDtcbiAgICAgIGlmIChmID09IG51bGwpIHtcbiAgICAgICAgZiA9IF8uaWQ7XG4gICAgICB9XG4gICAgICBmb3IgKGogPSAwLCBsZW4xID0geHMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgIHggPSB4c1tqXTtcbiAgICAgICAgaWYgKGYoeCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgd2l0aG91dDogZnVuY3Rpb24oeCwgeHMpIHtcbiAgICAgIHJldHVybiBfLmZpbHRlcigoZnVuY3Rpb24oeSkge1xuICAgICAgICByZXR1cm4geSAhPT0geDtcbiAgICAgIH0pLCB4cyk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHgsIHhzKSB7XG4gICAgICB2YXIgaTtcbiAgICAgIGkgPSBfLmluZGV4T2YoeHMsIHgpO1xuICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICByZXR1cm4geHMuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZm9sZDogZnVuY3Rpb24oeHMsIHNlZWQsIGYpIHtcbiAgICAgIHZhciBqLCBsZW4xLCB4O1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHhzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICB4ID0geHNbal07XG4gICAgICAgIHNlZWQgPSBmKHNlZWQsIHgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlZWQ7XG4gICAgfSxcbiAgICBmbGF0TWFwOiBmdW5jdGlvbihmLCB4cykge1xuICAgICAgcmV0dXJuIF8uZm9sZCh4cywgW10sIChmdW5jdGlvbih5cywgeCkge1xuICAgICAgICByZXR1cm4geXMuY29uY2F0KGYoeCkpO1xuICAgICAgfSkpO1xuICAgIH0sXG4gICAgY2FjaGVkOiBmdW5jdGlvbihmKSB7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YWx1ZSA9IE5vbmU7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gTm9uZSkge1xuICAgICAgICAgIHZhbHVlID0gZigpO1xuICAgICAgICAgIGYgPSB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfTtcbiAgICB9LFxuICAgIGlzRnVuY3Rpb246IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgZiA9PT0gXCJmdW5jdGlvblwiO1xuICAgIH0sXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGV4LCBpbnRlcm5hbHMsIGtleSwgdmFsdWU7XG4gICAgICB0cnkge1xuICAgICAgICByZWN1cnNpb25EZXB0aCsrO1xuICAgICAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gXCJ1bmRlZmluZWRcIjtcbiAgICAgICAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24ob2JqKSkge1xuICAgICAgICAgIHJldHVybiBcImZ1bmN0aW9uXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgaWYgKHJlY3Vyc2lvbkRlcHRoID4gNSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiWy4uXVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gXCJbXCIgKyBfLm1hcChfLnRvU3RyaW5nLCBvYmopLnRvU3RyaW5nKCkgKyBcIl1cIjtcbiAgICAgICAgfSBlbHNlIGlmICgoKG9iaiAhPSBudWxsID8gb2JqLnRvU3RyaW5nIDogdm9pZCAwKSAhPSBudWxsKSAmJiBvYmoudG9TdHJpbmcgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcpIHtcbiAgICAgICAgICByZXR1cm4gb2JqLnRvU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIGlmIChyZWN1cnNpb25EZXB0aCA+IDUpIHtcbiAgICAgICAgICAgIHJldHVybiBcInsuLn1cIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW50ZXJuYWxzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHM7XG4gICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgaWYgKCFoYXNQcm9wLmNhbGwob2JqLCBrZXkpKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgdmFsdWUgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIGV4ID0gX2Vycm9yO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKF8udG9TdHJpbmcoa2V5KSArIFwiOlwiICsgXy50b1N0cmluZyh2YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgfSkoKTtcbiAgICAgICAgICByZXR1cm4gXCJ7XCIgKyBpbnRlcm5hbHMgKyBcIn1cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICByZWN1cnNpb25EZXB0aC0tO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICByZWN1cnNpb25EZXB0aCA9IDA7XG5cbiAgQmFjb24uXyA9IF87XG5cbiAgVXBkYXRlQmFycmllciA9IEJhY29uLlVwZGF0ZUJhcnJpZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFmdGVyVHJhbnNhY3Rpb24sIGFmdGVycywgYWZ0ZXJzSW5kZXgsIGN1cnJlbnRFdmVudElkLCBmbHVzaCwgZmx1c2hEZXBzT2YsIGZsdXNoV2FpdGVycywgaGFzV2FpdGVycywgaW5UcmFuc2FjdGlvbiwgcm9vdEV2ZW50LCB3YWl0ZXJPYnMsIHdhaXRlcnMsIHdoZW5Eb25lV2l0aCwgd3JhcHBlZFN1YnNjcmliZTtcbiAgICByb290RXZlbnQgPSB2b2lkIDA7XG4gICAgd2FpdGVyT2JzID0gW107XG4gICAgd2FpdGVycyA9IHt9O1xuICAgIGFmdGVycyA9IFtdO1xuICAgIGFmdGVyc0luZGV4ID0gMDtcbiAgICBhZnRlclRyYW5zYWN0aW9uID0gZnVuY3Rpb24oZikge1xuICAgICAgaWYgKHJvb3RFdmVudCkge1xuICAgICAgICByZXR1cm4gYWZ0ZXJzLnB1c2goZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZigpO1xuICAgICAgfVxuICAgIH07XG4gICAgd2hlbkRvbmVXaXRoID0gZnVuY3Rpb24ob2JzLCBmKSB7XG4gICAgICB2YXIgb2JzV2FpdGVycztcbiAgICAgIGlmIChyb290RXZlbnQpIHtcbiAgICAgICAgb2JzV2FpdGVycyA9IHdhaXRlcnNbb2JzLmlkXTtcbiAgICAgICAgaWYgKG9ic1dhaXRlcnMgPT0gbnVsbCkge1xuICAgICAgICAgIG9ic1dhaXRlcnMgPSB3YWl0ZXJzW29icy5pZF0gPSBbZl07XG4gICAgICAgICAgcmV0dXJuIHdhaXRlck9icy5wdXNoKG9icyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG9ic1dhaXRlcnMucHVzaChmKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGYoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGZsdXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICB3aGlsZSAod2FpdGVyT2JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZmx1c2hXYWl0ZXJzKDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9O1xuICAgIGZsdXNoV2FpdGVycyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICB2YXIgZiwgaiwgbGVuMSwgb2JzLCBvYnNJZCwgb2JzV2FpdGVycztcbiAgICAgIG9icyA9IHdhaXRlck9ic1tpbmRleF07XG4gICAgICBvYnNJZCA9IG9icy5pZDtcbiAgICAgIG9ic1dhaXRlcnMgPSB3YWl0ZXJzW29ic0lkXTtcbiAgICAgIHdhaXRlck9icy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgZGVsZXRlIHdhaXRlcnNbb2JzSWRdO1xuICAgICAgZmx1c2hEZXBzT2Yob2JzKTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSBvYnNXYWl0ZXJzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICBmID0gb2JzV2FpdGVyc1tqXTtcbiAgICAgICAgZigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9O1xuICAgIGZsdXNoRGVwc09mID0gZnVuY3Rpb24ob2JzKSB7XG4gICAgICB2YXIgZGVwLCBkZXBzLCBpbmRleCwgaiwgbGVuMTtcbiAgICAgIGRlcHMgPSBvYnMuaW50ZXJuYWxEZXBzKCk7XG4gICAgICBmb3IgKGogPSAwLCBsZW4xID0gZGVwcy5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgZGVwID0gZGVwc1tqXTtcbiAgICAgICAgZmx1c2hEZXBzT2YoZGVwKTtcbiAgICAgICAgaWYgKHdhaXRlcnNbZGVwLmlkXSkge1xuICAgICAgICAgIGluZGV4ID0gXy5pbmRleE9mKHdhaXRlck9icywgZGVwKTtcbiAgICAgICAgICBmbHVzaFdhaXRlcnMoaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH07XG4gICAgaW5UcmFuc2FjdGlvbiA9IGZ1bmN0aW9uKGV2ZW50LCBjb250ZXh0LCBmLCBhcmdzKSB7XG4gICAgICB2YXIgYWZ0ZXIsIHJlc3VsdDtcbiAgICAgIGlmIChyb290RXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIGYuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb290RXZlbnQgPSBldmVudDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSBmLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgcm9vdEV2ZW50ID0gdm9pZCAwO1xuICAgICAgICAgIHdoaWxlIChhZnRlcnNJbmRleCA8IGFmdGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFmdGVyID0gYWZ0ZXJzW2FmdGVyc0luZGV4XTtcbiAgICAgICAgICAgIGFmdGVyc0luZGV4Kys7XG4gICAgICAgICAgICBhZnRlcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhZnRlcnNJbmRleCA9IDA7XG4gICAgICAgICAgYWZ0ZXJzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9O1xuICAgIGN1cnJlbnRFdmVudElkID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocm9vdEV2ZW50KSB7XG4gICAgICAgIHJldHVybiByb290RXZlbnQuaWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgIH07XG4gICAgd3JhcHBlZFN1YnNjcmliZSA9IGZ1bmN0aW9uKG9icywgc2luaykge1xuICAgICAgdmFyIGRvVW5zdWIsIHNob3VsZFVuc3ViLCB1bnN1YiwgdW5zdWJkO1xuICAgICAgdW5zdWJkID0gZmFsc2U7XG4gICAgICBzaG91bGRVbnN1YiA9IGZhbHNlO1xuICAgICAgZG9VbnN1YiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2hvdWxkVW5zdWIgPSB0cnVlO1xuICAgICAgfTtcbiAgICAgIHVuc3ViID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHVuc3ViZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBkb1Vuc3ViKCk7XG4gICAgICB9O1xuICAgICAgZG9VbnN1YiA9IG9icy5kaXNwYXRjaGVyLnN1YnNjcmliZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICByZXR1cm4gYWZ0ZXJUcmFuc2FjdGlvbihmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcmVwbHk7XG4gICAgICAgICAgaWYgKCF1bnN1YmQpIHtcbiAgICAgICAgICAgIHJlcGx5ID0gc2luayhldmVudCk7XG4gICAgICAgICAgICBpZiAocmVwbHkgPT09IEJhY29uLm5vTW9yZSkge1xuICAgICAgICAgICAgICByZXR1cm4gdW5zdWIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBpZiAoc2hvdWxkVW5zdWIpIHtcbiAgICAgICAgZG9VbnN1YigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHVuc3ViO1xuICAgIH07XG4gICAgaGFzV2FpdGVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHdhaXRlck9icy5sZW5ndGggPiAwO1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIHdoZW5Eb25lV2l0aDogd2hlbkRvbmVXaXRoLFxuICAgICAgaGFzV2FpdGVyczogaGFzV2FpdGVycyxcbiAgICAgIGluVHJhbnNhY3Rpb246IGluVHJhbnNhY3Rpb24sXG4gICAgICBjdXJyZW50RXZlbnRJZDogY3VycmVudEV2ZW50SWQsXG4gICAgICB3cmFwcGVkU3Vic2NyaWJlOiB3cmFwcGVkU3Vic2NyaWJlLFxuICAgICAgYWZ0ZXJUcmFuc2FjdGlvbjogYWZ0ZXJUcmFuc2FjdGlvblxuICAgIH07XG4gIH0pKCk7XG5cbiAgU291cmNlID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFNvdXJjZShvYnMxLCBzeW5jLCBsYXp5MSkge1xuICAgICAgdGhpcy5vYnMgPSBvYnMxO1xuICAgICAgdGhpcy5zeW5jID0gc3luYztcbiAgICAgIHRoaXMubGF6eSA9IGxhenkxICE9IG51bGwgPyBsYXp5MSA6IGZhbHNlO1xuICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIH1cblxuICAgIFNvdXJjZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24oc2luaykge1xuICAgICAgcmV0dXJuIHRoaXMub2JzLmRpc3BhdGNoZXIuc3Vic2NyaWJlKHNpbmspO1xuICAgIH07XG5cbiAgICBTb3VyY2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5vYnMudG9TdHJpbmcoKTtcbiAgICB9O1xuXG4gICAgU291cmNlLnByb3RvdHlwZS5tYXJrRW5kZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZGVkID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgU291cmNlLnByb3RvdHlwZS5jb25zdW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5sYXp5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IF8uYWx3YXlzKHRoaXMucXVldWVbMF0pXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZVswXTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgU291cmNlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUgPSBbeF07XG4gICAgfTtcblxuICAgIFNvdXJjZS5wcm90b3R5cGUubWF5SGF2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIFNvdXJjZS5wcm90b3R5cGUuaGFzQXRMZWFzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUubGVuZ3RoO1xuICAgIH07XG5cbiAgICBTb3VyY2UucHJvdG90eXBlLmZsYXR0ZW4gPSB0cnVlO1xuXG4gICAgcmV0dXJuIFNvdXJjZTtcblxuICB9KSgpO1xuXG4gIENvbnN1bWluZ1NvdXJjZSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gICAgZXh0ZW5kKENvbnN1bWluZ1NvdXJjZSwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBDb25zdW1pbmdTb3VyY2UoKSB7XG4gICAgICByZXR1cm4gQ29uc3VtaW5nU291cmNlLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIENvbnN1bWluZ1NvdXJjZS5wcm90b3R5cGUuY29uc3VtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICB9O1xuXG4gICAgQ29uc3VtaW5nU291cmNlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUucHVzaCh4KTtcbiAgICB9O1xuXG4gICAgQ29uc3VtaW5nU291cmNlLnByb3RvdHlwZS5tYXlIYXZlID0gZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuICF0aGlzLmVuZGVkIHx8IHRoaXMucXVldWUubGVuZ3RoID49IGM7XG4gICAgfTtcblxuICAgIENvbnN1bWluZ1NvdXJjZS5wcm90b3R5cGUuaGFzQXRMZWFzdCA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlLmxlbmd0aCA+PSBjO1xuICAgIH07XG5cbiAgICBDb25zdW1pbmdTb3VyY2UucHJvdG90eXBlLmZsYXR0ZW4gPSBmYWxzZTtcblxuICAgIHJldHVybiBDb25zdW1pbmdTb3VyY2U7XG5cbiAgfSkoU291cmNlKTtcblxuICBCdWZmZXJpbmdTb3VyY2UgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChCdWZmZXJpbmdTb3VyY2UsIHN1cGVyQ2xhc3MpO1xuXG4gICAgZnVuY3Rpb24gQnVmZmVyaW5nU291cmNlKG9icykge1xuICAgICAgQnVmZmVyaW5nU291cmNlLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9icywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgQnVmZmVyaW5nU291cmNlLnByb3RvdHlwZS5jb25zdW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWVzO1xuICAgICAgdmFsdWVzID0gdGhpcy5xdWV1ZTtcbiAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBCdWZmZXJpbmdTb3VyY2UucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5wdXNoKHgudmFsdWUoKSk7XG4gICAgfTtcblxuICAgIEJ1ZmZlcmluZ1NvdXJjZS5wcm90b3R5cGUuaGFzQXRMZWFzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHJldHVybiBCdWZmZXJpbmdTb3VyY2U7XG5cbiAgfSkoU291cmNlKTtcblxuICBTb3VyY2UuaXNUcmlnZ2VyID0gZnVuY3Rpb24ocykge1xuICAgIGlmIChzIGluc3RhbmNlb2YgU291cmNlKSB7XG4gICAgICByZXR1cm4gcy5zeW5jO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcyBpbnN0YW5jZW9mIEV2ZW50U3RyZWFtO1xuICAgIH1cbiAgfTtcblxuICBTb3VyY2UuZnJvbU9ic2VydmFibGUgPSBmdW5jdGlvbihzKSB7XG4gICAgaWYgKHMgaW5zdGFuY2VvZiBTb3VyY2UpIHtcbiAgICAgIHJldHVybiBzO1xuICAgIH0gZWxzZSBpZiAocyBpbnN0YW5jZW9mIFByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gbmV3IFNvdXJjZShzLCBmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgQ29uc3VtaW5nU291cmNlKHMsIHRydWUpO1xuICAgIH1cbiAgfTtcblxuICBEZXNjID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIERlc2MoY29udGV4dDEsIG1ldGhvZDEsIGFyZ3MxKSB7XG4gICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0MTtcbiAgICAgIHRoaXMubWV0aG9kID0gbWV0aG9kMTtcbiAgICAgIHRoaXMuYXJncyA9IGFyZ3MxO1xuICAgIH1cblxuICAgIERlc2MucHJvdG90eXBlLmRlcHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhY2hlZCB8fCAodGhpcy5jYWNoZWQgPSBmaW5kRGVwcyhbdGhpcy5jb250ZXh0XS5jb25jYXQodGhpcy5hcmdzKSkpO1xuICAgIH07XG5cbiAgICBEZXNjLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF8udG9TdHJpbmcodGhpcy5jb250ZXh0KSArIFwiLlwiICsgXy50b1N0cmluZyh0aGlzLm1ldGhvZCkgKyBcIihcIiArIF8ubWFwKF8udG9TdHJpbmcsIHRoaXMuYXJncykgKyBcIilcIjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIERlc2M7XG5cbiAgfSkoKTtcblxuICBkZXNjcmliZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBjb250ZXh0LCBtZXRob2Q7XG4gICAgY29udGV4dCA9IGFyZ3VtZW50c1swXSwgbWV0aG9kID0gYXJndW1lbnRzWzFdLCBhcmdzID0gMyA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogW107XG4gICAgaWYgKChjb250ZXh0IHx8IG1ldGhvZCkgaW5zdGFuY2VvZiBEZXNjKSB7XG4gICAgICByZXR1cm4gY29udGV4dCB8fCBtZXRob2Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgRGVzYyhjb250ZXh0LCBtZXRob2QsIGFyZ3MpO1xuICAgIH1cbiAgfTtcblxuICB3aXRoRGVzYyA9IGZ1bmN0aW9uKGRlc2MsIG9icykge1xuICAgIG9icy5kZXNjID0gZGVzYztcbiAgICByZXR1cm4gb2JzO1xuICB9O1xuXG4gIGZpbmREZXBzID0gZnVuY3Rpb24oeCkge1xuICAgIGlmIChpc0FycmF5KHgpKSB7XG4gICAgICByZXR1cm4gXy5mbGF0TWFwKGZpbmREZXBzLCB4KTtcbiAgICB9IGVsc2UgaWYgKGlzT2JzZXJ2YWJsZSh4KSkge1xuICAgICAgcmV0dXJuIFt4XTtcbiAgICB9IGVsc2UgaWYgKHggaW5zdGFuY2VvZiBTb3VyY2UpIHtcbiAgICAgIHJldHVybiBbeC5vYnNdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLkRlc2MgPSBEZXNjO1xuXG4gIEJhY29uLkRlc2MuZW1wdHkgPSBuZXcgQmFjb24uRGVzYyhcIlwiLCBcIlwiLCBbXSk7XG5cbiAgd2l0aE1ldGhvZENhbGxTdXBwb3J0ID0gZnVuY3Rpb24od3JhcHBlZCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzLCBjb250ZXh0LCBmLCBtZXRob2ROYW1lO1xuICAgICAgZiA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgICAgaWYgKHR5cGVvZiBmID09PSBcIm9iamVjdFwiICYmIGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNvbnRleHQgPSBmO1xuICAgICAgICBtZXRob2ROYW1lID0gYXJnc1swXTtcbiAgICAgICAgZiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBjb250ZXh0W21ldGhvZE5hbWVdLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICAgIGFyZ3MgPSBhcmdzLnNsaWNlKDEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdyYXBwZWQuYXBwbHkobnVsbCwgW2ZdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3MpKSk7XG4gICAgfTtcbiAgfTtcblxuICBtYWtlRnVuY3Rpb25BcmdzID0gZnVuY3Rpb24oYXJncykge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKTtcbiAgICByZXR1cm4gbWFrZUZ1bmN0aW9uXy5hcHBseShudWxsLCBhcmdzKTtcbiAgfTtcblxuICBwYXJ0aWFsbHlBcHBsaWVkID0gZnVuY3Rpb24oZiwgYXBwbGllZCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzO1xuICAgICAgYXJncyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgICAgcmV0dXJuIGYuYXBwbHkobnVsbCwgYXBwbGllZC5jb25jYXQoYXJncykpO1xuICAgIH07XG4gIH07XG5cbiAgdG9TaW1wbGVFeHRyYWN0b3IgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBmaWVsZFZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmllbGRWYWx1ZSA9IHZhbHVlW2tleV07XG4gICAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWUuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgfTtcblxuICB0b0ZpZWxkRXh0cmFjdG9yID0gZnVuY3Rpb24oZiwgYXJncykge1xuICAgIHZhciBwYXJ0RnVuY3MsIHBhcnRzO1xuICAgIHBhcnRzID0gZi5zbGljZSgxKS5zcGxpdChcIi5cIik7XG4gICAgcGFydEZ1bmNzID0gXy5tYXAodG9TaW1wbGVFeHRyYWN0b3IoYXJncyksIHBhcnRzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBqLCBsZW4xO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHBhcnRGdW5jcy5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgZiA9IHBhcnRGdW5jc1tqXTtcbiAgICAgICAgdmFsdWUgPSBmKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIGlzRmllbGRLZXkgPSBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuICh0eXBlb2YgZiA9PT0gXCJzdHJpbmdcIikgJiYgZi5sZW5ndGggPiAxICYmIGYuY2hhckF0KDApID09PSBcIi5cIjtcbiAgfTtcblxuICBtYWtlRnVuY3Rpb25fID0gd2l0aE1ldGhvZENhbGxTdXBwb3J0KGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBmO1xuICAgIGYgPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGYpKSB7XG4gICAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnRpYWxseUFwcGxpZWQoZiwgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzRmllbGRLZXkoZikpIHtcbiAgICAgIHJldHVybiB0b0ZpZWxkRXh0cmFjdG9yKGYsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXy5hbHdheXMoZik7XG4gICAgfVxuICB9KTtcblxuICBtYWtlRnVuY3Rpb24gPSBmdW5jdGlvbihmLCBhcmdzKSB7XG4gICAgcmV0dXJuIG1ha2VGdW5jdGlvbl8uYXBwbHkobnVsbCwgW2ZdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3MpKSk7XG4gIH07XG5cbiAgY29udmVydEFyZ3NUb0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JzLCBmLCBhcmdzLCBtZXRob2QpIHtcbiAgICB2YXIgc2FtcGxlZDtcbiAgICBpZiAoZiBpbnN0YW5jZW9mIFByb3BlcnR5KSB7XG4gICAgICBzYW1wbGVkID0gZi5zYW1wbGVkQnkob2JzLCBmdW5jdGlvbihwLCBzKSB7XG4gICAgICAgIHJldHVybiBbcCwgc107XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtZXRob2QuY2FsbChzYW1wbGVkLCBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgdmFyIHAsIHM7XG4gICAgICAgIHAgPSBhcmdbMF0sIHMgPSBhcmdbMV07XG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGFyZykge1xuICAgICAgICB2YXIgcCwgcztcbiAgICAgICAgcCA9IGFyZ1swXSwgcyA9IGFyZ1sxXTtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZiA9IG1ha2VGdW5jdGlvbihmLCBhcmdzKTtcbiAgICAgIHJldHVybiBtZXRob2QuY2FsbChvYnMsIGYpO1xuICAgIH1cbiAgfTtcblxuICB0b0NvbWJpbmF0b3IgPSBmdW5jdGlvbihmKSB7XG4gICAgdmFyIGtleTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGYpKSB7XG4gICAgICByZXR1cm4gZjtcbiAgICB9IGVsc2UgaWYgKGlzRmllbGRLZXkoZikpIHtcbiAgICAgIGtleSA9IHRvRmllbGRLZXkoZik7XG4gICAgICByZXR1cm4gZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGxlZnRba2V5XShyaWdodCk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwibm90IGEgZnVuY3Rpb24gb3IgYSBmaWVsZCBrZXk6IFwiICsgZik7XG4gICAgfVxuICB9O1xuXG4gIHRvRmllbGRLZXkgPSBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIGYuc2xpY2UoMSk7XG4gIH07XG5cbiAgU29tZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBTb21lKHZhbHVlMSkge1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlMTtcbiAgICB9XG5cbiAgICBTb21lLnByb3RvdHlwZS5nZXRPckVsc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH07XG5cbiAgICBTb21lLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH07XG5cbiAgICBTb21lLnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbihmKSB7XG4gICAgICBpZiAoZih0aGlzLnZhbHVlKSkge1xuICAgICAgICByZXR1cm4gbmV3IFNvbWUodGhpcy52YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gTm9uZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgU29tZS5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIG5ldyBTb21lKGYodGhpcy52YWx1ZSkpO1xuICAgIH07XG5cbiAgICBTb21lLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGYodGhpcy52YWx1ZSk7XG4gICAgfTtcblxuICAgIFNvbWUucHJvdG90eXBlLmlzRGVmaW5lZCA9IHRydWU7XG5cbiAgICBTb21lLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gW3RoaXMudmFsdWVdO1xuICAgIH07XG5cbiAgICBTb21lLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXCJTb21lKFwiICsgdGhpcy52YWx1ZSArIFwiKVwiO1xuICAgIH07XG5cbiAgICBTb21lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gU29tZTtcblxuICB9KSgpO1xuXG4gIE5vbmUgPSB7XG4gICAgZ2V0T3JFbHNlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgZmlsdGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBOb25lO1xuICAgIH0sXG4gICAgbWFwOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBOb25lO1xuICAgIH0sXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oKSB7fSxcbiAgICBpc0RlZmluZWQ6IGZhbHNlLFxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH0sXG4gICAgaW5zcGVjdDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXCJOb25lXCI7XG4gICAgfSxcbiAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCk7XG4gICAgfVxuICB9O1xuXG4gIHRvT3B0aW9uID0gZnVuY3Rpb24odikge1xuICAgIGlmICh2IGluc3RhbmNlb2YgU29tZSB8fCB2ID09PSBOb25lKSB7XG4gICAgICByZXR1cm4gdjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBTb21lKHYpO1xuICAgIH1cbiAgfTtcblxuICBCYWNvbi5ub01vcmUgPSBbXCI8bm8tbW9yZT5cIl07XG5cbiAgQmFjb24ubW9yZSA9IFtcIjxtb3JlPlwiXTtcblxuICBldmVudElkQ291bnRlciA9IDA7XG5cbiAgRXZlbnQgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gRXZlbnQoKSB7XG4gICAgICB0aGlzLmlkID0gKytldmVudElkQ291bnRlcjtcbiAgICB9XG5cbiAgICBFdmVudC5wcm90b3R5cGUuaXNFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIEV2ZW50LnByb3RvdHlwZS5pc0VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBFdmVudC5wcm90b3R5cGUuaXNJbml0aWFsID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIEV2ZW50LnByb3RvdHlwZS5pc05leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgRXZlbnQucHJvdG90eXBlLmlzRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgRXZlbnQucHJvdG90eXBlLmhhc1ZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIEV2ZW50LnByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBFdmVudC5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcbiAgICB9O1xuXG4gICAgRXZlbnQucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEV2ZW50O1xuXG4gIH0pKCk7XG5cbiAgTmV4dCA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gICAgZXh0ZW5kKE5leHQsIHN1cGVyQ2xhc3MpO1xuXG4gICAgZnVuY3Rpb24gTmV4dCh2YWx1ZUYsIGVhZ2VyKSB7XG4gICAgICBOZXh0Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO1xuICAgICAgaWYgKCFlYWdlciAmJiBfLmlzRnVuY3Rpb24odmFsdWVGKSB8fCB2YWx1ZUYgaW5zdGFuY2VvZiBOZXh0KSB7XG4gICAgICAgIHRoaXMudmFsdWVGID0gdmFsdWVGO1xuICAgICAgICB0aGlzLnZhbHVlSW50ZXJuYWwgPSB2b2lkIDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnZhbHVlRiA9IHZvaWQgMDtcbiAgICAgICAgdGhpcy52YWx1ZUludGVybmFsID0gdmFsdWVGO1xuICAgICAgfVxuICAgIH1cblxuICAgIE5leHQucHJvdG90eXBlLmlzTmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIE5leHQucHJvdG90eXBlLmhhc1ZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgTmV4dC5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnZhbHVlRiBpbnN0YW5jZW9mIE5leHQpIHtcbiAgICAgICAgdGhpcy52YWx1ZUludGVybmFsID0gdGhpcy52YWx1ZUYudmFsdWUoKTtcbiAgICAgICAgdGhpcy52YWx1ZUYgPSB2b2lkIDA7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudmFsdWVGKSB7XG4gICAgICAgIHRoaXMudmFsdWVJbnRlcm5hbCA9IHRoaXMudmFsdWVGKCk7XG4gICAgICAgIHRoaXMudmFsdWVGID0gdm9pZCAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudmFsdWVJbnRlcm5hbDtcbiAgICB9O1xuXG4gICAgTmV4dC5wcm90b3R5cGUuZm1hcCA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHZhciBldmVudCwgdmFsdWU7XG4gICAgICBpZiAodGhpcy52YWx1ZUludGVybmFsKSB7XG4gICAgICAgIHZhbHVlID0gdGhpcy52YWx1ZUludGVybmFsO1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZih2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXZlbnQgPSB0aGlzO1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZihldmVudC52YWx1ZSgpKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE5leHQucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBuZXcgTmV4dCh2YWx1ZSk7XG4gICAgfTtcblxuICAgIE5leHQucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBmKHRoaXMudmFsdWUoKSk7XG4gICAgfTtcblxuICAgIE5leHQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy50b1N0cmluZyh0aGlzLnZhbHVlKCkpO1xuICAgIH07XG5cbiAgICBOZXh0LnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlKCk7XG4gICAgfTtcblxuICAgIHJldHVybiBOZXh0O1xuXG4gIH0pKEV2ZW50KTtcblxuICBJbml0aWFsID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgICBleHRlbmQoSW5pdGlhbCwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBJbml0aWFsKCkge1xuICAgICAgcmV0dXJuIEluaXRpYWwuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgSW5pdGlhbC5wcm90b3R5cGUuaXNJbml0aWFsID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgSW5pdGlhbC5wcm90b3R5cGUuaXNOZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIEluaXRpYWwucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBuZXcgSW5pdGlhbCh2YWx1ZSk7XG4gICAgfTtcblxuICAgIEluaXRpYWwucHJvdG90eXBlLnRvTmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBOZXh0KHRoaXMpO1xuICAgIH07XG5cbiAgICByZXR1cm4gSW5pdGlhbDtcblxuICB9KShOZXh0KTtcblxuICBFbmQgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChFbmQsIHN1cGVyQ2xhc3MpO1xuXG4gICAgZnVuY3Rpb24gRW5kKCkge1xuICAgICAgcmV0dXJuIEVuZC5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBFbmQucHJvdG90eXBlLmlzRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgRW5kLnByb3RvdHlwZS5mbWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgRW5kLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIEVuZC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBcIjxlbmQ+XCI7XG4gICAgfTtcblxuICAgIHJldHVybiBFbmQ7XG5cbiAgfSkoRXZlbnQpO1xuXG4gIEVycm9yID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgICBleHRlbmQoRXJyb3IsIHN1cGVyQ2xhc3MpO1xuXG4gICAgZnVuY3Rpb24gRXJyb3IoZXJyb3IxKSB7XG4gICAgICB0aGlzLmVycm9yID0gZXJyb3IxO1xuICAgIH1cblxuICAgIEVycm9yLnByb3RvdHlwZS5pc0Vycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgRXJyb3IucHJvdG90eXBlLmZtYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBFcnJvci5wcm90b3R5cGUuYXBwbHkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBcIjxlcnJvcj4gXCIgKyBfLnRvU3RyaW5nKHRoaXMuZXJyb3IpO1xuICAgIH07XG5cbiAgICByZXR1cm4gRXJyb3I7XG5cbiAgfSkoRXZlbnQpO1xuXG4gIEJhY29uLkV2ZW50ID0gRXZlbnQ7XG5cbiAgQmFjb24uSW5pdGlhbCA9IEluaXRpYWw7XG5cbiAgQmFjb24uTmV4dCA9IE5leHQ7XG5cbiAgQmFjb24uRW5kID0gRW5kO1xuXG4gIEJhY29uLkVycm9yID0gRXJyb3I7XG5cbiAgaW5pdGlhbEV2ZW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEluaXRpYWwodmFsdWUsIHRydWUpO1xuICB9O1xuXG4gIG5leHRFdmVudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBOZXh0KHZhbHVlLCB0cnVlKTtcbiAgfTtcblxuICBlbmRFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRW5kKCk7XG4gIH07XG5cbiAgdG9FdmVudCA9IGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCBpbnN0YW5jZW9mIEV2ZW50KSB7XG4gICAgICByZXR1cm4geDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5leHRFdmVudCh4KTtcbiAgICB9XG4gIH07XG5cbiAgaWRDb3VudGVyID0gMDtcblxuICByZWdpc3Rlck9icyA9IGZ1bmN0aW9uKCkge307XG5cbiAgT2JzZXJ2YWJsZSA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBPYnNlcnZhYmxlKGRlc2MxKSB7XG4gICAgICB0aGlzLmRlc2MgPSBkZXNjMTtcbiAgICAgIHRoaXMuaWQgPSArK2lkQ291bnRlcjtcbiAgICAgIHRoaXMuaW5pdGlhbERlc2MgPSB0aGlzLmRlc2M7XG4gICAgfVxuXG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24oc2luaykge1xuICAgICAgcmV0dXJuIFVwZGF0ZUJhcnJpZXIud3JhcHBlZFN1YnNjcmliZSh0aGlzLCBzaW5rKTtcbiAgICB9O1xuXG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuc3Vic2NyaWJlSW50ZXJuYWwgPSBmdW5jdGlvbihzaW5rKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNwYXRjaGVyLnN1YnNjcmliZShzaW5rKTtcbiAgICB9O1xuXG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUub25WYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGY7XG4gICAgICBmID0gbWFrZUZ1bmN0aW9uQXJncyhhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgcmV0dXJuIGYoZXZlbnQudmFsdWUoKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5vblZhbHVlcyA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiB0aGlzLm9uVmFsdWUoZnVuY3Rpb24oYXJncykge1xuICAgICAgICByZXR1cm4gZi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZjtcbiAgICAgIGYgPSBtYWtlRnVuY3Rpb25BcmdzKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmUoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmlzRXJyb3IoKSkge1xuICAgICAgICAgIHJldHVybiBmKGV2ZW50LmVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIE9ic2VydmFibGUucHJvdG90eXBlLm9uRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZjtcbiAgICAgIGYgPSBtYWtlRnVuY3Rpb25BcmdzKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmUoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICByZXR1cm4gZigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUubmFtZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE9ic2VydmFibGUucHJvdG90eXBlLndpdGhEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kZXNjID0gZGVzY3JpYmUuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX25hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5kZXNjLnRvU3RyaW5nKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE9ic2VydmFibGUucHJvdG90eXBlLmludGVybmFsRGVwcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbERlc2MuZGVwcygpO1xuICAgIH07XG5cbiAgICByZXR1cm4gT2JzZXJ2YWJsZTtcblxuICB9KSgpO1xuXG4gIE9ic2VydmFibGUucHJvdG90eXBlLmFzc2lnbiA9IE9ic2VydmFibGUucHJvdG90eXBlLm9uVmFsdWU7XG5cbiAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuZm9yRWFjaCA9IE9ic2VydmFibGUucHJvdG90eXBlLm9uVmFsdWU7XG5cbiAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuaW5zcGVjdCA9IE9ic2VydmFibGUucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4gIEJhY29uLk9ic2VydmFibGUgPSBPYnNlcnZhYmxlO1xuXG4gIENvbXBvc2l0ZVVuc3Vic2NyaWJlID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIENvbXBvc2l0ZVVuc3Vic2NyaWJlKHNzKSB7XG4gICAgICB2YXIgaiwgbGVuMSwgcztcbiAgICAgIGlmIChzcyA9PSBudWxsKSB7XG4gICAgICAgIHNzID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLnVuc3Vic2NyaWJlID0gYmluZCh0aGlzLnVuc3Vic2NyaWJlLCB0aGlzKTtcbiAgICAgIHRoaXMudW5zdWJzY3JpYmVkID0gZmFsc2U7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgIHRoaXMuc3RhcnRpbmcgPSBbXTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSBzcy5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgcyA9IHNzW2pdO1xuICAgICAgICB0aGlzLmFkZChzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBDb21wb3NpdGVVbnN1YnNjcmliZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oc3Vic2NyaXB0aW9uKSB7XG4gICAgICB2YXIgZW5kZWQsIHVuc3ViLCB1bnN1Yk1lO1xuICAgICAgaWYgKHRoaXMudW5zdWJzY3JpYmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVuZGVkID0gZmFsc2U7XG4gICAgICB1bnN1YiA9IG5vcDtcbiAgICAgIHRoaXMuc3RhcnRpbmcucHVzaChzdWJzY3JpcHRpb24pO1xuICAgICAgdW5zdWJNZSA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKF90aGlzLnVuc3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbmRlZCA9IHRydWU7XG4gICAgICAgICAgX3RoaXMucmVtb3ZlKHVuc3ViKTtcbiAgICAgICAgICByZXR1cm4gXy5yZW1vdmUoc3Vic2NyaXB0aW9uLCBfdGhpcy5zdGFydGluZyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIHVuc3ViID0gc3Vic2NyaXB0aW9uKHRoaXMudW5zdWJzY3JpYmUsIHVuc3ViTWUpO1xuICAgICAgaWYgKCEodGhpcy51bnN1YnNjcmliZWQgfHwgZW5kZWQpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHVuc3ViKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVuc3ViKCk7XG4gICAgICB9XG4gICAgICBfLnJlbW92ZShzdWJzY3JpcHRpb24sIHRoaXMuc3RhcnRpbmcpO1xuICAgICAgcmV0dXJuIHVuc3ViO1xuICAgIH07XG5cbiAgICBDb21wb3NpdGVVbnN1YnNjcmliZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24odW5zdWIpIHtcbiAgICAgIGlmICh0aGlzLnVuc3Vic2NyaWJlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoKF8ucmVtb3ZlKHVuc3ViLCB0aGlzLnN1YnNjcmlwdGlvbnMpKSAhPT0gdm9pZCAwKSB7XG4gICAgICAgIHJldHVybiB1bnN1YigpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBDb21wb3NpdGVVbnN1YnNjcmliZS5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBqLCBsZW4xLCByZWYsIHM7XG4gICAgICBpZiAodGhpcy51bnN1YnNjcmliZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy51bnN1YnNjcmliZWQgPSB0cnVlO1xuICAgICAgcmVmID0gdGhpcy5zdWJzY3JpcHRpb25zO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHJlZi5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgcyA9IHJlZltqXTtcbiAgICAgICAgcygpO1xuICAgICAgfVxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zID0gW107XG4gICAgICByZXR1cm4gdGhpcy5zdGFydGluZyA9IFtdO1xuICAgIH07XG5cbiAgICBDb21wb3NpdGVVbnN1YnNjcmliZS5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnVuc3Vic2NyaWJlZCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnN1YnNjcmlwdGlvbnMubGVuZ3RoICsgdGhpcy5zdGFydGluZy5sZW5ndGg7XG4gICAgfTtcblxuICAgIENvbXBvc2l0ZVVuc3Vic2NyaWJlLnByb3RvdHlwZS5lbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY291bnQoKSA9PT0gMDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIENvbXBvc2l0ZVVuc3Vic2NyaWJlO1xuXG4gIH0pKCk7XG5cbiAgQmFjb24uQ29tcG9zaXRlVW5zdWJzY3JpYmUgPSBDb21wb3NpdGVVbnN1YnNjcmliZTtcblxuICBEaXNwYXRjaGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLnB1c2hpbmcgPSBmYWxzZTtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLmVuZGVkID0gZmFsc2U7XG5cbiAgICBEaXNwYXRjaGVyLnByb3RvdHlwZS5wcmV2RXJyb3IgPSB2b2lkIDA7XG5cbiAgICBEaXNwYXRjaGVyLnByb3RvdHlwZS51bnN1YlNyYyA9IHZvaWQgMDtcblxuICAgIGZ1bmN0aW9uIERpc3BhdGNoZXIoX3N1YnNjcmliZSwgX2hhbmRsZUV2ZW50KSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmUgPSBfc3Vic2NyaWJlO1xuICAgICAgdGhpcy5faGFuZGxlRXZlbnQgPSBfaGFuZGxlRXZlbnQ7XG4gICAgICB0aGlzLnN1YnNjcmliZSA9IGJpbmQodGhpcy5zdWJzY3JpYmUsIHRoaXMpO1xuICAgICAgdGhpcy5oYW5kbGVFdmVudCA9IGJpbmQodGhpcy5oYW5kbGVFdmVudCwgdGhpcyk7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICB9XG5cbiAgICBEaXNwYXRjaGVyLnByb3RvdHlwZS5oYXNTdWJzY3JpYmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaXB0aW9ucy5sZW5ndGggPiAwO1xuICAgIH07XG5cbiAgICBEaXNwYXRjaGVyLnByb3RvdHlwZS5yZW1vdmVTdWIgPSBmdW5jdGlvbihzdWJzY3JpcHRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YnNjcmlwdGlvbnMgPSBfLndpdGhvdXQoc3Vic2NyaXB0aW9uLCB0aGlzLnN1YnNjcmlwdGlvbnMpO1xuICAgIH07XG5cbiAgICBEaXNwYXRjaGVyLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5pc0VuZCgpKSB7XG4gICAgICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFVwZGF0ZUJhcnJpZXIuaW5UcmFuc2FjdGlvbihldmVudCwgdGhpcywgdGhpcy5wdXNoSXQsIFtldmVudF0pO1xuICAgIH07XG5cbiAgICBEaXNwYXRjaGVyLnByb3RvdHlwZS5wdXNoVG9TdWJzY3JpcHRpb25zID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBlLCBqLCBsZW4xLCByZXBseSwgc3ViLCB0bXA7XG4gICAgICB0cnkge1xuICAgICAgICB0bXAgPSB0aGlzLnN1YnNjcmlwdGlvbnM7XG4gICAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSB0bXAubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgICAgc3ViID0gdG1wW2pdO1xuICAgICAgICAgIHJlcGx5ID0gc3ViLnNpbmsoZXZlbnQpO1xuICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlIHx8IGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlU3ViKHN1Yik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgIGUgPSBfZXJyb3I7XG4gICAgICAgIHRoaXMucHVzaGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLnB1c2hJdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMucHVzaGluZykge1xuICAgICAgICBpZiAoZXZlbnQgPT09IHRoaXMucHJldkVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC5pc0Vycm9yKCkpIHtcbiAgICAgICAgICB0aGlzLnByZXZFcnJvciA9IGV2ZW50O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHVzaGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMucHVzaFRvU3Vic2NyaXB0aW9ucyhldmVudCk7XG4gICAgICAgIHRoaXMucHVzaGluZyA9IGZhbHNlO1xuICAgICAgICB3aGlsZSAodGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICBldmVudCA9IHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICAgICAgICB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmhhc1N1YnNjcmliZXJzKCkpIHtcbiAgICAgICAgICByZXR1cm4gQmFjb24ubW9yZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnVuc3Vic2NyaWJlRnJvbVNvdXJjZSgpO1xuICAgICAgICAgIHJldHVybiBCYWNvbi5ub01vcmU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucXVldWUucHVzaChldmVudCk7XG4gICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBEaXNwYXRjaGVyLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAodGhpcy5faGFuZGxlRXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBEaXNwYXRjaGVyLnByb3RvdHlwZS51bnN1YnNjcmliZUZyb21Tb3VyY2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnVuc3ViU3JjKSB7XG4gICAgICAgIHRoaXMudW5zdWJTcmMoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnVuc3ViU3JjID0gdm9pZCAwO1xuICAgIH07XG5cbiAgICBEaXNwYXRjaGVyLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbihzaW5rKSB7XG4gICAgICB2YXIgc3Vic2NyaXB0aW9uO1xuICAgICAgaWYgKHRoaXMuZW5kZWQpIHtcbiAgICAgICAgc2luayhlbmRFdmVudCgpKTtcbiAgICAgICAgcmV0dXJuIG5vcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFzc2VydEZ1bmN0aW9uKHNpbmspO1xuICAgICAgICBzdWJzY3JpcHRpb24gPSB7XG4gICAgICAgICAgc2luazogc2lua1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChzdWJzY3JpcHRpb24pO1xuICAgICAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHRoaXMudW5zdWJTcmMgPSB0aGlzLl9zdWJzY3JpYmUodGhpcy5oYW5kbGVFdmVudCk7XG4gICAgICAgICAgYXNzZXJ0RnVuY3Rpb24odGhpcy51bnN1YlNyYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLnJlbW92ZVN1YihzdWJzY3JpcHRpb24pO1xuICAgICAgICAgICAgaWYgKCFfdGhpcy5oYXNTdWJzY3JpYmVycygpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy51bnN1YnNjcmliZUZyb21Tb3VyY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIERpc3BhdGNoZXI7XG5cbiAgfSkoKTtcblxuICBCYWNvbi5EaXNwYXRjaGVyID0gRGlzcGF0Y2hlcjtcblxuICBFdmVudFN0cmVhbSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gICAgZXh0ZW5kKEV2ZW50U3RyZWFtLCBzdXBlckNsYXNzKTtcblxuICAgIGZ1bmN0aW9uIEV2ZW50U3RyZWFtKGRlc2MsIHN1YnNjcmliZSwgaGFuZGxlcikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihkZXNjKSkge1xuICAgICAgICBoYW5kbGVyID0gc3Vic2NyaWJlO1xuICAgICAgICBzdWJzY3JpYmUgPSBkZXNjO1xuICAgICAgICBkZXNjID0gRGVzYy5lbXB0eTtcbiAgICAgIH1cbiAgICAgIEV2ZW50U3RyZWFtLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIGRlc2MpO1xuICAgICAgYXNzZXJ0RnVuY3Rpb24oc3Vic2NyaWJlKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKHN1YnNjcmliZSwgaGFuZGxlcik7XG4gICAgICByZWdpc3Rlck9icyh0aGlzKTtcbiAgICB9XG5cbiAgICBFdmVudFN0cmVhbS5wcm90b3R5cGUudG9Qcm9wZXJ0eSA9IGZ1bmN0aW9uKGluaXRWYWx1ZV8pIHtcbiAgICAgIHZhciBkaXNwLCBpbml0VmFsdWU7XG4gICAgICBpbml0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID09PSAwID8gTm9uZSA6IHRvT3B0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaW5pdFZhbHVlXztcbiAgICAgIH0pO1xuICAgICAgZGlzcCA9IHRoaXMuZGlzcGF0Y2hlcjtcbiAgICAgIHJldHVybiBuZXcgUHJvcGVydHkobmV3IEJhY29uLkRlc2ModGhpcywgXCJ0b1Byb3BlcnR5XCIsIFtpbml0VmFsdWVfXSksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgICAgdmFyIGluaXRTZW50LCByZXBseSwgc2VuZEluaXQsIHVuc3ViO1xuICAgICAgICBpbml0U2VudCA9IGZhbHNlO1xuICAgICAgICB1bnN1YiA9IG5vcDtcbiAgICAgICAgcmVwbHkgPSBCYWNvbi5tb3JlO1xuICAgICAgICBzZW5kSW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICghaW5pdFNlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBpbml0VmFsdWUuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICBpbml0U2VudCA9IHRydWU7XG4gICAgICAgICAgICAgIHJlcGx5ID0gc2luayhuZXcgSW5pdGlhbCh2YWx1ZSkpO1xuICAgICAgICAgICAgICBpZiAocmVwbHkgPT09IEJhY29uLm5vTW9yZSkge1xuICAgICAgICAgICAgICAgIHVuc3ViKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuc3ViID0gbm9wO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHVuc3ViID0gZGlzcC5zdWJzY3JpYmUoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBpZiAoZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgaWYgKGluaXRTZW50ICYmIGV2ZW50LmlzSW5pdGlhbCgpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKCFldmVudC5pc0luaXRpYWwoKSkge1xuICAgICAgICAgICAgICAgIHNlbmRJbml0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaW5pdFNlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICBpbml0VmFsdWUgPSBuZXcgU29tZShldmVudCk7XG4gICAgICAgICAgICAgIHJldHVybiBzaW5rKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICAgICAgcmVwbHkgPSBzZW5kSW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcGx5ICE9PSBCYWNvbi5ub01vcmUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNpbmsoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNlbmRJbml0KCk7XG4gICAgICAgIHJldHVybiB1bnN1YjtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBFdmVudFN0cmVhbS5wcm90b3R5cGUudG9FdmVudFN0cmVhbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIEV2ZW50U3RyZWFtLnByb3RvdHlwZS53aXRoSGFuZGxlciA9IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2ModGhpcywgXCJ3aXRoSGFuZGxlclwiLCBbaGFuZGxlcl0pLCB0aGlzLmRpc3BhdGNoZXIuc3Vic2NyaWJlLCBoYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEV2ZW50U3RyZWFtO1xuXG4gIH0pKE9ic2VydmFibGUpO1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtID0gRXZlbnRTdHJlYW07XG5cbiAgQmFjb24ubmV2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEV2ZW50U3RyZWFtKGRlc2NyaWJlKEJhY29uLCBcIm5ldmVyXCIpLCBmdW5jdGlvbihzaW5rKSB7XG4gICAgICBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgcmV0dXJuIG5vcDtcbiAgICB9KTtcbiAgfTtcblxuICBCYWNvbi53aGVuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGYsIGksIGluZGV4LCBpeCwgaiwgaywgbGVuLCBsZW4xLCBsZW4yLCBuZWVkc0JhcnJpZXIsIHBhdCwgcGF0U291cmNlcywgcGF0cywgcGF0dGVybnMsIHJlZiwgcmVzdWx0U3RyZWFtLCBzLCBzb3VyY2VzLCB0cmlnZ2VyRm91bmQsIHVzYWdlO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gQmFjb24ubmV2ZXIoKTtcbiAgICB9XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB1c2FnZSA9IFwid2hlbjogZXhwZWN0aW5nIGFyZ3VtZW50cyBpbiB0aGUgZm9ybSAoT2JzZXJ2YWJsZSssZnVuY3Rpb24pK1wiO1xuICAgIGFzc2VydCh1c2FnZSwgbGVuICUgMiA9PT0gMCk7XG4gICAgc291cmNlcyA9IFtdO1xuICAgIHBhdHMgPSBbXTtcbiAgICBpID0gMDtcbiAgICBwYXR0ZXJucyA9IFtdO1xuICAgIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgICBwYXR0ZXJuc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIHBhdHRlcm5zW2kgKyAxXSA9IGFyZ3VtZW50c1tpICsgMV07XG4gICAgICBwYXRTb3VyY2VzID0gXy50b0FycmF5KGFyZ3VtZW50c1tpXSk7XG4gICAgICBmID0gY29uc3RhbnRUb0Z1bmN0aW9uKGFyZ3VtZW50c1tpICsgMV0pO1xuICAgICAgcGF0ID0ge1xuICAgICAgICBmOiBmLFxuICAgICAgICBpeHM6IFtdXG4gICAgICB9O1xuICAgICAgdHJpZ2dlckZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IgKGogPSAwLCBsZW4xID0gcGF0U291cmNlcy5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgcyA9IHBhdFNvdXJjZXNbal07XG4gICAgICAgIGluZGV4ID0gXy5pbmRleE9mKHNvdXJjZXMsIHMpO1xuICAgICAgICBpZiAoIXRyaWdnZXJGb3VuZCkge1xuICAgICAgICAgIHRyaWdnZXJGb3VuZCA9IFNvdXJjZS5pc1RyaWdnZXIocyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICAgIHNvdXJjZXMucHVzaChzKTtcbiAgICAgICAgICBpbmRleCA9IHNvdXJjZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICByZWYgPSBwYXQuaXhzO1xuICAgICAgICBmb3IgKGsgPSAwLCBsZW4yID0gcmVmLmxlbmd0aDsgayA8IGxlbjI7IGsrKykge1xuICAgICAgICAgIGl4ID0gcmVmW2tdO1xuICAgICAgICAgIGlmIChpeC5pbmRleCA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgIGl4LmNvdW50Kys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBhdC5peHMucHVzaCh7XG4gICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgIGNvdW50OiAxXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYXNzZXJ0KFwiQXQgbGVhc3Qgb25lIEV2ZW50U3RyZWFtIHJlcXVpcmVkXCIsIHRyaWdnZXJGb3VuZCB8fCAoIXBhdFNvdXJjZXMubGVuZ3RoKSk7XG4gICAgICBpZiAocGF0U291cmNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBhdHMucHVzaChwYXQpO1xuICAgICAgfVxuICAgICAgaSA9IGkgKyAyO1xuICAgIH1cbiAgICBpZiAoIXNvdXJjZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gQmFjb24ubmV2ZXIoKTtcbiAgICB9XG4gICAgc291cmNlcyA9IF8ubWFwKFNvdXJjZS5mcm9tT2JzZXJ2YWJsZSwgc291cmNlcyk7XG4gICAgbmVlZHNCYXJyaWVyID0gKF8uYW55KHNvdXJjZXMsIGZ1bmN0aW9uKHMpIHtcbiAgICAgIHJldHVybiBzLmZsYXR0ZW47XG4gICAgfSkpICYmIChjb250YWluc0R1cGxpY2F0ZURlcHMoXy5tYXAoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHJldHVybiBzLm9icztcbiAgICB9KSwgc291cmNlcykpKTtcbiAgICByZXR1cm4gcmVzdWx0U3RyZWFtID0gbmV3IEV2ZW50U3RyZWFtKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcIndoZW5cIiwgcGF0dGVybnMpLCBmdW5jdGlvbihzaW5rKSB7XG4gICAgICB2YXIgY2Fubm90TWF0Y2gsIGNhbm5vdFN5bmMsIGVuZHMsIG1hdGNoLCBub25GbGF0dGVuZWQsIHBhcnQsIHRyaWdnZXJzO1xuICAgICAgdHJpZ2dlcnMgPSBbXTtcbiAgICAgIGVuZHMgPSBmYWxzZTtcbiAgICAgIG1hdGNoID0gZnVuY3Rpb24ocCkge1xuICAgICAgICB2YXIgbCwgbGVuMywgcmVmMTtcbiAgICAgICAgcmVmMSA9IHAuaXhzO1xuICAgICAgICBmb3IgKGwgPSAwLCBsZW4zID0gcmVmMS5sZW5ndGg7IGwgPCBsZW4zOyBsKyspIHtcbiAgICAgICAgICBpID0gcmVmMVtsXTtcbiAgICAgICAgICBpZiAoIXNvdXJjZXNbaS5pbmRleF0uaGFzQXRMZWFzdChpLmNvdW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgICBjYW5ub3RTeW5jID0gZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgIHJldHVybiAhc291cmNlLnN5bmMgfHwgc291cmNlLmVuZGVkO1xuICAgICAgfTtcbiAgICAgIGNhbm5vdE1hdGNoID0gZnVuY3Rpb24ocCkge1xuICAgICAgICB2YXIgbCwgbGVuMywgcmVmMTtcbiAgICAgICAgcmVmMSA9IHAuaXhzO1xuICAgICAgICBmb3IgKGwgPSAwLCBsZW4zID0gcmVmMS5sZW5ndGg7IGwgPCBsZW4zOyBsKyspIHtcbiAgICAgICAgICBpID0gcmVmMVtsXTtcbiAgICAgICAgICBpZiAoIXNvdXJjZXNbaS5pbmRleF0ubWF5SGF2ZShpLmNvdW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgbm9uRmxhdHRlbmVkID0gZnVuY3Rpb24odHJpZ2dlcikge1xuICAgICAgICByZXR1cm4gIXRyaWdnZXIuc291cmNlLmZsYXR0ZW47XG4gICAgICB9O1xuICAgICAgcGFydCA9IGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odW5zdWJBbGwpIHtcbiAgICAgICAgICB2YXIgZmx1c2gsIGZsdXNoTGF0ZXIsIGZsdXNoV2hpbGVUcmlnZ2VycztcbiAgICAgICAgICBmbHVzaExhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gVXBkYXRlQmFycmllci53aGVuRG9uZVdpdGgocmVzdWx0U3RyZWFtLCBmbHVzaCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBmbHVzaFdoaWxlVHJpZ2dlcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBldmVudHMsIGwsIGxlbjMsIHAsIHJlcGx5LCB0cmlnZ2VyO1xuICAgICAgICAgICAgaWYgKHRyaWdnZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgcmVwbHkgPSBCYWNvbi5tb3JlO1xuICAgICAgICAgICAgICB0cmlnZ2VyID0gdHJpZ2dlcnMucG9wKCk7XG4gICAgICAgICAgICAgIGZvciAobCA9IDAsIGxlbjMgPSBwYXRzLmxlbmd0aDsgbCA8IGxlbjM7IGwrKykge1xuICAgICAgICAgICAgICAgIHAgPSBwYXRzW2xdO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaChwKSkge1xuICAgICAgICAgICAgICAgICAgZXZlbnRzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGVuNCwgbSwgcmVmMSwgcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgICAgcmVmMSA9IHAuaXhzO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobSA9IDAsIGxlbjQgPSByZWYxLmxlbmd0aDsgbSA8IGxlbjQ7IG0rKykge1xuICAgICAgICAgICAgICAgICAgICAgIGkgPSByZWYxW21dO1xuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChzb3VyY2VzW2kuaW5kZXhdLmNvbnN1bWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgcmVwbHkgPSBzaW5rKHRyaWdnZXIuZS5hcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50LCB2YWx1ZXM7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgbGVuNCwgbSwgcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgZm9yIChtID0gMCwgbGVuNCA9IGV2ZW50cy5sZW5ndGg7IG0gPCBsZW40OyBtKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50ID0gZXZlbnRzW21dO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGV2ZW50LnZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHAuZi5hcHBseShwLCB2YWx1ZXMpO1xuICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgaWYgKHRyaWdnZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VycyA9IF8uZmlsdGVyKG5vbkZsYXR0ZW5lZCwgdHJpZ2dlcnMpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKHJlcGx5ID09PSBCYWNvbi5ub01vcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcGx5O1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZsdXNoV2hpbGVUcmlnZ2VycygpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIEJhY29uLm1vcmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBmbHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHJlcGx5O1xuICAgICAgICAgICAgcmVwbHkgPSBmbHVzaFdoaWxlVHJpZ2dlcnMoKTtcbiAgICAgICAgICAgIGlmIChlbmRzKSB7XG4gICAgICAgICAgICAgIGVuZHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgaWYgKF8uYWxsKHNvdXJjZXMsIGNhbm5vdFN5bmMpIHx8IF8uYWxsKHBhdHMsIGNhbm5vdE1hdGNoKSkge1xuICAgICAgICAgICAgICAgIHJlcGx5ID0gQmFjb24ubm9Nb3JlO1xuICAgICAgICAgICAgICAgIHNpbmsoZW5kRXZlbnQoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICAgIHVuc3ViQWxsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVwbHk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gc291cmNlLnN1YnNjcmliZShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgcmVwbHk7XG4gICAgICAgICAgICBpZiAoZS5pc0VuZCgpKSB7XG4gICAgICAgICAgICAgIGVuZHMgPSB0cnVlO1xuICAgICAgICAgICAgICBzb3VyY2UubWFya0VuZGVkKCk7XG4gICAgICAgICAgICAgIGZsdXNoTGF0ZXIoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5pc0Vycm9yKCkpIHtcbiAgICAgICAgICAgICAgcmVwbHkgPSBzaW5rKGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc291cmNlLnB1c2goZSk7XG4gICAgICAgICAgICAgIGlmIChzb3VyY2Uuc3luYykge1xuICAgICAgICAgICAgICAgIHRyaWdnZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICAgICAgICBlOiBlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKG5lZWRzQmFycmllciB8fCBVcGRhdGVCYXJyaWVyLmhhc1dhaXRlcnMoKSkge1xuICAgICAgICAgICAgICAgICAgZmx1c2hMYXRlcigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcGx5ID09PSBCYWNvbi5ub01vcmUpIHtcbiAgICAgICAgICAgICAgdW5zdWJBbGwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXBseSB8fCBCYWNvbi5tb3JlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICAgIHJldHVybiBuZXcgQmFjb24uQ29tcG9zaXRlVW5zdWJzY3JpYmUoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbCwgbGVuMywgcmVzdWx0cztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGwgPSAwLCBsZW4zID0gc291cmNlcy5sZW5ndGg7IGwgPCBsZW4zOyBsKyspIHtcbiAgICAgICAgICBzID0gc291cmNlc1tsXTtcbiAgICAgICAgICByZXN1bHRzLnB1c2gocGFydChzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KSgpKS51bnN1YnNjcmliZTtcbiAgICB9KTtcbiAgfTtcblxuICBjb250YWluc0R1cGxpY2F0ZURlcHMgPSBmdW5jdGlvbihvYnNlcnZhYmxlcywgc3RhdGUpIHtcbiAgICB2YXIgY2hlY2tPYnNlcnZhYmxlO1xuICAgIGlmIChzdGF0ZSA9PSBudWxsKSB7XG4gICAgICBzdGF0ZSA9IFtdO1xuICAgIH1cbiAgICBjaGVja09ic2VydmFibGUgPSBmdW5jdGlvbihvYnMpIHtcbiAgICAgIHZhciBkZXBzO1xuICAgICAgaWYgKF8uY29udGFpbnMoc3RhdGUsIG9icykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXBzID0gb2JzLmludGVybmFsRGVwcygpO1xuICAgICAgICBpZiAoZGVwcy5sZW5ndGgpIHtcbiAgICAgICAgICBzdGF0ZS5wdXNoKG9icyk7XG4gICAgICAgICAgcmV0dXJuIF8uYW55KGRlcHMsIGNoZWNrT2JzZXJ2YWJsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhdGUucHVzaChvYnMpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIF8uYW55KG9ic2VydmFibGVzLCBjaGVja09ic2VydmFibGUpO1xuICB9O1xuXG4gIGNvbnN0YW50VG9GdW5jdGlvbiA9IGZ1bmN0aW9uKGYpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGYpKSB7XG4gICAgICByZXR1cm4gZjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIF8uYWx3YXlzKGYpO1xuICAgIH1cbiAgfTtcblxuICBCYWNvbi5ncm91cFNpbXVsdGFuZW91cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzLCBzb3VyY2VzLCBzdHJlYW1zO1xuICAgIHN0cmVhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICBpZiAoc3RyZWFtcy5sZW5ndGggPT09IDEgJiYgaXNBcnJheShzdHJlYW1zWzBdKSkge1xuICAgICAgc3RyZWFtcyA9IHN0cmVhbXNbMF07XG4gICAgfVxuICAgIHNvdXJjZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaiwgbGVuMSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSBzdHJlYW1zLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICBzID0gc3RyZWFtc1tqXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBCdWZmZXJpbmdTb3VyY2UocykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiZ3JvdXBTaW11bHRhbmVvdXNcIiwgc3RyZWFtcyksIEJhY29uLndoZW4oc291cmNlcywgKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHhzO1xuICAgICAgeHMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgIHJldHVybiB4cztcbiAgICB9KSkpO1xuICB9O1xuXG4gIFByb3BlcnR5RGlzcGF0Y2hlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gICAgZXh0ZW5kKFByb3BlcnR5RGlzcGF0Y2hlciwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBQcm9wZXJ0eURpc3BhdGNoZXIocHJvcGVydHkxLCBzdWJzY3JpYmUsIGhhbmRsZUV2ZW50KSB7XG4gICAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHkxO1xuICAgICAgdGhpcy5zdWJzY3JpYmUgPSBiaW5kKHRoaXMuc3Vic2NyaWJlLCB0aGlzKTtcbiAgICAgIFByb3BlcnR5RGlzcGF0Y2hlci5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBzdWJzY3JpYmUsIGhhbmRsZUV2ZW50KTtcbiAgICAgIHRoaXMuY3VycmVudCA9IE5vbmU7XG4gICAgICB0aGlzLmN1cnJlbnRWYWx1ZVJvb3RJZCA9IHZvaWQgMDtcbiAgICAgIHRoaXMucHJvcGVydHlFbmRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIFByb3BlcnR5RGlzcGF0Y2hlci5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICB0aGlzLnByb3BlcnR5RW5kZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGV2ZW50Lmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3IFNvbWUoZXZlbnQpO1xuICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZVJvb3RJZCA9IFVwZGF0ZUJhcnJpZXIuY3VycmVudEV2ZW50SWQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9wZXJ0eURpc3BhdGNoZXIuX19zdXBlcl9fLnB1c2guY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcblxuICAgIFByb3BlcnR5RGlzcGF0Y2hlci5wcm90b3R5cGUubWF5YmVTdWJTb3VyY2UgPSBmdW5jdGlvbihzaW5rLCByZXBseSkge1xuICAgICAgaWYgKHJlcGx5ID09PSBCYWNvbi5ub01vcmUpIHtcbiAgICAgICAgcmV0dXJuIG5vcDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wZXJ0eUVuZGVkKSB7XG4gICAgICAgIHNpbmsoZW5kRXZlbnQoKSk7XG4gICAgICAgIHJldHVybiBub3A7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gRGlzcGF0Y2hlci5wcm90b3R5cGUuc3Vic2NyaWJlLmNhbGwodGhpcywgc2luayk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFByb3BlcnR5RGlzcGF0Y2hlci5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24oc2luaykge1xuICAgICAgdmFyIGRpc3BhdGNoaW5nSWQsIGluaXRTZW50LCByZXBseSwgdmFsSWQ7XG4gICAgICBpbml0U2VudCA9IGZhbHNlO1xuICAgICAgcmVwbHkgPSBCYWNvbi5tb3JlO1xuICAgICAgaWYgKHRoaXMuY3VycmVudC5pc0RlZmluZWQgJiYgKHRoaXMuaGFzU3Vic2NyaWJlcnMoKSB8fCB0aGlzLnByb3BlcnR5RW5kZWQpKSB7XG4gICAgICAgIGRpc3BhdGNoaW5nSWQgPSBVcGRhdGVCYXJyaWVyLmN1cnJlbnRFdmVudElkKCk7XG4gICAgICAgIHZhbElkID0gdGhpcy5jdXJyZW50VmFsdWVSb290SWQ7XG4gICAgICAgIGlmICghdGhpcy5wcm9wZXJ0eUVuZGVkICYmIHZhbElkICYmIGRpc3BhdGNoaW5nSWQgJiYgZGlzcGF0Y2hpbmdJZCAhPT0gdmFsSWQpIHtcbiAgICAgICAgICBVcGRhdGVCYXJyaWVyLndoZW5Eb25lV2l0aCh0aGlzLnByb3BlcnR5LCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKF90aGlzLmN1cnJlbnRWYWx1ZVJvb3RJZCA9PT0gdmFsSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2luayhpbml0aWFsRXZlbnQoX3RoaXMuY3VycmVudC5nZXQoKS52YWx1ZSgpKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcykpO1xuICAgICAgICAgIHJldHVybiB0aGlzLm1heWJlU3ViU291cmNlKHNpbmssIHJlcGx5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBVcGRhdGVCYXJyaWVyLmluVHJhbnNhY3Rpb24odm9pZCAwLCB0aGlzLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVwbHkgPSBzaW5rKGluaXRpYWxFdmVudCh0aGlzLmN1cnJlbnQuZ2V0KCkudmFsdWUoKSkpO1xuICAgICAgICAgIH0pLCBbXSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubWF5YmVTdWJTb3VyY2Uoc2luaywgcmVwbHkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXliZVN1YlNvdXJjZShzaW5rLCByZXBseSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBQcm9wZXJ0eURpc3BhdGNoZXI7XG5cbiAgfSkoRGlzcGF0Y2hlcik7XG5cbiAgUHJvcGVydHkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChQcm9wZXJ0eSwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBQcm9wZXJ0eShkZXNjLCBzdWJzY3JpYmUsIGhhbmRsZXIpIHtcbiAgICAgIFByb3BlcnR5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIGRlc2MpO1xuICAgICAgYXNzZXJ0RnVuY3Rpb24oc3Vic2NyaWJlKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBQcm9wZXJ0eURpc3BhdGNoZXIodGhpcywgc3Vic2NyaWJlLCBoYW5kbGVyKTtcbiAgICAgIHJlZ2lzdGVyT2JzKHRoaXMpO1xuICAgIH1cblxuICAgIFByb3BlcnR5LnByb3RvdHlwZS5jaGFuZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEV2ZW50U3RyZWFtKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiY2hhbmdlc1wiLCBbXSksIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2luaykge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5kaXNwYXRjaGVyLnN1YnNjcmliZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKCFldmVudC5pc0luaXRpYWwoKSkge1xuICAgICAgICAgICAgICByZXR1cm4gc2luayhldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfTtcblxuICAgIFByb3BlcnR5LnByb3RvdHlwZS53aXRoSGFuZGxlciA9IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvcGVydHkobmV3IEJhY29uLkRlc2ModGhpcywgXCJ3aXRoSGFuZGxlclwiLCBbaGFuZGxlcl0pLCB0aGlzLmRpc3BhdGNoZXIuc3Vic2NyaWJlLCBoYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgUHJvcGVydHkucHJvdG90eXBlLnRvUHJvcGVydHkgPSBmdW5jdGlvbigpIHtcbiAgICAgIGFzc2VydE5vQXJndW1lbnRzKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgUHJvcGVydHkucHJvdG90eXBlLnRvRXZlbnRTdHJlYW0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2ModGhpcywgXCJ0b0V2ZW50U3RyZWFtXCIsIFtdKSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzaW5rKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmRpc3BhdGNoZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNJbml0aWFsKCkpIHtcbiAgICAgICAgICAgICAgZXZlbnQgPSBldmVudC50b05leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzaW5rKGV2ZW50KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFByb3BlcnR5O1xuXG4gIH0pKE9ic2VydmFibGUpO1xuXG4gIEJhY29uLlByb3BlcnR5ID0gUHJvcGVydHk7XG5cbiAgQmFjb24uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgUHJvcGVydHkobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiY29uc3RhbnRcIiwgW3ZhbHVlXSksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHNpbmsoaW5pdGlhbEV2ZW50KHZhbHVlKSk7XG4gICAgICBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgcmV0dXJuIG5vcDtcbiAgICB9KTtcbiAgfTtcblxuICBCYWNvbi5mcm9tQmluZGVyID0gZnVuY3Rpb24oYmluZGVyLCBldmVudFRyYW5zZm9ybWVyKSB7XG4gICAgaWYgKGV2ZW50VHJhbnNmb3JtZXIgPT0gbnVsbCkge1xuICAgICAgZXZlbnRUcmFuc2Zvcm1lciA9IF8uaWQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2MoQmFjb24sIFwiZnJvbUJpbmRlclwiLCBbYmluZGVyLCBldmVudFRyYW5zZm9ybWVyXSksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHZhciBzaG91bGRVbmJpbmQsIHVuYmluZCwgdW5iaW5kZXIsIHVuYm91bmQ7XG4gICAgICB1bmJvdW5kID0gZmFsc2U7XG4gICAgICBzaG91bGRVbmJpbmQgPSBmYWxzZTtcbiAgICAgIHVuYmluZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXVuYm91bmQpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHVuYmluZGVyICE9PSBcInVuZGVmaW5lZFwiICYmIHVuYmluZGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICB1bmJpbmRlcigpO1xuICAgICAgICAgICAgcmV0dXJuIHVuYm91bmQgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2hvdWxkVW5iaW5kID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB1bmJpbmRlciA9IGJpbmRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MsIGV2ZW50LCBqLCBsZW4xLCByZXBseSwgdmFsdWU7XG4gICAgICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgICAgdmFsdWUgPSBldmVudFRyYW5zZm9ybWVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICBpZiAoIShpc0FycmF5KHZhbHVlKSAmJiBfLmxhc3QodmFsdWUpIGluc3RhbmNlb2YgRXZlbnQpKSB7XG4gICAgICAgICAgdmFsdWUgPSBbdmFsdWVdO1xuICAgICAgICB9XG4gICAgICAgIHJlcGx5ID0gQmFjb24ubW9yZTtcbiAgICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHZhbHVlLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICAgIGV2ZW50ID0gdmFsdWVbal07XG4gICAgICAgICAgcmVwbHkgPSBzaW5rKGV2ZW50ID0gdG9FdmVudChldmVudCkpO1xuICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlIHx8IGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICAgIHVuYmluZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcGx5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVwbHk7XG4gICAgICB9KTtcbiAgICAgIGlmIChzaG91bGRVbmJpbmQpIHtcbiAgICAgICAgdW5iaW5kKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5iaW5kO1xuICAgIH0pO1xuICB9O1xuXG4gIGV2ZW50TWV0aG9kcyA9IFtbXCJhZGRFdmVudExpc3RlbmVyXCIsIFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiXSwgW1wiYWRkTGlzdGVuZXJcIiwgXCJyZW1vdmVMaXN0ZW5lclwiXSwgW1wib25cIiwgXCJvZmZcIl0sIFtcImJpbmRcIiwgXCJ1bmJpbmRcIl1dO1xuXG4gIGZpbmRIYW5kbGVyTWV0aG9kcyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHZhciBqLCBsZW4xLCBtZXRob2RQYWlyLCBwYWlyO1xuICAgIGZvciAoaiA9IDAsIGxlbjEgPSBldmVudE1ldGhvZHMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICBwYWlyID0gZXZlbnRNZXRob2RzW2pdO1xuICAgICAgbWV0aG9kUGFpciA9IFt0YXJnZXRbcGFpclswXV0sIHRhcmdldFtwYWlyWzFdXV07XG4gICAgICBpZiAobWV0aG9kUGFpclswXSAmJiBtZXRob2RQYWlyWzFdKSB7XG4gICAgICAgIHJldHVybiBtZXRob2RQYWlyO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzdWl0YWJsZSBldmVudCBtZXRob2RzIGluIFwiICsgdGFyZ2V0KTtcbiAgfTtcblxuICBCYWNvbi5mcm9tRXZlbnRUYXJnZXQgPSBmdW5jdGlvbih0YXJnZXQsIGV2ZW50TmFtZSwgZXZlbnRUcmFuc2Zvcm1lcikge1xuICAgIHZhciByZWYsIHN1YiwgdW5zdWI7XG4gICAgcmVmID0gZmluZEhhbmRsZXJNZXRob2RzKHRhcmdldCksIHN1YiA9IHJlZlswXSwgdW5zdWIgPSByZWZbMV07XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcImZyb21FdmVudFwiLCBbdGFyZ2V0LCBldmVudE5hbWVdKSwgQmFjb24uZnJvbUJpbmRlcihmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgICBzdWIuY2FsbCh0YXJnZXQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB1bnN1Yi5jYWxsKHRhcmdldCwgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgICAgIH07XG4gICAgfSwgZXZlbnRUcmFuc2Zvcm1lcikpO1xuICB9O1xuXG4gIEJhY29uLmZyb21FdmVudCA9IEJhY29uLmZyb21FdmVudFRhcmdldDtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgcDtcbiAgICBwID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgcmV0dXJuIGNvbnZlcnRBcmdzVG9GdW5jdGlvbih0aGlzLCBwLCBhcmdzLCBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJtYXBcIiwgW2ZdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50LmZtYXAoZikpO1xuICAgICAgfSkpO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLmNvbWJpbmVBc0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGluZGV4LCBqLCBsZW4xLCBzLCBzb3VyY2VzLCBzdHJlYW0sIHN0cmVhbXM7XG4gICAgc3RyZWFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIGlmIChzdHJlYW1zLmxlbmd0aCA9PT0gMSAmJiBpc0FycmF5KHN0cmVhbXNbMF0pKSB7XG4gICAgICBzdHJlYW1zID0gc3RyZWFtc1swXTtcbiAgICB9XG4gICAgZm9yIChpbmRleCA9IGogPSAwLCBsZW4xID0gc3RyZWFtcy5sZW5ndGg7IGogPCBsZW4xOyBpbmRleCA9ICsraikge1xuICAgICAgc3RyZWFtID0gc3RyZWFtc1tpbmRleF07XG4gICAgICBpZiAoIShpc09ic2VydmFibGUoc3RyZWFtKSkpIHtcbiAgICAgICAgc3RyZWFtc1tpbmRleF0gPSBCYWNvbi5jb25zdGFudChzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3RyZWFtcy5sZW5ndGgpIHtcbiAgICAgIHNvdXJjZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBrLCBsZW4yLCByZXN1bHRzO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoayA9IDAsIGxlbjIgPSBzdHJlYW1zLmxlbmd0aDsgayA8IGxlbjI7IGsrKykge1xuICAgICAgICAgIHMgPSBzdHJlYW1zW2tdO1xuICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU291cmNlKHMsIHRydWUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pKCk7XG4gICAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiY29tYmluZUFzQXJyYXlcIiwgc3RyZWFtcyksIEJhY29uLndoZW4oc291cmNlcywgKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgeHM7XG4gICAgICAgIHhzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICAgIHJldHVybiB4cztcbiAgICAgIH0pKS50b1Byb3BlcnR5KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gQmFjb24uY29uc3RhbnQoW10pO1xuICAgIH1cbiAgfTtcblxuICBCYWNvbi5vblZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmLCBqLCBzdHJlYW1zO1xuICAgIHN0cmVhbXMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgaiA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChqID0gMCwgW10pLCBmID0gYXJndW1lbnRzW2orK107XG4gICAgcmV0dXJuIEJhY29uLmNvbWJpbmVBc0FycmF5KHN0cmVhbXMpLm9uVmFsdWVzKGYpO1xuICB9O1xuXG4gIEJhY29uLmNvbWJpbmVXaXRoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGYsIHN0cmVhbXM7XG4gICAgZiA9IGFyZ3VtZW50c1swXSwgc3RyZWFtcyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJjb21iaW5lV2l0aFwiLCBbZl0uY29uY2F0KHNsaWNlLmNhbGwoc3RyZWFtcykpKSwgQmFjb24uY29tYmluZUFzQXJyYXkoc3RyZWFtcykubWFwKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgcmV0dXJuIGYuYXBwbHkobnVsbCwgdmFsdWVzKTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uY29tYmluZVRlbXBsYXRlID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICB2YXIgYXBwbHlTdHJlYW1WYWx1ZSwgY29tYmluYXRvciwgY29tcGlsZSwgY29tcGlsZVRlbXBsYXRlLCBjb25zdGFudFZhbHVlLCBjdXJyZW50LCBmdW5jcywgbWtDb250ZXh0LCBzZXRWYWx1ZSwgc3RyZWFtcztcbiAgICBmdW5jcyA9IFtdO1xuICAgIHN0cmVhbXMgPSBbXTtcbiAgICBjdXJyZW50ID0gZnVuY3Rpb24oY3R4U3RhY2spIHtcbiAgICAgIHJldHVybiBjdHhTdGFja1tjdHhTdGFjay5sZW5ndGggLSAxXTtcbiAgICB9O1xuICAgIHNldFZhbHVlID0gZnVuY3Rpb24oY3R4U3RhY2ssIGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBjdXJyZW50KGN0eFN0YWNrKVtrZXldID0gdmFsdWU7XG4gICAgfTtcbiAgICBhcHBseVN0cmVhbVZhbHVlID0gZnVuY3Rpb24oa2V5LCBpbmRleCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGN0eFN0YWNrLCB2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIHNldFZhbHVlKGN0eFN0YWNrLCBrZXksIHZhbHVlc1tpbmRleF0pO1xuICAgICAgfTtcbiAgICB9O1xuICAgIGNvbnN0YW50VmFsdWUgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oY3R4U3RhY2spIHtcbiAgICAgICAgcmV0dXJuIHNldFZhbHVlKGN0eFN0YWNrLCBrZXksIHZhbHVlKTtcbiAgICAgIH07XG4gICAgfTtcbiAgICBta0NvbnRleHQgPSBmdW5jdGlvbih0ZW1wbGF0ZSkge1xuICAgICAgaWYgKGlzQXJyYXkodGVtcGxhdGUpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbXBpbGUgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgcG9wQ29udGV4dCwgcHVzaENvbnRleHQ7XG4gICAgICBpZiAoaXNPYnNlcnZhYmxlKHZhbHVlKSkge1xuICAgICAgICBzdHJlYW1zLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gZnVuY3MucHVzaChhcHBseVN0cmVhbVZhbHVlKGtleSwgc3RyZWFtcy5sZW5ndGggLSAxKSk7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBPYmplY3QodmFsdWUpICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiICYmICEodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApICYmICEodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgICBwdXNoQ29udGV4dCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihjdHhTdGFjaykge1xuICAgICAgICAgICAgdmFyIG5ld0NvbnRleHQ7XG4gICAgICAgICAgICBuZXdDb250ZXh0ID0gbWtDb250ZXh0KHZhbHVlKTtcbiAgICAgICAgICAgIHNldFZhbHVlKGN0eFN0YWNrLCBrZXksIG5ld0NvbnRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIGN0eFN0YWNrLnB1c2gobmV3Q29udGV4dCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgcG9wQ29udGV4dCA9IGZ1bmN0aW9uKGN0eFN0YWNrKSB7XG4gICAgICAgICAgcmV0dXJuIGN0eFN0YWNrLnBvcCgpO1xuICAgICAgICB9O1xuICAgICAgICBmdW5jcy5wdXNoKHB1c2hDb250ZXh0KGtleSkpO1xuICAgICAgICBjb21waWxlVGVtcGxhdGUodmFsdWUpO1xuICAgICAgICByZXR1cm4gZnVuY3MucHVzaChwb3BDb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmdW5jcy5wdXNoKGNvbnN0YW50VmFsdWUoa2V5LCB2YWx1ZSkpO1xuICAgICAgfVxuICAgIH07XG4gICAgY29tcGlsZVRlbXBsYXRlID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICAgIHJldHVybiBfLmVhY2godGVtcGxhdGUsIGNvbXBpbGUpO1xuICAgIH07XG4gICAgY29tcGlsZVRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICBjb21iaW5hdG9yID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICB2YXIgY3R4U3RhY2ssIGYsIGosIGxlbjEsIHJvb3RDb250ZXh0O1xuICAgICAgcm9vdENvbnRleHQgPSBta0NvbnRleHQodGVtcGxhdGUpO1xuICAgICAgY3R4U3RhY2sgPSBbcm9vdENvbnRleHRdO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IGZ1bmNzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICBmID0gZnVuY3Nbal07XG4gICAgICAgIGYoY3R4U3RhY2ssIHZhbHVlcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcm9vdENvbnRleHQ7XG4gICAgfTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiY29tYmluZVRlbXBsYXRlXCIsIFt0ZW1wbGF0ZV0pLCBCYWNvbi5jb21iaW5lQXNBcnJheShzdHJlYW1zKS5tYXAoY29tYmluYXRvcikpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmNvbWJpbmUgPSBmdW5jdGlvbihvdGhlciwgZikge1xuICAgIHZhciBjb21iaW5hdG9yO1xuICAgIGNvbWJpbmF0b3IgPSB0b0NvbWJpbmF0b3IoZik7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiY29tYmluZVwiLCBbb3RoZXIsIGZdKSwgQmFjb24uY29tYmluZUFzQXJyYXkodGhpcywgb3RoZXIpLm1hcChmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgIHJldHVybiBjb21iaW5hdG9yKHZhbHVlc1swXSwgdmFsdWVzWzFdKTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZGVjb2RlID0gZnVuY3Rpb24oY2FzZXMpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJkZWNvZGVcIiwgW2Nhc2VzXSksIHRoaXMuY29tYmluZShCYWNvbi5jb21iaW5lVGVtcGxhdGUoY2FzZXMpLCBmdW5jdGlvbihrZXksIHZhbHVlcykge1xuICAgICAgcmV0dXJuIHZhbHVlc1trZXldO1xuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS53aXRoU3RhdGVNYWNoaW5lID0gZnVuY3Rpb24oaW5pdFN0YXRlLCBmKSB7XG4gICAgdmFyIHN0YXRlO1xuICAgIHN0YXRlID0gaW5pdFN0YXRlO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcIndpdGhTdGF0ZU1hY2hpbmVcIiwgW2luaXRTdGF0ZSwgZl0pLCB0aGlzLndpdGhIYW5kbGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZnJvbUYsIGosIGxlbjEsIG5ld1N0YXRlLCBvdXRwdXQsIG91dHB1dHMsIHJlcGx5O1xuICAgICAgZnJvbUYgPSBmKHN0YXRlLCBldmVudCk7XG4gICAgICBuZXdTdGF0ZSA9IGZyb21GWzBdLCBvdXRwdXRzID0gZnJvbUZbMV07XG4gICAgICBzdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgcmVwbHkgPSBCYWNvbi5tb3JlO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IG91dHB1dHMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgIG91dHB1dCA9IG91dHB1dHNbal07XG4gICAgICAgIHJlcGx5ID0gdGhpcy5wdXNoKG91dHB1dCk7XG4gICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVwbHk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLnNraXBEdXBsaWNhdGVzID0gZnVuY3Rpb24oaXNFcXVhbCkge1xuICAgIGlmIChpc0VxdWFsID09IG51bGwpIHtcbiAgICAgIGlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhID09PSBiO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwic2tpcER1cGxpY2F0ZXNcIiwgW10pLCB0aGlzLndpdGhTdGF0ZU1hY2hpbmUoTm9uZSwgZnVuY3Rpb24ocHJldiwgZXZlbnQpIHtcbiAgICAgIGlmICghZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICByZXR1cm4gW3ByZXYsIFtldmVudF1dO1xuICAgICAgfSBlbHNlIGlmIChldmVudC5pc0luaXRpYWwoKSB8fCBwcmV2ID09PSBOb25lIHx8ICFpc0VxdWFsKHByZXYuZ2V0KCksIGV2ZW50LnZhbHVlKCkpKSB7XG4gICAgICAgIHJldHVybiBbbmV3IFNvbWUoZXZlbnQudmFsdWUoKSksIFtldmVudF1dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtwcmV2LCBbXV07XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmF3YWl0aW5nID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJhd2FpdGluZ1wiLCBbb3RoZXJdKSwgQmFjb24uZ3JvdXBTaW11bHRhbmVvdXModGhpcywgb3RoZXIpLm1hcChmdW5jdGlvbihhcmcpIHtcbiAgICAgIHZhciBteVZhbHVlcywgb3RoZXJWYWx1ZXM7XG4gICAgICBteVZhbHVlcyA9IGFyZ1swXSwgb3RoZXJWYWx1ZXMgPSBhcmdbMV07XG4gICAgICByZXR1cm4gb3RoZXJWYWx1ZXMubGVuZ3RoID09PSAwO1xuICAgIH0pLnRvUHJvcGVydHkoZmFsc2UpLnNraXBEdXBsaWNhdGVzKCkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLm5vdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcIm5vdFwiLCBbXSksIHRoaXMubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiAheDtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uUHJvcGVydHkucHJvdG90eXBlLmFuZCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYW5kXCIsIFtvdGhlcl0pLCB0aGlzLmNvbWJpbmUob3RoZXIsIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHJldHVybiB4ICYmIHk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLlByb3BlcnR5LnByb3RvdHlwZS5vciA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwib3JcIiwgW290aGVyXSksIHRoaXMuY29tYmluZShvdGhlciwgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgcmV0dXJuIHggfHwgeTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uc2NoZWR1bGVyID0ge1xuICAgIHNldFRpbWVvdXQ6IGZ1bmN0aW9uKGYsIGQpIHtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KGYsIGQpO1xuICAgIH0sXG4gICAgc2V0SW50ZXJ2YWw6IGZ1bmN0aW9uKGYsIGkpIHtcbiAgICAgIHJldHVybiBzZXRJbnRlcnZhbChmLCBpKTtcbiAgICB9LFxuICAgIGNsZWFySW50ZXJ2YWw6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgfSxcbiAgICBjbGVhclRpbWVvdXQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KGlkKTtcbiAgICB9LFxuICAgIG5vdzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5idWZmZXJXaXRoVGltZSA9IGZ1bmN0aW9uKGRlbGF5KSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYnVmZmVyV2l0aFRpbWVcIiwgW2RlbGF5XSksIHRoaXMuYnVmZmVyV2l0aFRpbWVPckNvdW50KGRlbGF5LCBOdW1iZXIuTUFYX1ZBTFVFKSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLmJ1ZmZlcldpdGhDb3VudCA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYnVmZmVyV2l0aENvdW50XCIsIFtjb3VudF0pLCB0aGlzLmJ1ZmZlcldpdGhUaW1lT3JDb3VudCh2b2lkIDAsIGNvdW50KSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLmJ1ZmZlcldpdGhUaW1lT3JDb3VudCA9IGZ1bmN0aW9uKGRlbGF5LCBjb3VudCkge1xuICAgIHZhciBmbHVzaE9yU2NoZWR1bGU7XG4gICAgZmx1c2hPclNjaGVkdWxlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICBpZiAoYnVmZmVyLnZhbHVlcy5sZW5ndGggPT09IGNvdW50KSB7XG4gICAgICAgIHJldHVybiBidWZmZXIuZmx1c2goKTtcbiAgICAgIH0gZWxzZSBpZiAoZGVsYXkgIT09IHZvaWQgMCkge1xuICAgICAgICByZXR1cm4gYnVmZmVyLnNjaGVkdWxlKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJidWZmZXJXaXRoVGltZU9yQ291bnRcIiwgW2RlbGF5LCBjb3VudF0pLCB0aGlzLmJ1ZmZlcihkZWxheSwgZmx1c2hPclNjaGVkdWxlLCBmbHVzaE9yU2NoZWR1bGUpKTtcbiAgfTtcblxuICBCYWNvbi5FdmVudFN0cmVhbS5wcm90b3R5cGUuYnVmZmVyID0gZnVuY3Rpb24oZGVsYXksIG9uSW5wdXQsIG9uRmx1c2gpIHtcbiAgICB2YXIgYnVmZmVyLCBkZWxheU1zLCByZXBseTtcbiAgICBpZiAob25JbnB1dCA9PSBudWxsKSB7XG4gICAgICBvbklucHV0ID0gbm9wO1xuICAgIH1cbiAgICBpZiAob25GbHVzaCA9PSBudWxsKSB7XG4gICAgICBvbkZsdXNoID0gbm9wO1xuICAgIH1cbiAgICBidWZmZXIgPSB7XG4gICAgICBzY2hlZHVsZWQ6IG51bGwsXG4gICAgICBlbmQ6IHZvaWQgMCxcbiAgICAgIHZhbHVlczogW10sXG4gICAgICBmbHVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXBseTtcbiAgICAgICAgaWYgKHRoaXMuc2NoZWR1bGVkKSB7XG4gICAgICAgICAgQmFjb24uc2NoZWR1bGVyLmNsZWFyVGltZW91dCh0aGlzLnNjaGVkdWxlZCk7XG4gICAgICAgICAgdGhpcy5zY2hlZHVsZWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnZhbHVlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmVwbHkgPSB0aGlzLnB1c2gobmV4dEV2ZW50KHRoaXMudmFsdWVzKSk7XG4gICAgICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcbiAgICAgICAgICBpZiAodGhpcy5lbmQgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVzaCh0aGlzLmVuZCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZXBseSAhPT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICByZXR1cm4gb25GbHVzaCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuZW5kICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnB1c2godGhpcy5lbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNjaGVkdWxlZCA9IGRlbGF5KChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZmx1c2goKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICByZXBseSA9IEJhY29uLm1vcmU7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZGVsYXkpKSB7XG4gICAgICBkZWxheU1zID0gZGVsYXk7XG4gICAgICBkZWxheSA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIEJhY29uLnNjaGVkdWxlci5zZXRUaW1lb3V0KGYsIGRlbGF5TXMpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYnVmZmVyXCIsIFtdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgYnVmZmVyLnB1c2ggPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBpZiAoZXZlbnQuaXNFcnJvcigpKSB7XG4gICAgICAgIHJlcGx5ID0gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICBidWZmZXIuZW5kID0gZXZlbnQ7XG4gICAgICAgIGlmICghYnVmZmVyLnNjaGVkdWxlZCkge1xuICAgICAgICAgIGJ1ZmZlci5mbHVzaCgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWZmZXIudmFsdWVzLnB1c2goZXZlbnQudmFsdWUoKSk7XG4gICAgICAgIG9uSW5wdXQoYnVmZmVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXBseTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGY7XG4gICAgZiA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGFzc2VydE9ic2VydmFibGVJc1Byb3BlcnR5KGYpO1xuICAgIHJldHVybiBjb252ZXJ0QXJnc1RvRnVuY3Rpb24odGhpcywgZiwgYXJncywgZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZmlsdGVyXCIsIFtmXSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmZpbHRlcihmKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH07XG5cbiAgQmFjb24ub25jZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBFdmVudFN0cmVhbShuZXcgRGVzYyhCYWNvbiwgXCJvbmNlXCIsIFt2YWx1ZV0pLCBmdW5jdGlvbihzaW5rKSB7XG4gICAgICBzaW5rKHRvRXZlbnQodmFsdWUpKTtcbiAgICAgIHNpbmsoZW5kRXZlbnQoKSk7XG4gICAgICByZXR1cm4gbm9wO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5jb25jYXQgPSBmdW5jdGlvbihyaWdodCkge1xuICAgIHZhciBsZWZ0O1xuICAgIGxlZnQgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2MobGVmdCwgXCJjb25jYXRcIiwgW3JpZ2h0XSksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHZhciB1bnN1YkxlZnQsIHVuc3ViUmlnaHQ7XG4gICAgICB1bnN1YlJpZ2h0ID0gbm9wO1xuICAgICAgdW5zdWJMZWZ0ID0gbGVmdC5kaXNwYXRjaGVyLnN1YnNjcmliZShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLmlzRW5kKCkpIHtcbiAgICAgICAgICByZXR1cm4gdW5zdWJSaWdodCA9IHJpZ2h0LmRpc3BhdGNoZXIuc3Vic2NyaWJlKHNpbmspO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzaW5rKGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdW5zdWJMZWZ0KCk7XG4gICAgICAgIHJldHVybiB1bnN1YlJpZ2h0KCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmZsYXRNYXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmxhdE1hcF8odGhpcywgbWFrZVNwYXduZXIoYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZmxhdE1hcEZpcnN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZsYXRNYXBfKHRoaXMsIG1ha2VTcGF3bmVyKGFyZ3VtZW50cyksIHRydWUpO1xuICB9O1xuXG4gIGZsYXRNYXBfID0gZnVuY3Rpb24ocm9vdCwgZiwgZmlyc3RPbmx5LCBsaW1pdCkge1xuICAgIHZhciBjaGlsZERlcHMsIHJlc3VsdCwgcm9vdERlcDtcbiAgICByb290RGVwID0gW3Jvb3RdO1xuICAgIGNoaWxkRGVwcyA9IFtdO1xuICAgIHJlc3VsdCA9IG5ldyBFdmVudFN0cmVhbShuZXcgQmFjb24uRGVzYyhyb290LCBcImZsYXRNYXBcIiArIChmaXJzdE9ubHkgPyBcIkZpcnN0XCIgOiBcIlwiKSwgW2ZdKSwgZnVuY3Rpb24oc2luaykge1xuICAgICAgdmFyIGNoZWNrRW5kLCBjaGVja1F1ZXVlLCBjb21wb3NpdGUsIHF1ZXVlLCBzcGF3bjtcbiAgICAgIGNvbXBvc2l0ZSA9IG5ldyBDb21wb3NpdGVVbnN1YnNjcmliZSgpO1xuICAgICAgcXVldWUgPSBbXTtcbiAgICAgIHNwYXduID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGNoaWxkO1xuICAgICAgICBjaGlsZCA9IG1ha2VPYnNlcnZhYmxlKGYoZXZlbnQudmFsdWUoKSkpO1xuICAgICAgICBjaGlsZERlcHMucHVzaChjaGlsZCk7XG4gICAgICAgIHJldHVybiBjb21wb3NpdGUuYWRkKGZ1bmN0aW9uKHVuc3ViQWxsLCB1bnN1Yk1lKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkLmRpc3BhdGNoZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgcmVwbHk7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICAgICAgICBfLnJlbW92ZShjaGlsZCwgY2hpbGREZXBzKTtcbiAgICAgICAgICAgICAgY2hlY2tRdWV1ZSgpO1xuICAgICAgICAgICAgICBjaGVja0VuZCh1bnN1Yk1lKTtcbiAgICAgICAgICAgICAgcmV0dXJuIEJhY29uLm5vTW9yZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChldmVudCBpbnN0YW5jZW9mIEluaXRpYWwpIHtcbiAgICAgICAgICAgICAgICBldmVudCA9IGV2ZW50LnRvTmV4dCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlcGx5ID0gc2luayhldmVudCk7XG4gICAgICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICAgICAgdW5zdWJBbGwoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmVwbHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIGNoZWNrUXVldWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50O1xuICAgICAgICBldmVudCA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgIHJldHVybiBzcGF3bihldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjaGVja0VuZCA9IGZ1bmN0aW9uKHVuc3ViKSB7XG4gICAgICAgIHVuc3ViKCk7XG4gICAgICAgIGlmIChjb21wb3NpdGUuZW1wdHkoKSkge1xuICAgICAgICAgIHJldHVybiBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29tcG9zaXRlLmFkZChmdW5jdGlvbihfXywgdW5zdWJSb290KSB7XG4gICAgICAgIHJldHVybiByb290LmRpc3BhdGNoZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGVja0VuZCh1bnN1YlJvb3QpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuaXNFcnJvcigpKSB7XG4gICAgICAgICAgICByZXR1cm4gc2luayhldmVudCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChmaXJzdE9ubHkgJiYgY29tcG9zaXRlLmNvdW50KCkgPiAxKSB7XG4gICAgICAgICAgICByZXR1cm4gQmFjb24ubW9yZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvbXBvc2l0ZS51bnN1YnNjcmliZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIEJhY29uLm5vTW9yZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBjb21wb3NpdGUuY291bnQoKSA+IGxpbWl0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBxdWV1ZS5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBzcGF3bihldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvbXBvc2l0ZS51bnN1YnNjcmliZTtcbiAgICB9KTtcbiAgICByZXN1bHQuaW50ZXJuYWxEZXBzID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY2hpbGREZXBzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gcm9vdERlcC5jb25jYXQoY2hpbGREZXBzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByb290RGVwO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICBtYWtlU3Bhd25lciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEgJiYgaXNPYnNlcnZhYmxlKGFyZ3NbMF0pKSB7XG4gICAgICByZXR1cm4gXy5hbHdheXMoYXJnc1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYWtlRnVuY3Rpb25BcmdzKGFyZ3MpO1xuICAgIH1cbiAgfTtcblxuICBtYWtlT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoaXNPYnNlcnZhYmxlKHgpKSB7XG4gICAgICByZXR1cm4geDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEJhY29uLm9uY2UoeCk7XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmZsYXRNYXBXaXRoQ29uY3VycmVuY3lMaW1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBsaW1pdDtcbiAgICBsaW1pdCA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImZsYXRNYXBXaXRoQ29uY3VycmVuY3lMaW1pdFwiLCBbbGltaXRdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3MpKSksIGZsYXRNYXBfKHRoaXMsIG1ha2VTcGF3bmVyKGFyZ3MpLCBmYWxzZSwgbGltaXQpKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5mbGF0TWFwQ29uY2F0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZmxhdE1hcENvbmNhdFwiLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKSwgdGhpcy5mbGF0TWFwV2l0aENvbmN1cnJlbmN5TGltaXQuYXBwbHkodGhpcywgWzFdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKSk7XG4gIH07XG5cbiAgQmFjb24ubGF0ZXIgPSBmdW5jdGlvbihkZWxheSwgdmFsdWUpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwibGF0ZXJcIiwgW2RlbGF5LCB2YWx1ZV0pLCBCYWNvbi5mcm9tQmluZGVyKGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHZhciBpZCwgc2VuZGVyO1xuICAgICAgc2VuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzaW5rKFt2YWx1ZSwgZW5kRXZlbnQoKV0pO1xuICAgICAgfTtcbiAgICAgIGlkID0gQmFjb24uc2NoZWR1bGVyLnNldFRpbWVvdXQoc2VuZGVyLCBkZWxheSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBCYWNvbi5zY2hlZHVsZXIuY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgIH07XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmJ1ZmZlcmluZ1Rocm90dGxlID0gZnVuY3Rpb24obWluaW11bUludGVydmFsKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYnVmZmVyaW5nVGhyb3R0bGVcIiwgW21pbmltdW1JbnRlcnZhbF0pLCB0aGlzLmZsYXRNYXBDb25jYXQoZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIEJhY29uLm9uY2UoeCkuY29uY2F0KEJhY29uLmxhdGVyKG1pbmltdW1JbnRlcnZhbCkuZmlsdGVyKGZhbHNlKSk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLlByb3BlcnR5LnByb3RvdHlwZS5idWZmZXJpbmdUaHJvdHRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5idWZmZXJpbmdUaHJvdHRsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLnRvUHJvcGVydHkoKTtcbiAgfTtcblxuICBCdXMgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChCdXMsIHN1cGVyQ2xhc3MpO1xuXG4gICAgZnVuY3Rpb24gQnVzKCkge1xuICAgICAgdGhpcy5ndWFyZGVkU2luayA9IGJpbmQodGhpcy5ndWFyZGVkU2luaywgdGhpcyk7XG4gICAgICB0aGlzLnN1YnNjcmliZUFsbCA9IGJpbmQodGhpcy5zdWJzY3JpYmVBbGwsIHRoaXMpO1xuICAgICAgdGhpcy51bnN1YkFsbCA9IGJpbmQodGhpcy51bnN1YkFsbCwgdGhpcyk7XG4gICAgICB0aGlzLnNpbmsgPSB2b2lkIDA7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgIHRoaXMuZW5kZWQgPSBmYWxzZTtcbiAgICAgIEJ1cy5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJCdXNcIiwgW10pLCB0aGlzLnN1YnNjcmliZUFsbCk7XG4gICAgfVxuXG4gICAgQnVzLnByb3RvdHlwZS51bnN1YkFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGosIGxlbjEsIHJlZiwgc3ViO1xuICAgICAgcmVmID0gdGhpcy5zdWJzY3JpcHRpb25zO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHJlZi5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgc3ViID0gcmVmW2pdO1xuICAgICAgICBpZiAodHlwZW9mIHN1Yi51bnN1YiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgc3ViLnVuc3ViKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfTtcblxuICAgIEJ1cy5wcm90b3R5cGUuc3Vic2NyaWJlQWxsID0gZnVuY3Rpb24obmV3U2luaykge1xuICAgICAgdmFyIGosIGxlbjEsIHJlZiwgc3Vic2NyaXB0aW9uO1xuICAgICAgaWYgKHRoaXMuZW5kZWQpIHtcbiAgICAgICAgbmV3U2luayhlbmRFdmVudCgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2luayA9IG5ld1Npbms7XG4gICAgICAgIHJlZiA9IGNsb25lQXJyYXkodGhpcy5zdWJzY3JpcHRpb25zKTtcbiAgICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHJlZi5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgICBzdWJzY3JpcHRpb24gPSByZWZbal07XG4gICAgICAgICAgdGhpcy5zdWJzY3JpYmVJbnB1dChzdWJzY3JpcHRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy51bnN1YkFsbDtcbiAgICB9O1xuXG4gICAgQnVzLnByb3RvdHlwZS5ndWFyZGVkU2luayA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGlmIChldmVudC5pc0VuZCgpKSB7XG4gICAgICAgICAgICBfdGhpcy51bnN1YnNjcmliZUlucHV0KGlucHV0KTtcbiAgICAgICAgICAgIHJldHVybiBCYWNvbi5ub01vcmU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5zaW5rKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgQnVzLnByb3RvdHlwZS5zdWJzY3JpYmVJbnB1dCA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbikge1xuICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbi51bnN1YiA9IHN1YnNjcmlwdGlvbi5pbnB1dC5kaXNwYXRjaGVyLnN1YnNjcmliZSh0aGlzLmd1YXJkZWRTaW5rKHN1YnNjcmlwdGlvbi5pbnB1dCkpO1xuICAgIH07XG5cbiAgICBCdXMucHJvdG90eXBlLnVuc3Vic2NyaWJlSW5wdXQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgdmFyIGksIGosIGxlbjEsIHJlZiwgc3ViO1xuICAgICAgcmVmID0gdGhpcy5zdWJzY3JpcHRpb25zO1xuICAgICAgZm9yIChpID0gaiA9IDAsIGxlbjEgPSByZWYubGVuZ3RoOyBqIDwgbGVuMTsgaSA9ICsraikge1xuICAgICAgICBzdWIgPSByZWZbaV07XG4gICAgICAgIGlmIChzdWIuaW5wdXQgPT09IGlucHV0KSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBzdWIudW5zdWIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgc3ViLnVuc3ViKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIEJ1cy5wcm90b3R5cGUucGx1ZyA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICB2YXIgc3ViO1xuICAgICAgYXNzZXJ0T2JzZXJ2YWJsZShpbnB1dCk7XG4gICAgICBpZiAodGhpcy5lbmRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzdWIgPSB7XG4gICAgICAgIGlucHV0OiBpbnB1dFxuICAgICAgfTtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1Yik7XG4gICAgICBpZiAoKHRoaXMuc2luayAhPSBudWxsKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZUlucHV0KHN1Yik7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMudW5zdWJzY3JpYmVJbnB1dChpbnB1dCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgQnVzLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgICAgdGhpcy51bnN1YkFsbCgpO1xuICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLnNpbmsgPT09IFwiZnVuY3Rpb25cIiA/IHRoaXMuc2luayhlbmRFdmVudCgpKSA6IHZvaWQgMDtcbiAgICB9O1xuXG4gICAgQnVzLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghdGhpcy5lbmRlZCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuc2luayA9PT0gXCJmdW5jdGlvblwiID8gdGhpcy5zaW5rKG5leHRFdmVudCh2YWx1ZSkpIDogdm9pZCAwO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBCdXMucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5zaW5rID09PSBcImZ1bmN0aW9uXCIgPyB0aGlzLnNpbmsobmV3IEVycm9yKGVycm9yKSkgOiB2b2lkIDA7XG4gICAgfTtcblxuICAgIHJldHVybiBCdXM7XG5cbiAgfSkoRXZlbnRTdHJlYW0pO1xuXG4gIEJhY29uLkJ1cyA9IEJ1cztcblxuICBsaWZ0Q2FsbGJhY2sgPSBmdW5jdGlvbihkZXNjLCB3cmFwcGVkKSB7XG4gICAgcmV0dXJuIHdpdGhNZXRob2RDYWxsU3VwcG9ydChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzLCBmLCBzdHJlYW07XG4gICAgICBmID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgICBzdHJlYW0gPSBwYXJ0aWFsbHlBcHBsaWVkKHdyYXBwZWQsIFtcbiAgICAgICAgZnVuY3Rpb24odmFsdWVzLCBjYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybiBmLmFwcGx5KG51bGwsIHNsaWNlLmNhbGwodmFsdWVzKS5jb25jYXQoW2NhbGxiYWNrXSkpO1xuICAgICAgICB9XG4gICAgICBdKTtcbiAgICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgZGVzYywgW2ZdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3MpKSksIEJhY29uLmNvbWJpbmVBc0FycmF5KGFyZ3MpLmZsYXRNYXAoc3RyZWFtKSk7XG4gICAgfSk7XG4gIH07XG5cbiAgQmFjb24uZnJvbUNhbGxiYWNrID0gbGlmdENhbGxiYWNrKFwiZnJvbUNhbGxiYWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBmO1xuICAgIGYgPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICByZXR1cm4gQmFjb24uZnJvbUJpbmRlcihmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgICBtYWtlRnVuY3Rpb24oZiwgYXJncykoaGFuZGxlcik7XG4gICAgICByZXR1cm4gbm9wO1xuICAgIH0sIChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIFt2YWx1ZSwgZW5kRXZlbnQoKV07XG4gICAgfSkpO1xuICB9KTtcblxuICBCYWNvbi5mcm9tTm9kZUNhbGxiYWNrID0gbGlmdENhbGxiYWNrKFwiZnJvbU5vZGVDYWxsYmFja1wiLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgZjtcbiAgICBmID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgcmV0dXJuIEJhY29uLmZyb21CaW5kZXIoZnVuY3Rpb24oaGFuZGxlcikge1xuICAgICAgbWFrZUZ1bmN0aW9uKGYsIGFyZ3MpKGhhbmRsZXIpO1xuICAgICAgcmV0dXJuIG5vcDtcbiAgICB9LCBmdW5jdGlvbihlcnJvciwgdmFsdWUpIHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICByZXR1cm4gW25ldyBFcnJvcihlcnJvciksIGVuZEV2ZW50KCldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFt2YWx1ZSwgZW5kRXZlbnQoKV07XG4gICAgfSk7XG4gIH0pO1xuXG4gIGFkZFByb3BlcnR5SW5pdFZhbHVlVG9TdHJlYW0gPSBmdW5jdGlvbihwcm9wZXJ0eSwgc3RyZWFtKSB7XG4gICAgdmFyIGp1c3RJbml0VmFsdWU7XG4gICAganVzdEluaXRWYWx1ZSA9IG5ldyBFdmVudFN0cmVhbShkZXNjcmliZShwcm9wZXJ0eSwgXCJqdXN0SW5pdFZhbHVlXCIpLCBmdW5jdGlvbihzaW5rKSB7XG4gICAgICB2YXIgdW5zdWIsIHZhbHVlO1xuICAgICAgdmFsdWUgPSB2b2lkIDA7XG4gICAgICB1bnN1YiA9IHByb3BlcnR5LmRpc3BhdGNoZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICAgIHZhbHVlID0gZXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEJhY29uLm5vTW9yZTtcbiAgICAgIH0pO1xuICAgICAgVXBkYXRlQmFycmllci53aGVuRG9uZVdpdGgoanVzdEluaXRWYWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgc2luayh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNpbmsoZW5kRXZlbnQoKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB1bnN1YjtcbiAgICB9KTtcbiAgICByZXR1cm4ganVzdEluaXRWYWx1ZS5jb25jYXQoc3RyZWFtKS50b1Byb3BlcnR5KCk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUubWFwRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGY7XG4gICAgZiA9IG1ha2VGdW5jdGlvbkFyZ3MoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJtYXBFbmRcIiwgW2ZdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgdGhpcy5wdXNoKG5leHRFdmVudChmKGV2ZW50KSkpO1xuICAgICAgICB0aGlzLnB1c2goZW5kRXZlbnQoKSk7XG4gICAgICAgIHJldHVybiBCYWNvbi5ub01vcmU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuc2tpcEVycm9ycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInNraXBFcnJvcnNcIiwgW10pLCB0aGlzLndpdGhIYW5kbGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQuaXNFcnJvcigpKSB7XG4gICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS50YWtlVW50aWwgPSBmdW5jdGlvbihzdG9wcGVyKSB7XG4gICAgdmFyIGVuZE1hcmtlcjtcbiAgICBlbmRNYXJrZXIgPSB7fTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJ0YWtlVW50aWxcIiwgW3N0b3BwZXJdKSwgQmFjb24uZ3JvdXBTaW11bHRhbmVvdXModGhpcy5tYXBFbmQoZW5kTWFya2VyKSwgc3RvcHBlci5za2lwRXJyb3JzKCkpLndpdGhIYW5kbGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZGF0YSwgaiwgbGVuMSwgcmVmLCByZXBseSwgdmFsdWU7XG4gICAgICBpZiAoIWV2ZW50Lmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWYgPSBldmVudC52YWx1ZSgpLCBkYXRhID0gcmVmWzBdLCBzdG9wcGVyID0gcmVmWzFdO1xuICAgICAgICBpZiAoc3RvcHBlci5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGVuZEV2ZW50KCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcGx5ID0gQmFjb24ubW9yZTtcbiAgICAgICAgICBmb3IgKGogPSAwLCBsZW4xID0gZGF0YS5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgICAgIHZhbHVlID0gZGF0YVtqXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gZW5kTWFya2VyKSB7XG4gICAgICAgICAgICAgIHJlcGx5ID0gdGhpcy5wdXNoKGVuZEV2ZW50KCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVwbHkgPSB0aGlzLnB1c2gobmV4dEV2ZW50KHZhbHVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXBseTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5Qcm9wZXJ0eS5wcm90b3R5cGUudGFrZVVudGlsID0gZnVuY3Rpb24oc3RvcHBlcikge1xuICAgIHZhciBjaGFuZ2VzO1xuICAgIGNoYW5nZXMgPSB0aGlzLmNoYW5nZXMoKS50YWtlVW50aWwoc3RvcHBlcik7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwidGFrZVVudGlsXCIsIFtzdG9wcGVyXSksIGFkZFByb3BlcnR5SW5pdFZhbHVlVG9TdHJlYW0odGhpcywgY2hhbmdlcykpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmZsYXRNYXBMYXRlc3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZiwgc3RyZWFtO1xuICAgIGYgPSBtYWtlU3Bhd25lcihhcmd1bWVudHMpO1xuICAgIHN0cmVhbSA9IHRoaXMudG9FdmVudFN0cmVhbSgpO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImZsYXRNYXBMYXRlc3RcIiwgW2ZdKSwgc3RyZWFtLmZsYXRNYXAoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBtYWtlT2JzZXJ2YWJsZShmKHZhbHVlKSkudGFrZVVudGlsKHN0cmVhbSk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLlByb3BlcnR5LnByb3RvdHlwZS5kZWxheUNoYW5nZXMgPSBmdW5jdGlvbihkZXNjLCBmKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKGRlc2MsIGFkZFByb3BlcnR5SW5pdFZhbHVlVG9TdHJlYW0odGhpcywgZih0aGlzLmNoYW5nZXMoKSkpKTtcbiAgfTtcblxuICBCYWNvbi5FdmVudFN0cmVhbS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbihkZWxheSkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImRlbGF5XCIsIFtkZWxheV0pLCB0aGlzLmZsYXRNYXAoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBCYWNvbi5sYXRlcihkZWxheSwgdmFsdWUpO1xuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5Qcm9wZXJ0eS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbihkZWxheSkge1xuICAgIHJldHVybiB0aGlzLmRlbGF5Q2hhbmdlcyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImRlbGF5XCIsIFtkZWxheV0pLCBmdW5jdGlvbihjaGFuZ2VzKSB7XG4gICAgICByZXR1cm4gY2hhbmdlcy5kZWxheShkZWxheSk7XG4gICAgfSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLmRlYm91bmNlID0gZnVuY3Rpb24oZGVsYXkpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJkZWJvdW5jZVwiLCBbZGVsYXldKSwgdGhpcy5mbGF0TWFwTGF0ZXN0KGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gQmFjb24ubGF0ZXIoZGVsYXksIHZhbHVlKTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uUHJvcGVydHkucHJvdG90eXBlLmRlYm91bmNlID0gZnVuY3Rpb24oZGVsYXkpIHtcbiAgICByZXR1cm4gdGhpcy5kZWxheUNoYW5nZXMobmV3IEJhY29uLkRlc2ModGhpcywgXCJkZWJvdW5jZVwiLCBbZGVsYXldKSwgZnVuY3Rpb24oY2hhbmdlcykge1xuICAgICAgcmV0dXJuIGNoYW5nZXMuZGVib3VuY2UoZGVsYXkpO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5kZWJvdW5jZUltbWVkaWF0ZSA9IGZ1bmN0aW9uKGRlbGF5KSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZGVib3VuY2VJbW1lZGlhdGVcIiwgW2RlbGF5XSksIHRoaXMuZmxhdE1hcEZpcnN0KGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gQmFjb24ub25jZSh2YWx1ZSkuY29uY2F0KEJhY29uLmxhdGVyKGRlbGF5KS5maWx0ZXIoZmFsc2UpKTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uKHNlZWQsIGYpIHtcbiAgICB2YXIgYWNjLCByZXN1bHRQcm9wZXJ0eSwgc3Vic2NyaWJlO1xuICAgIGYgPSB0b0NvbWJpbmF0b3IoZik7XG4gICAgYWNjID0gdG9PcHRpb24oc2VlZCk7XG4gICAgc3Vic2NyaWJlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oc2luaykge1xuICAgICAgICB2YXIgaW5pdFNlbnQsIHJlcGx5LCBzZW5kSW5pdCwgdW5zdWI7XG4gICAgICAgIGluaXRTZW50ID0gZmFsc2U7XG4gICAgICAgIHVuc3ViID0gbm9wO1xuICAgICAgICByZXBseSA9IEJhY29uLm1vcmU7XG4gICAgICAgIHNlbmRJbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFpbml0U2VudCkge1xuICAgICAgICAgICAgcmV0dXJuIGFjYy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgIGluaXRTZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmVwbHkgPSBzaW5rKG5ldyBJbml0aWFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICBpZiAocmVwbHkgPT09IEJhY29uLm5vTW9yZSkge1xuICAgICAgICAgICAgICAgIHVuc3ViKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuc3ViID0gbm9wO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHVuc3ViID0gX3RoaXMuZGlzcGF0Y2hlci5zdWJzY3JpYmUoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICB2YXIgbmV4dCwgcHJldjtcbiAgICAgICAgICBpZiAoZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgaWYgKGluaXRTZW50ICYmIGV2ZW50LmlzSW5pdGlhbCgpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKCFldmVudC5pc0luaXRpYWwoKSkge1xuICAgICAgICAgICAgICAgIHNlbmRJbml0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaW5pdFNlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICBwcmV2ID0gYWNjLmdldE9yRWxzZSh2b2lkIDApO1xuICAgICAgICAgICAgICBuZXh0ID0gZihwcmV2LCBldmVudC52YWx1ZSgpKTtcbiAgICAgICAgICAgICAgYWNjID0gbmV3IFNvbWUobmV4dCk7XG4gICAgICAgICAgICAgIHJldHVybiBzaW5rKGV2ZW50LmFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChldmVudC5pc0VuZCgpKSB7XG4gICAgICAgICAgICAgIHJlcGx5ID0gc2VuZEluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXBseSAhPT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzaW5rKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBVcGRhdGVCYXJyaWVyLndoZW5Eb25lV2l0aChyZXN1bHRQcm9wZXJ0eSwgc2VuZEluaXQpO1xuICAgICAgICByZXR1cm4gdW5zdWI7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIHJldHVybiByZXN1bHRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eShuZXcgQmFjb24uRGVzYyh0aGlzLCBcInNjYW5cIiwgW3NlZWQsIGZdKSwgc3Vic2NyaWJlKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5kaWZmID0gZnVuY3Rpb24oc3RhcnQsIGYpIHtcbiAgICBmID0gdG9Db21iaW5hdG9yKGYpO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImRpZmZcIiwgW3N0YXJ0LCBmXSksIHRoaXMuc2Nhbihbc3RhcnRdLCBmdW5jdGlvbihwcmV2VHVwbGUsIG5leHQpIHtcbiAgICAgIHJldHVybiBbbmV4dCwgZihwcmV2VHVwbGVbMF0sIG5leHQpXTtcbiAgICB9KS5maWx0ZXIoZnVuY3Rpb24odHVwbGUpIHtcbiAgICAgIHJldHVybiB0dXBsZS5sZW5ndGggPT09IDI7XG4gICAgfSkubWFwKGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgICByZXR1cm4gdHVwbGVbMV07XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmRvQWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGY7XG4gICAgZiA9IG1ha2VGdW5jdGlvbkFyZ3MoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJkb0FjdGlvblwiLCBbZl0pLCB0aGlzLndpdGhIYW5kbGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICBmKGV2ZW50LnZhbHVlKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmRvRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZjtcbiAgICBmID0gbWFrZUZ1bmN0aW9uQXJncyhhcmd1bWVudHMpO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImRvRXJyb3JcIiwgW2ZdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmlzRXJyb3IoKSkge1xuICAgICAgICBmKGV2ZW50LmVycm9yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5kb0xvZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzO1xuICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJkb0xvZ1wiLCBhcmdzKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIGNvbnNvbGUgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgc2xpY2UuY2FsbChhcmdzKS5jb25jYXQoW2V2ZW50LmxvZygpXSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZW5kT25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBmO1xuICAgIGYgPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICBpZiAoZiA9PSBudWxsKSB7XG4gICAgICBmID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnZlcnRBcmdzVG9GdW5jdGlvbih0aGlzLCBmLCBhcmdzLCBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJlbmRPbkVycm9yXCIsIFtdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuaXNFcnJvcigpICYmIGYoZXZlbnQuZXJyb3IpKSB7XG4gICAgICAgICAgdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGVuZEV2ZW50KCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH07XG5cbiAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuZXJyb3JzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZXJyb3JzXCIsIFtdKSwgdGhpcy5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSkpO1xuICB9O1xuXG4gIHZhbHVlQW5kRW5kID0gKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIFt2YWx1ZSwgZW5kRXZlbnQoKV07XG4gIH0pO1xuXG4gIEJhY29uLmZyb21Qcm9taXNlID0gZnVuY3Rpb24ocHJvbWlzZSwgYWJvcnQsIGV2ZW50VHJhbnNmb3JtZXIpIHtcbiAgICBpZiAoZXZlbnRUcmFuc2Zvcm1lciA9PSBudWxsKSB7XG4gICAgICBldmVudFRyYW5zZm9ybWVyID0gdmFsdWVBbmRFbmQ7XG4gICAgfVxuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJmcm9tUHJvbWlzZVwiLCBbcHJvbWlzZV0pLCBCYWNvbi5mcm9tQmluZGVyKGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHZhciByZWY7XG4gICAgICBpZiAoKHJlZiA9IHByb21pc2UudGhlbihoYW5kbGVyLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVyKG5ldyBFcnJvcihlKSk7XG4gICAgICB9KSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIHJlZi5kb25lID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZWYuZG9uZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChhYm9ydCkge1xuICAgICAgICAgIHJldHVybiB0eXBlb2YgcHJvbWlzZS5hYm9ydCA9PT0gXCJmdW5jdGlvblwiID8gcHJvbWlzZS5hYm9ydCgpIDogdm9pZCAwO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sIGV2ZW50VHJhbnNmb3JtZXIpKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5tYXBFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmO1xuICAgIGYgPSBtYWtlRnVuY3Rpb25BcmdzKGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwibWFwRXJyb3JcIiwgW2ZdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmlzRXJyb3IoKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKG5leHRFdmVudChmKGV2ZW50LmVycm9yKSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmZsYXRNYXBFcnJvciA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZmxhdE1hcEVycm9yXCIsIFtmbl0pLCB0aGlzLm1hcEVycm9yKGZ1bmN0aW9uKGVycikge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcihlcnIpO1xuICAgIH0pLmZsYXRNYXAoZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKHggaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICByZXR1cm4gZm4oeC5lcnJvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gQmFjb24ub25jZSh4KTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLnNhbXBsZWRCeSA9IGZ1bmN0aW9uKHNhbXBsZXIsIGNvbWJpbmF0b3IpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJzYW1wbGVkQnlcIiwgW3NhbXBsZXIsIGNvbWJpbmF0b3JdKSwgdGhpcy50b1Byb3BlcnR5KCkuc2FtcGxlZEJ5KHNhbXBsZXIsIGNvbWJpbmF0b3IpKTtcbiAgfTtcblxuICBCYWNvbi5Qcm9wZXJ0eS5wcm90b3R5cGUuc2FtcGxlZEJ5ID0gZnVuY3Rpb24oc2FtcGxlciwgY29tYmluYXRvcikge1xuICAgIHZhciBsYXp5LCByZXN1bHQsIHNhbXBsZXJTb3VyY2UsIHN0cmVhbSwgdGhpc1NvdXJjZTtcbiAgICBpZiAoY29tYmluYXRvciAhPSBudWxsKSB7XG4gICAgICBjb21iaW5hdG9yID0gdG9Db21iaW5hdG9yKGNvbWJpbmF0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXp5ID0gdHJ1ZTtcbiAgICAgIGNvbWJpbmF0b3IgPSBmdW5jdGlvbihmKSB7XG4gICAgICAgIHJldHVybiBmLnZhbHVlKCk7XG4gICAgICB9O1xuICAgIH1cbiAgICB0aGlzU291cmNlID0gbmV3IFNvdXJjZSh0aGlzLCBmYWxzZSwgbGF6eSk7XG4gICAgc2FtcGxlclNvdXJjZSA9IG5ldyBTb3VyY2Uoc2FtcGxlciwgdHJ1ZSwgbGF6eSk7XG4gICAgc3RyZWFtID0gQmFjb24ud2hlbihbdGhpc1NvdXJjZSwgc2FtcGxlclNvdXJjZV0sIGNvbWJpbmF0b3IpO1xuICAgIHJlc3VsdCA9IHNhbXBsZXIgaW5zdGFuY2VvZiBQcm9wZXJ0eSA/IHN0cmVhbS50b1Byb3BlcnR5KCkgOiBzdHJlYW07XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwic2FtcGxlZEJ5XCIsIFtzYW1wbGVyLCBjb21iaW5hdG9yXSksIHJlc3VsdCk7XG4gIH07XG5cbiAgQmFjb24uUHJvcGVydHkucHJvdG90eXBlLnNhbXBsZSA9IGZ1bmN0aW9uKGludGVydmFsKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwic2FtcGxlXCIsIFtpbnRlcnZhbF0pLCB0aGlzLnNhbXBsZWRCeShCYWNvbi5pbnRlcnZhbChpbnRlcnZhbCwge30pKSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIHA7XG4gICAgcCA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGlmIChwIGluc3RhbmNlb2YgUHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBwLnNhbXBsZWRCeSh0aGlzLCBmb3JtZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29udmVydEFyZ3NUb0Z1bmN0aW9uKHRoaXMsIHAsIGFyZ3MsIGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwibWFwXCIsIFtmXSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50LmZtYXAoZikpO1xuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZm9sZCA9IGZ1bmN0aW9uKHNlZWQsIGYpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJmb2xkXCIsIFtzZWVkLCBmXSksIHRoaXMuc2NhbihzZWVkLCBmKS5zYW1wbGVkQnkodGhpcy5maWx0ZXIoZmFsc2UpLm1hcEVuZCgpLnRvUHJvcGVydHkoKSkpO1xuICB9O1xuXG4gIE9ic2VydmFibGUucHJvdG90eXBlLnJlZHVjZSA9IE9ic2VydmFibGUucHJvdG90eXBlLmZvbGQ7XG5cbiAgQmFjb24uZnJvbVBvbGwgPSBmdW5jdGlvbihkZWxheSwgcG9sbCkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJmcm9tUG9sbFwiLCBbZGVsYXksIHBvbGxdKSwgQmFjb24uZnJvbUJpbmRlcigoZnVuY3Rpb24oaGFuZGxlcikge1xuICAgICAgdmFyIGlkO1xuICAgICAgaWQgPSBCYWNvbi5zY2hlZHVsZXIuc2V0SW50ZXJ2YWwoaGFuZGxlciwgZGVsYXkpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gQmFjb24uc2NoZWR1bGVyLmNsZWFySW50ZXJ2YWwoaWQpO1xuICAgICAgfTtcbiAgICB9KSwgcG9sbCkpO1xuICB9O1xuXG4gIEJhY29uLmZyb21BcnJheSA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHZhciBpO1xuICAgIGFzc2VydEFycmF5KHZhbHVlcyk7XG4gICAgaWYgKCF2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiZnJvbUFycmF5XCIsIHZhbHVlcyksIEJhY29uLm5ldmVyKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpID0gMDtcbiAgICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2MoQmFjb24sIFwiZnJvbUFycmF5XCIsIFt2YWx1ZXNdKSwgZnVuY3Rpb24oc2luaykge1xuICAgICAgICB2YXIgcHVzaCwgcHVzaE5lZWRlZCwgcHVzaGluZywgcmVwbHksIHVuc3ViZDtcbiAgICAgICAgdW5zdWJkID0gZmFsc2U7XG4gICAgICAgIHJlcGx5ID0gQmFjb24ubW9yZTtcbiAgICAgICAgcHVzaGluZyA9IGZhbHNlO1xuICAgICAgICBwdXNoTmVlZGVkID0gZmFsc2U7XG4gICAgICAgIHB1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgdmFsdWU7XG4gICAgICAgICAgcHVzaE5lZWRlZCA9IHRydWU7XG4gICAgICAgICAgaWYgKHB1c2hpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHVzaGluZyA9IHRydWU7XG4gICAgICAgICAgd2hpbGUgKHB1c2hOZWVkZWQpIHtcbiAgICAgICAgICAgIHB1c2hOZWVkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICgocmVwbHkgIT09IEJhY29uLm5vTW9yZSkgJiYgIXVuc3ViZCkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlc1tpKytdO1xuICAgICAgICAgICAgICByZXBseSA9IHNpbmsodG9FdmVudCh2YWx1ZSkpO1xuICAgICAgICAgICAgICBpZiAocmVwbHkgIT09IEJhY29uLm5vTW9yZSkge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBVcGRhdGVCYXJyaWVyLmFmdGVyVHJhbnNhY3Rpb24ocHVzaCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBwdXNoaW5nID0gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIHB1c2goKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB1bnN1YmQgPSB0cnVlO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5ob2xkV2hlbiA9IGZ1bmN0aW9uKHZhbHZlKSB7XG4gICAgdmFyIGJ1ZmZlcmVkVmFsdWVzLCBjb21wb3NpdGUsIG9uSG9sZCwgc3JjLCBzdWJzY3JpYmVkO1xuICAgIGNvbXBvc2l0ZSA9IG5ldyBDb21wb3NpdGVVbnN1YnNjcmliZSgpO1xuICAgIG9uSG9sZCA9IGZhbHNlO1xuICAgIGJ1ZmZlcmVkVmFsdWVzID0gW107XG4gICAgc3Vic2NyaWJlZCA9IGZhbHNlO1xuICAgIHNyYyA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBFdmVudFN0cmVhbShuZXcgQmFjb24uRGVzYyh0aGlzLCBcImhvbGRXaGVuXCIsIFt2YWx2ZV0pLCBmdW5jdGlvbihzaW5rKSB7XG4gICAgICB2YXIgZW5kSWZCb3RoRW5kZWQ7XG4gICAgICBlbmRJZkJvdGhFbmRlZCA9IGZ1bmN0aW9uKHVuc3ViKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdW5zdWIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHVuc3ViKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbXBvc2l0ZS5lbXB0eSgpICYmIHN1YnNjcmliZWQpIHtcbiAgICAgICAgICByZXR1cm4gc2luayhlbmRFdmVudCgpKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbXBvc2l0ZS5hZGQoZnVuY3Rpb24odW5zdWJBbGwsIHVuc3ViTWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHZlLnN1YnNjcmliZUludGVybmFsKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgdmFyIGosIGxlbjEsIHJlc3VsdHMsIHRvU2VuZCwgdmFsdWU7XG4gICAgICAgICAgaWYgKGV2ZW50Lmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIG9uSG9sZCA9IGV2ZW50LnZhbHVlKCk7XG4gICAgICAgICAgICBpZiAoIW9uSG9sZCkge1xuICAgICAgICAgICAgICB0b1NlbmQgPSBidWZmZXJlZFZhbHVlcztcbiAgICAgICAgICAgICAgYnVmZmVyZWRWYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKGogPSAwLCBsZW4xID0gdG9TZW5kLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdG9TZW5kW2pdO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChzaW5rKG5leHRFdmVudCh2YWx1ZSkpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbmRJZkJvdGhFbmRlZCh1bnN1Yk1lKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNpbmsoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGNvbXBvc2l0ZS5hZGQoZnVuY3Rpb24odW5zdWJBbGwsIHVuc3ViTWUpIHtcbiAgICAgICAgcmV0dXJuIHNyYy5zdWJzY3JpYmVJbnRlcm5hbChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGlmIChvbkhvbGQgJiYgZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlcmVkVmFsdWVzLnB1c2goZXZlbnQudmFsdWUoKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChldmVudC5pc0VuZCgpICYmIGJ1ZmZlcmVkVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGVuZElmQm90aEVuZGVkKHVuc3ViTWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2luayhldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgc3Vic2NyaWJlZCA9IHRydWU7XG4gICAgICBlbmRJZkJvdGhFbmRlZCgpO1xuICAgICAgcmV0dXJuIGNvbXBvc2l0ZS51bnN1YnNjcmliZTtcbiAgICB9KTtcbiAgfTtcblxuICBCYWNvbi5pbnRlcnZhbCA9IGZ1bmN0aW9uKGRlbGF5LCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICB2YWx1ZSA9IHt9O1xuICAgIH1cbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiaW50ZXJ2YWxcIiwgW2RlbGF5LCB2YWx1ZV0pLCBCYWNvbi5mcm9tUG9sbChkZWxheSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV4dEV2ZW50KHZhbHVlKTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uJCA9IHt9O1xuXG4gIEJhY29uLiQuYXNFdmVudFN0cmVhbSA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgc2VsZWN0b3IsIGV2ZW50VHJhbnNmb3JtZXIpIHtcbiAgICB2YXIgcmVmO1xuICAgIGlmIChfLmlzRnVuY3Rpb24oc2VsZWN0b3IpKSB7XG4gICAgICByZWYgPSBbc2VsZWN0b3IsIHZvaWQgMF0sIGV2ZW50VHJhbnNmb3JtZXIgPSByZWZbMF0sIHNlbGVjdG9yID0gcmVmWzFdO1xuICAgIH1cbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcy5zZWxlY3RvciB8fCB0aGlzLCBcImFzRXZlbnRTdHJlYW1cIiwgW2V2ZW50TmFtZV0pLCBCYWNvbi5mcm9tQmluZGVyKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgICAgX3RoaXMub24oZXZlbnROYW1lLCBzZWxlY3RvciwgaGFuZGxlcik7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMub2ZmKGV2ZW50TmFtZSwgc2VsZWN0b3IsIGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSwgZXZlbnRUcmFuc2Zvcm1lcikpO1xuICB9O1xuXG4gIGlmICgocmVmID0gdHlwZW9mIGpRdWVyeSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBqUXVlcnkgIT09IG51bGwgPyBqUXVlcnkgOiB0eXBlb2YgWmVwdG8gIT09IFwidW5kZWZpbmVkXCIgJiYgWmVwdG8gIT09IG51bGwgPyBaZXB0byA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgIHJlZi5mbi5hc0V2ZW50U3RyZWFtID0gQmFjb24uJC5hc0V2ZW50U3RyZWFtO1xuICB9XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3M7XG4gICAgYXJncyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHRoaXMuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiYgY29uc29sZSAhPT0gbnVsbCA/IHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gXCJmdW5jdGlvblwiID8gY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgc2xpY2UuY2FsbChhcmdzKS5jb25jYXQoW2V2ZW50LmxvZygpXSkpIDogdm9pZCAwIDogdm9pZCAwO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5tZXJnZSA9IGZ1bmN0aW9uKHJpZ2h0KSB7XG4gICAgdmFyIGxlZnQ7XG4gICAgYXNzZXJ0RXZlbnRTdHJlYW0ocmlnaHQpO1xuICAgIGxlZnQgPSB0aGlzO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhsZWZ0LCBcIm1lcmdlXCIsIFtyaWdodF0pLCBCYWNvbi5tZXJnZUFsbCh0aGlzLCByaWdodCkpO1xuICB9O1xuXG4gIEJhY29uLm1lcmdlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmVhbXM7XG4gICAgc3RyZWFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIGlmIChpc0FycmF5KHN0cmVhbXNbMF0pKSB7XG4gICAgICBzdHJlYW1zID0gc3RyZWFtc1swXTtcbiAgICB9XG4gICAgaWYgKHN0cmVhbXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbmV3IEV2ZW50U3RyZWFtKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcIm1lcmdlQWxsXCIsIHN0cmVhbXMpLCBmdW5jdGlvbihzaW5rKSB7XG4gICAgICAgIHZhciBlbmRzLCBzaW5rcywgc21hcnRTaW5rO1xuICAgICAgICBlbmRzID0gMDtcbiAgICAgICAgc21hcnRTaW5rID0gZnVuY3Rpb24ob2JzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHVuc3ViQm90aCkge1xuICAgICAgICAgICAgcmV0dXJuIG9icy5kaXNwYXRjaGVyLnN1YnNjcmliZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICB2YXIgcmVwbHk7XG4gICAgICAgICAgICAgIGlmIChldmVudC5pc0VuZCgpKSB7XG4gICAgICAgICAgICAgICAgZW5kcysrO1xuICAgICAgICAgICAgICAgIGlmIChlbmRzID09PSBzdHJlYW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNpbmsoZW5kRXZlbnQoKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXBseSA9IHNpbmsoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICAgICAgICB1bnN1YkJvdGgoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcGx5O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICBzaW5rcyA9IF8ubWFwKHNtYXJ0U2luaywgc3RyZWFtcyk7XG4gICAgICAgIHJldHVybiBuZXcgQmFjb24uQ29tcG9zaXRlVW5zdWJzY3JpYmUoc2lua3MpLnVuc3Vic2NyaWJlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBCYWNvbi5uZXZlcigpO1xuICAgIH1cbiAgfTtcblxuICBCYWNvbi5yZXBlYXRlZGx5ID0gZnVuY3Rpb24oZGVsYXksIHZhbHVlcykge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IDA7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcInJlcGVhdGVkbHlcIiwgW2RlbGF5LCB2YWx1ZXNdKSwgQmFjb24uZnJvbVBvbGwoZGVsYXksIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHZhbHVlc1tpbmRleCsrICUgdmFsdWVzLmxlbmd0aF07XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLnJlcGVhdCA9IGZ1bmN0aW9uKGdlbmVyYXRvcikge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IDA7XG4gICAgcmV0dXJuIEJhY29uLmZyb21CaW5kZXIoZnVuY3Rpb24oc2luaykge1xuICAgICAgdmFyIGZsYWcsIGhhbmRsZUV2ZW50LCByZXBseSwgc3Vic2NyaWJlTmV4dCwgdW5zdWI7XG4gICAgICBmbGFnID0gZmFsc2U7XG4gICAgICByZXBseSA9IEJhY29uLm1vcmU7XG4gICAgICB1bnN1YiA9IGZ1bmN0aW9uKCkge307XG4gICAgICBoYW5kbGVFdmVudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5pc0VuZCgpKSB7XG4gICAgICAgICAgaWYgKCFmbGFnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxhZyA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdWJzY3JpYmVOZXh0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXBseSA9IHNpbmsoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc3Vic2NyaWJlTmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dDtcbiAgICAgICAgZmxhZyA9IHRydWU7XG4gICAgICAgIHdoaWxlIChmbGFnICYmIHJlcGx5ICE9PSBCYWNvbi5ub01vcmUpIHtcbiAgICAgICAgICBuZXh0ID0gZ2VuZXJhdG9yKGluZGV4KyspO1xuICAgICAgICAgIGZsYWcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgICAgdW5zdWIgPSBuZXh0LnN1YnNjcmliZUludGVybmFsKGhhbmRsZUV2ZW50KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2luayhlbmRFdmVudCgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZsYWcgPSB0cnVlO1xuICAgICAgfTtcbiAgICAgIHN1YnNjcmliZU5leHQoKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHVuc3ViKCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLnJldHJ5ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWxheSwgZXJyb3IsIGZpbmlzaGVkLCBpc1JldHJ5YWJsZSwgbWF4UmV0cmllcywgcmV0cmllcywgc291cmNlO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKG9wdGlvbnMuc291cmNlKSkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIidzb3VyY2UnIG9wdGlvbiBoYXMgdG8gYmUgYSBmdW5jdGlvblwiKTtcbiAgICB9XG4gICAgc291cmNlID0gb3B0aW9ucy5zb3VyY2U7XG4gICAgcmV0cmllcyA9IG9wdGlvbnMucmV0cmllcyB8fCAwO1xuICAgIG1heFJldHJpZXMgPSBvcHRpb25zLm1heFJldHJpZXMgfHwgcmV0cmllcztcbiAgICBkZWxheSA9IG9wdGlvbnMuZGVsYXkgfHwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9O1xuICAgIGlzUmV0cnlhYmxlID0gb3B0aW9ucy5pc1JldHJ5YWJsZSB8fCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgZmluaXNoZWQgPSBmYWxzZTtcbiAgICBlcnJvciA9IG51bGw7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcInJldHJ5XCIsIFtvcHRpb25zXSksIEJhY29uLnJlcGVhdChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZXh0LCBwYXVzZSwgdmFsdWVTdHJlYW07XG4gICAgICBpZiAoZmluaXNoZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZVN0cmVhbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzb3VyY2UoKS5lbmRPbkVycm9yKCkud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5pc0Vycm9yKCkpIHtcbiAgICAgICAgICAgICAgZXJyb3IgPSBldmVudDtcbiAgICAgICAgICAgICAgaWYgKGlzUmV0cnlhYmxlKGVycm9yLmVycm9yKSAmJiByZXRyaWVzID4gMCkge1xuXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIGVycm9yID0gbnVsbDtcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICBlcnJvcjogZXJyb3IuZXJyb3IsXG4gICAgICAgICAgICByZXRyaWVzRG9uZTogbWF4UmV0cmllcyAtIHJldHJpZXNcbiAgICAgICAgICB9O1xuICAgICAgICAgIHBhdXNlID0gQmFjb24ubGF0ZXIoZGVsYXkoY29udGV4dCkpLmZpbHRlcihmYWxzZSk7XG4gICAgICAgICAgcmV0cmllcyA9IHJldHJpZXMgLSAxO1xuICAgICAgICAgIHJldHVybiBwYXVzZS5jb25jYXQoQmFjb24ub25jZSgpLmZsYXRNYXAodmFsdWVTdHJlYW0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWVTdHJlYW0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5zZXF1ZW50aWFsbHkgPSBmdW5jdGlvbihkZWxheSwgdmFsdWVzKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gMDtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwic2VxdWVudGlhbGx5XCIsIFtkZWxheSwgdmFsdWVzXSksIEJhY29uLmZyb21Qb2xsKGRlbGF5LCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIHZhbHVlID0gdmFsdWVzW2luZGV4KytdO1xuICAgICAgaWYgKGluZGV4IDwgdmFsdWVzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKGluZGV4ID09PSB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBbdmFsdWUsIGVuZEV2ZW50KCldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGVuZEV2ZW50KCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLnNraXAgPSBmdW5jdGlvbihjb3VudCkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInNraXBcIiwgW2NvdW50XSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmICghZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgIH0gZWxzZSBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgIGNvdW50LS07XG4gICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLnRha2UgPSBmdW5jdGlvbihjb3VudCkge1xuICAgIGlmIChjb3VudCA8PSAwKSB7XG4gICAgICByZXR1cm4gQmFjb24ubmV2ZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwidGFrZVwiLCBbY291bnRdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKCFldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY291bnQtLTtcbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wdXNoKGVuZEV2ZW50KCkpO1xuICAgICAgICAgIHJldHVybiBCYWNvbi5ub01vcmU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLnNraXBVbnRpbCA9IGZ1bmN0aW9uKHN0YXJ0ZXIpIHtcbiAgICB2YXIgc3RhcnRlZDtcbiAgICBzdGFydGVkID0gc3RhcnRlci50YWtlKDEpLm1hcCh0cnVlKS50b1Byb3BlcnR5KGZhbHNlKTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJza2lwVW50aWxcIiwgW3N0YXJ0ZXJdKSwgdGhpcy5maWx0ZXIoc3RhcnRlZCkpO1xuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5za2lwV2hpbGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgZiwgb2s7XG4gICAgZiA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGFzc2VydE9ic2VydmFibGVJc1Byb3BlcnR5KGYpO1xuICAgIG9rID0gZmFsc2U7XG4gICAgcmV0dXJuIGNvbnZlcnRBcmdzVG9GdW5jdGlvbih0aGlzLCBmLCBhcmdzLCBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJza2lwV2hpbGVcIiwgW2ZdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAob2sgfHwgIWV2ZW50Lmhhc1ZhbHVlKCkgfHwgIWYoZXZlbnQudmFsdWUoKSkpIHtcbiAgICAgICAgICBpZiAoZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgb2sgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gQmFjb24ubW9yZTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLnNsaWRpbmdXaW5kb3cgPSBmdW5jdGlvbihuLCBtaW5WYWx1ZXMpIHtcbiAgICBpZiAobWluVmFsdWVzID09IG51bGwpIHtcbiAgICAgIG1pblZhbHVlcyA9IDA7XG4gICAgfVxuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInNsaWRpbmdXaW5kb3dcIiwgW24sIG1pblZhbHVlc10pLCB0aGlzLnNjYW4oW10sIChmdW5jdGlvbih3aW5kb3csIHZhbHVlKSB7XG4gICAgICByZXR1cm4gd2luZG93LmNvbmNhdChbdmFsdWVdKS5zbGljZSgtbik7XG4gICAgfSkpLmZpbHRlcigoZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICByZXR1cm4gdmFsdWVzLmxlbmd0aCA+PSBtaW5WYWx1ZXM7XG4gICAgfSkpKTtcbiAgfTtcblxuICBCYWNvbi5zcHkgPSBmdW5jdGlvbihzcHkpIHtcbiAgICByZXR1cm4gc3B5cy5wdXNoKHNweSk7XG4gIH07XG5cbiAgc3B5cyA9IFtdO1xuXG4gIHJlZ2lzdGVyT2JzID0gZnVuY3Rpb24ob2JzKSB7XG4gICAgdmFyIGosIGxlbjEsIHNweTtcbiAgICBpZiAoc3B5cy5sZW5ndGgpIHtcbiAgICAgIGlmICghcmVnaXN0ZXJPYnMucnVubmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlZ2lzdGVyT2JzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSBzcHlzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICAgICAgc3B5ID0gc3B5c1tqXTtcbiAgICAgICAgICAgIHNweShvYnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBkZWxldGUgcmVnaXN0ZXJPYnMucnVubmluZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdm9pZCAwO1xuICB9O1xuXG4gIEJhY29uLlByb3BlcnR5LnByb3RvdHlwZS5zdGFydFdpdGggPSBmdW5jdGlvbihzZWVkKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwic3RhcnRXaXRoXCIsIFtzZWVkXSksIHRoaXMuc2NhbihzZWVkLCBmdW5jdGlvbihwcmV2LCBuZXh0KSB7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLnN0YXJ0V2l0aCA9IGZ1bmN0aW9uKHNlZWQpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJzdGFydFdpdGhcIiwgW3NlZWRdKSwgQmFjb24ub25jZShzZWVkKS5jb25jYXQodGhpcykpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLnRha2VXaGlsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBmO1xuICAgIGYgPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICBhc3NlcnRPYnNlcnZhYmxlSXNQcm9wZXJ0eShmKTtcbiAgICByZXR1cm4gY29udmVydEFyZ3NUb0Z1bmN0aW9uKHRoaXMsIGYsIGFyZ3MsIGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInRha2VXaGlsZVwiLCBbZl0pLCB0aGlzLndpdGhIYW5kbGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5maWx0ZXIoZikpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnB1c2goZW5kRXZlbnQoKSk7XG4gICAgICAgICAgcmV0dXJuIEJhY29uLm5vTW9yZTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpbml0aWFsLCBsYXRlQmluZEZpcnN0LCBwYXR0ZXJucztcbiAgICBpbml0aWFsID0gYXJndW1lbnRzWzBdLCBwYXR0ZXJucyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGxhdGVCaW5kRmlyc3QgPSBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzO1xuICAgICAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpKSB7XG4gICAgICAgICAgcmV0dXJuIGYuYXBwbHkobnVsbCwgW2ldLmNvbmNhdChhcmdzKSk7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH07XG4gICAgaSA9IHBhdHRlcm5zLmxlbmd0aCAtIDE7XG4gICAgd2hpbGUgKGkgPiAwKSB7XG4gICAgICBpZiAoIShwYXR0ZXJuc1tpXSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkge1xuICAgICAgICBwYXR0ZXJuc1tpXSA9IChmdW5jdGlvbih4KSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkocGF0dGVybnNbaV0pO1xuICAgICAgfVxuICAgICAgcGF0dGVybnNbaV0gPSBsYXRlQmluZEZpcnN0KHBhdHRlcm5zW2ldKTtcbiAgICAgIGkgPSBpIC0gMjtcbiAgICB9XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcInVwZGF0ZVwiLCBbaW5pdGlhbF0uY29uY2F0KHNsaWNlLmNhbGwocGF0dGVybnMpKSksIEJhY29uLndoZW4uYXBwbHkoQmFjb24sIHBhdHRlcm5zKS5zY2FuKGluaXRpYWwsIChmdW5jdGlvbih4LCBmKSB7XG4gICAgICByZXR1cm4gZih4KTtcbiAgICB9KSkpO1xuICB9O1xuXG4gIEJhY29uLnppcEFzQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyZWFtcztcbiAgICBzdHJlYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgaWYgKGlzQXJyYXkoc3RyZWFtc1swXSkpIHtcbiAgICAgIHN0cmVhbXMgPSBzdHJlYW1zWzBdO1xuICAgIH1cbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiemlwQXNBcnJheVwiLCBzdHJlYW1zKSwgQmFjb24uemlwV2l0aChzdHJlYW1zLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB4cztcbiAgICAgIHhzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICByZXR1cm4geHM7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLnppcFdpdGggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZiwgcmVmMSwgc3RyZWFtcztcbiAgICBmID0gYXJndW1lbnRzWzBdLCBzdHJlYW1zID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZikpIHtcbiAgICAgIHJlZjEgPSBbZiwgc3RyZWFtc1swXV0sIHN0cmVhbXMgPSByZWYxWzBdLCBmID0gcmVmMVsxXTtcbiAgICB9XG4gICAgc3RyZWFtcyA9IF8ubWFwKChmdW5jdGlvbihzKSB7XG4gICAgICByZXR1cm4gcy50b0V2ZW50U3RyZWFtKCk7XG4gICAgfSksIHN0cmVhbXMpO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJ6aXBXaXRoXCIsIFtmXS5jb25jYXQoc2xpY2UuY2FsbChzdHJlYW1zKSkpLCBCYWNvbi53aGVuKHN0cmVhbXMsIGYpKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS56aXAgPSBmdW5jdGlvbihvdGhlciwgZikge1xuICAgIGlmIChmID09IG51bGwpIHtcbiAgICAgIGYgPSBBcnJheTtcbiAgICB9XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiemlwXCIsIFtvdGhlcl0pLCBCYWNvbi56aXBXaXRoKFt0aGlzLCBvdGhlcl0sIGYpKTtcbiAgfTtcblxuICBcblxuQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImZpcnN0XCIsIFtdKSwgdGhpcy50YWtlKDEpKTtcbn07XG5cbkJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsYXN0RXZlbnQ7XG5cbiAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwibGFzdFwiLCBbXSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgIGlmIChsYXN0RXZlbnQpIHtcbiAgICAgICAgdGhpcy5wdXNoKGxhc3RFdmVudCk7XG4gICAgICB9XG4gICAgICB0aGlzLnB1c2goZW5kRXZlbnQoKSk7XG4gICAgICByZXR1cm4gQmFjb24ubm9Nb3JlO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0RXZlbnQgPSBldmVudDtcbiAgICB9XG4gIH0pKTtcbn07XG5cbkJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS50aHJvdHRsZSA9IGZ1bmN0aW9uIChkZWxheSkge1xuICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJ0aHJvdHRsZVwiLCBbZGVsYXldKSwgdGhpcy5idWZmZXJXaXRoVGltZShkZWxheSkubWFwKGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICByZXR1cm4gdmFsdWVzW3ZhbHVlcy5sZW5ndGggLSAxXTtcbiAgfSkpO1xufTtcblxuQmFjb24uUHJvcGVydHkucHJvdG90eXBlLnRocm90dGxlID0gZnVuY3Rpb24gKGRlbGF5KSB7XG4gIHJldHVybiB0aGlzLmRlbGF5Q2hhbmdlcyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInRocm90dGxlXCIsIFtkZWxheV0pLCBmdW5jdGlvbiAoY2hhbmdlcykge1xuICAgIHJldHVybiBjaGFuZ2VzLnRocm90dGxlKGRlbGF5KTtcbiAgfSk7XG59O1xuXG5PYnNlcnZhYmxlLnByb3RvdHlwZS5maXJzdFRvUHJvbWlzZSA9IGZ1bmN0aW9uIChQcm9taXNlQ3RyKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgaWYgKHR5cGVvZiBQcm9taXNlQ3RyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBpZiAodHlwZW9mIFByb21pc2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgUHJvbWlzZUN0ciA9IFByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUaGVyZSBpc24ndCBkZWZhdWx0IFByb21pc2UsIHVzZSBzaGltIG9yIHBhcmFtZXRlclwiKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2VDdHIoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJldHVybiBfdGhpcy5zdWJzY3JpYmUoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICByZXNvbHZlKGV2ZW50LnZhbHVlKCkpO1xuICAgICAgfVxuICAgICAgaWYgKGV2ZW50LmlzRXJyb3IoKSkge1xuICAgICAgICByZWplY3QoZXZlbnQuZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQmFjb24ubm9Nb3JlO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbk9ic2VydmFibGUucHJvdG90eXBlLnRvUHJvbWlzZSA9IGZ1bmN0aW9uIChQcm9taXNlQ3RyKSB7XG4gIHJldHVybiB0aGlzLmxhc3QoKS5maXJzdFRvUHJvbWlzZShQcm9taXNlQ3RyKTtcbn07XG5cbmlmICgodHlwZW9mIGRlZmluZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkZWZpbmUgIT09IG51bGwpICYmIChkZWZpbmUuYW1kICE9IG51bGwpKSB7XG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBCYWNvbjtcbiAgICB9KTtcbiAgICB0aGlzLkJhY29uID0gQmFjb247XG4gIH0gZWxzZSBpZiAoKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsKSAmJiAobW9kdWxlLmV4cG9ydHMgIT0gbnVsbCkpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEJhY29uO1xuICAgIEJhY29uLkJhY29uID0gQmFjb247XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5CYWNvbiA9IEJhY29uO1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJ2YXIgJE5hdiA9ICQoICcjbmF2JyApO1xuXG4vKlxuICogc2Nyb2xsIGFuZCBuYXYgcGxhY2VtZW50XG4gKi9cbiROYXYuYWZmaXgoXG57XG4gICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogJCggJ2hlYWRlcicgKS5oZWlnaHQoKSAtICROYXYuaGVpZ2h0KClcbiAgICB9XG59ICk7XG5cblxuJCggJ2JvZHknICkuc2Nyb2xsc3B5KCB7IHRhcmdldCA6ICcjbmF2JyB9ICk7XG5cbiQoICcuc2Nyb2xsLXRvcCcgKS5jbGljayggZnVuY3Rpb24oKVxue1xuICAgICQoICdib2R5LCBodG1sJyApLmFuaW1hdGUoIHsgc2Nyb2xsVG9wIDogMCB9ICwgMTAwMCApO1xufSApO1xuIiwiY29uc3QgJCA9IHdpbmRvdy4kO1xuaW1wb3J0IEJhY29uIGZyb20gJ2JhY29uanMnO1xuJC5mbi5hc0V2ZW50U3RyZWFtID0gQmFjb24uJC5hc0V2ZW50U3RyZWFtO1xud2luZG93LkJhY29uID0gQmFjb247XG5cbmltcG9ydCAnLi9zZWFyY2gvJztcbmltcG9ydCAnLi9zcGVlY2gnO1xuaW1wb3J0ICcuL2FuaW1hdGlvbnMnO1xuIiwiaW1wb3J0IHsgc3BlZWNoTGlzdGVuZXIgfSBmcm9tICcuL3NwZWVjaC5qcyc7XG5pbXBvcnQgeyBsZXZlbnNodGVpbiwgZnV6enlNYXRjaCB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5jb25zdCAkc2VhcmNoQXVkaW8gPSAkKCAnLmpzLXJlY2lwZS0tc2VhcmNoLS1hdWRpbycgKTtcbmNvbnN0ICRzZWFyY2hUZXh0QXJlYSA9ICQoICcuanMtcmVjaXBlLS1zZWFyY2gnICk7XG5jb25zdCAkc2VhcmNoQnV0dG9uID0gJCggJy5qcy1yZWNpcGUtLXNlYXJjaC0tYnV0dG9uJyApO1xuY29uc3QgJHNlYXJjaEFkdmFuY2VkID0gJCggJy5qcy1yZWNpcGUtLXNlYXJjaC0tYWR2YW5jZWQnICk7XG5jb25zdCAkc2VhcmNoT3B0aW9ucyA9ICQoICcuanMtcmVjaXBlLS1zZWFyY2gtLWFkdmFuY2VkLW9wdGlvbnMnICk7XG5jb25zdCAkc2VhcmNoUmVzdWx0cyA9ICQoICcuanMtcmVjaXBlLS1yZXN1bHRzJyApO1xuXG5cbmNvbnN0IHRocm90dGxlU2VhcmNoID0gJHNlYXJjaFRleHRBcmVhLmFzRXZlbnRTdHJlYW0oICdrZXl1cCBjaGFuZ2UnIClcbiAgICAubWFwKCBldiA9PiBldi50YXJnZXQudmFsdWU/IGV2LnRhcmdldC52YWx1ZS50cmltKCkudG9Mb3dlckNhc2UoKSA6ICcnIClcbiAgICAuZmlsdGVyKCB0ZXh0ID0+IHRleHQubGVuZ3RoID4gMiApXG4gICAgLnRocm90dGxlKCAxMDAwIClcbiAgICAuc2tpcER1cGxpY2F0ZXMoKTtcblxuY29uc3Qgc2VhcmNoQXBpID0gdGVybSA9Plxue1xuICAgIGxldCBvcHRpb25zID0gJyc7XG4gICAgJHNlYXJjaE9wdGlvbnMuZmluZCggJ2lucHV0OmNoZWNrZWQnICkuZWFjaCggKCBfLCBlbG0gKSA9PlxuICAgIHtcbiAgICAgICAgb3B0aW9ucyArPSAnJicgKyBlbmNvZGVVUklDb21wb25lbnQoIGVsbS52YWx1ZSApO1xuICAgIH0gKTtcblxuICAgIHJldHVybiBCYWNvbi5mcm9tUHJvbWlzZSggJC5hamF4KCBgL2FwaS9yZWNpcGVzP3E9JHt0ZXJtfSR7b3B0aW9uc31gICkgKTtcbn07XG5cbmNvbnN0IHN1Z2dlc3Rpb25zID0gdGhyb3R0bGVTZWFyY2guZmxhdE1hcExhdGVzdCggc2VhcmNoQXBpICk7XG5cbmNvbnN0IHN1YnNjcmlwdGlvbiA9IHN1Z2dlc3Rpb25zLnN1YnNjcmliZShcbiAgICBkYXRhID0+XG4gICAge1xuICAgICAgICBkaXNwbGF5UmVzdWx0cyggSlNPTi5wYXJzZSggZGF0YS52YWx1ZSgpICkubWF0Y2hlcyApO1xuICAgIH0sXG4gICAgZXJyb3IgPT5cbiAgICB7XG4gICAgICAgIGRpc3BsYXlFcnJvcigpO1xuICAgIH1cbik7XG5cbiRzZWFyY2hBdWRpby5iaW5kKCAnY2xpY2snLCBzcGVlY2hMaXN0ZW5lciApO1xuXG4kc2VhcmNoQWR2YW5jZWQuYmluZCggJ2NsaWNrJywgZSA9PiAkc2VhcmNoT3B0aW9ucy50b2dnbGVDbGFzcygnaGlkZGVuJykgKTtcblxuXG5jb25zdCBkaXNwbGF5UmVzdWx0cyA9IHJlY2lwZXMgPT5cbntcbiAgICBsZXQgaHRtbCA9IHJlY2lwZXMubWFwKCByZWNpcGUgPT5cbiAgICB7XG4gICAgICAgIGNvbnN0IGltYWdlID0gcmVjaXBlLmltYWdlVXJsc0J5U2l6ZVtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKCByZWNpcGUuaW1hZ2VVcmxzQnlTaXplICkucmVkdWNlKCAoIHByZSwgY3VyciApID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZSA8IGN1cnIgPyBjdXJyIDogcHJlO1xuICAgICAgICAgICAgfSwgMCApXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IG5hbWUgPSByZWNpcGUucmVjaXBlTmFtZTtcbiAgICAgICAgY29uc3QgcmF0aW5nID0gcmVjaXBlLnJhdGluZztcblxuICAgICAgICBjb25zdCBleGlzdGluZ0luZ3JlZGllbnRzID0gJHNlYXJjaFRleHRBcmVhLnZhbCgpLnRvTG93ZXJDYXNlKCkudHJpbSgpLnNwbGl0KCcgJyk7XG5cbiAgICAgICAgbGV0IG1pc3NpbmdJbmdyZWRpZW50cyA9IFtdO1xuICAgICAgICByZWNpcGUuaW5ncmVkaWVudHMuZm9yRWFjaCggaW5ncmVkaWVudCA9PlxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zdCBfaW5ncmVkaWVudCA9IGluZ3JlZGllbnQudG9Mb3dlckNhc2UoKS50cmltKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNob3VsZFB1c2ggPSBleGlzdGluZ0luZ3JlZGllbnRzLmV2ZXJ5KCBleGlzdGluZyA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxldCBsYXJnZXN0LCBzaG9ydGVzdDtcblxuICAgICAgICAgICAgICAgIGlmICggX2luZ3JlZGllbnQubGVuZ3RoID4gZXhpc3RpbmcubGVuZ3RoIClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhcmdlc3QgPSBfaW5ncmVkaWVudDtcbiAgICAgICAgICAgICAgICAgICAgc2hvcnRlc3QgPSBleGlzdGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGFyZ2VzdCA9IGV4aXN0aW5nO1xuICAgICAgICAgICAgICAgICAgICBzaG9ydGVzdCA9IF9pbmdyZWRpZW50O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGwgPSBfaW5ncmVkaWVudCA9PT0gZXhpc3RpbmcgfHwgbGFyZ2VzdC5pbmRleE9mKCBzaG9ydGVzdCApID4gLTE7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gIWw7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIGlmICggc2hvdWxkUHVzaCApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWlzc2luZ0luZ3JlZGllbnRzLnB1c2goIF9pbmdyZWRpZW50ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKTtcblxuXG4gICAgICAgIGNvbnN0IG1pc3NpbmdJbmdyZWRpZW50c1N0cmluZyA9IG1pc3NpbmdJbmdyZWRpZW50cy5tYXAoIGluZ3JlZGllbnQgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz0nbGFiZWwgbGFiZWwtZGVmYXVsdCcgc3R5bGU9XCJkaXNwbGF5OmlubGluZS1ibG9ja1wiPiR7aW5ncmVkaWVudH08L3NwYW4+YDtcbiAgICAgICAgfSApLmpvaW4oICcmbmJzcDsnICk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgYDxkaXYgY2xhc3M9XCJqcy1yZWNpcGUtLXBhbmVsIGNvbC1zbS00IGNvbC14cy02XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtpbWFnZS5yZXBsYWNlKCdzOTAtJywgJ3MzNjAtJyl9XCIgY2xhc3M9XCJpbWctcmVzcG9uc2l2ZVwiPjwvaW1nPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj5cbiAgICAgICAgICAgICAgICA8aDQ+JHtuYW1lfTwvaDQ+XG4gICAgICAgICAgICAgICAgPHNtYWxsPjxidXR0b24gY2xhc3M9J2J0biBidG4tcHJpbWFyeSBqcy1yZWNpcGUtLWNoZWNrb3V0Jz5CdXkgbWlzc2luZyBpbmdyZWRpZW50czwvYnV0dG9uPjwvc21hbGw+XG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJtYXJnaW4tdG9wOjE1cHg7XCI+JHttaXNzaW5nSW5ncmVkaWVudHNTdHJpbmd9PC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PmBcbiAgICAgICAgKTtcbiAgICB9ICkucmVkdWNlKCAoIGFjYywgc3BhbiwgaW5kZXggKSA9PlxuICAgIHtcbiAgICAgICAgaWYgKCBpbmRleCA9PT0gMCB8fMKgaW5kZXggPT09IDMgfHwgaW5kZXggPT09IDYgKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gYWNjICsgJzxkaXYgY2xhc3M9XCJqcy1yZWNpcGUtLXJvdyByb3dcIj4nICsgc3BhbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggaW5kZXggPT09IDIgfHwgaW5kZXggPT09IDUgfHwgaW5kZXggPT09IDggIClcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIGFjYyArIHNwYW4gKyAnPC9kaXY+JztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggaW5kZXggPT09IHJlY2lwZXMubGVuZ3RoIC0gMSApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gYWNjICsgc3BhbjtcbiAgICAgICAgfVxuICAgIH0sICcnICk7XG5cbiAgICAkc2VhcmNoUmVzdWx0cy5odG1sKCAkKCBodG1sICkgKTtcblxuICAgICQoICcuanMtcmVjaXBlLS1yb3cnICkuZWFjaCggKCBfLCByb3cgKSA9PlxuICAgIHtcbiAgICAgICAgY29uc3QgJHJvdyA9ICQoIHJvdyApO1xuXG4gICAgICAgIGxldCBoZWlnaHQ7XG4gICAgICAgICRyb3cuZmluZCggJy5qcy1yZWNpcGUtLXBhbmVsJyApLmVhY2goICggaSwgZWwgKSA9PlxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zdCAkZWwgPSAkKCBlbCApO1xuICAgICAgICAgICAgaWYgKCAhaGVpZ2h0IHx8ICRlbC5oZWlnaHQoKSA+IGhlaWdodCApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gJGVsLmhlaWdodCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgJHJvdy5maW5kKCAnLmpzLXJlY2lwZS0tcGFuZWwnICkuZWFjaCggKCBpLCBlbCApID0+XG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0ICRlbCA9ICQoIGVsICk7XG4gICAgICAgICAgICAkZWwuZmluZCggJy5wYW5lbC1ib2R5JyApLmNzcyggJ3BhZGRpbmctYm90dG9tJywgKGhlaWdodCArIDUwKSAtICRlbC5oZWlnaHQoKSApO1xuICAgICAgICAgICAgJGVsLmNzcygnbWluLWhlaWdodCcsIGhlaWdodCArIDUwICk7XG4gICAgICAgIH0gKTtcbiAgICB9ICk7XG5cblxuICAgICQoICcuanMtcmVjaXBlLS1jaGVja291dCcgKS5iaW5kKCAnY2xpY2snLCBldmVudCA9PlxuICAgIHtcbiAgICAgICAgY29uc3QgYnRuID0gJCggZXZlbnQudGFyZ2V0ICk7XG4gICAgICAgIGNvbnN0IGxhYmVscyA9IGJ0bi5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCAnLmxhYmVsJyApO1xuXG4gICAgICAgICQoICcuanMtcmVjaXBlLS1jaGVja291dCcgKS5hZGRDbGFzcyggJ2Rpc2FibGVkJyApO1xuICAgICAgICBidG4ucmVtb3ZlQ2xhc3MoICdkaXNhYmxlZCcgKTtcblxuICAgICAgICBsYWJlbHMuY3NzKCAnY3Vyc29yJywgJ3BvaW50ZXInICk7XG4gICAgICAgIGxhYmVscy5hZGRDbGFzcyggJ2xhYmVsLWluZm8nICk7XG4gICAgICAgIGxhYmVscy5yZW1vdmVDbGFzcyggJ2xhYmVsLWRlZmF1bHQnICk7XG4gICAgICAgIGxhYmVscy5iaW5kKCAnY2xpY2snLCBfZXZlbnQgPT5cbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgJGxhYmVsID0gJCggX2V2ZW50LnRhcmdldCApO1xuICAgICAgICAgICAgJGxhYmVsLmFkZENsYXNzKCAnbGFiZWwtd2FybmluZycgKTtcbiAgICAgICAgICAgICRsYWJlbC5yZW1vdmVDbGFzcyggJ2xhYmVsLWluZm8nICk7XG5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSAkbGFiZWwudGV4dCgpLnRyaW0oKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKCAnZnJlc2gnLCAnJyApXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoICdzbGljZWQnLCAnJyApXG4gICAgICAgICAgICAgICAgLnRyaW0oKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKCAvIC9nLCAnKycgKTtcblxuICAgICAgICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJGxhYmVsLmFkZENsYXNzKCdsYWJlbC1zdWNjZXNzJykucmVtb3ZlQ2xhc3MoJ2xhYmVsLXdhcm5pbmcnKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSAoKSA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICRsYWJlbC5hZGRDbGFzcygnbGFiZWwtc3VjY2VzcycpLnJlbW92ZUNsYXNzKCdsYWJlbC13YXJuaW5nJyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkLmdldCggJy9hcGkvY2FydC9hZGQ/aXRlbT0nICsgaXRlbSwgcmVzID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gcmVzLnVybDtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBpbWFnZSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgYnRuLm9mZiggJ2NsaWNrJyApO1xuXG4gICAgICAgIGJ0bi5iaW5kKCAnY2xpY2snLCBfZXZlbnQgPT5cbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWxzLm9mZiggJ2NsaWNrJyApO1xuXG4gICAgICAgICAgICB3aW5kb3cub3BlbiggJ2h0dHA6Ly9iZXJsaW4uYnJpbmdtZWlzdGVyLmRlL2NoZWNrb3V0L2NhcnQvJywgXCJfYmxhbmtcIiApO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGxhYmVscy5maWx0ZXIoICdsYWJlbC1zdWNjZXNzJyApLmVhY2goIGVsID0+XG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgICAgY29uc3QgaXRlbSA9ICQoIGVsICkudGV4dCgpXG4gICAgICAgICAgICAvLyAgICAgICAgIC5yZXBsYWNlKCAnZnJlc2gnLCAnJyApXG4gICAgICAgICAgICAvLyAgICAgICAgIC5yZXBsYWNlKCAnc2xpY2VkJywgJycgKVxuICAgICAgICAgICAgLy8gICAgICAgICAucmVwbGFjZSggJyAnLCAnKycgKTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAgICAgJC5nZXQoJy9hcGkvY2FydC9hZGQ/aXRlbT0nICsgaXRlbSwgcmVzID0+XG4gICAgICAgICAgICAvLyAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICAgICAgLy8gICAgICAgICBlbGVtZW50LnNyYyA9IHJlcy51cmw7XG4gICAgICAgICAgICAvLyAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGVsZW1lbnQgKTtcbiAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIC8vIH0gKTtcbiAgICAgICAgfSApO1xuICAgIH0gKTtcblxufTtcblxuY29uc3QgZGlzcGxheUVycm9yID0gKCkgPT5cbntcblxufTtcbiIsImltcG9ydCB7IGNhcGl0YWxpemUgfSBmcm9tICcuL3V0aWxzJztcblxuY29uc3QgJHNlYXJjaFRleHRBcmVhID0gJCggJy5qcy1yZWNpcGUtLXNlYXJjaCcgKTtcbmNvbnN0IHN0YXJ0X2ltZyA9ICQoICcuanMtcmVjaXBlLS1zZWFyY2gtLWF1ZGlvIGltZycgKTtcblxuY29uc3QgcmVjb2duaXRpb24gPSBuZXcgd2luZG93LndlYmtpdFNwZWVjaFJlY29nbml0aW9uKCk7XG5yZWNvZ25pdGlvbi5jb250aW51b3VzID0gdHJ1ZTtcbnJlY29nbml0aW9uLmludGVyaW1SZXN1bHRzID0gdHJ1ZTtcbnJlY29nbml0aW9uLmxhbmcgPSAnZW4tVVMnO1xubGV0IHJlY29nbml6aW5nID0gZmFsc2U7XG5sZXQgZmluYWxfdHJhbnNjcmlwdDtcbmxldCB0aW1lcjtcblxucmVjb2duaXRpb24ub25zdGFydCA9ICgpID0+XG57XG4gICAgcmVjb2duaXppbmcgPSB0cnVlO1xuICAgIHN0YXJ0X2ltZy5hdHRyKCAnc3JjJywgJy8vd3d3Lmdvb2dsZS5jb20vaW50bC9lbi9jaHJvbWUvYXNzZXRzL2NvbW1vbi9pbWFnZXMvY29udGVudC9taWMtYW5pbWF0ZS5naWYnICk7XG59O1xuXG5yZWNvZ25pdGlvbi5vbmVuZCA9ICgpID0+XG57XG4gICAgcmVjb2duaXppbmcgPSBmYWxzZTtcblxuICAgIHN0YXJ0X2ltZy5hdHRyKCAnc3JjJywgJy8vd3d3Lmdvb2dsZS5jb20vaW50bC9lbi9jaHJvbWUvYXNzZXRzL2NvbW1vbi9pbWFnZXMvY29udGVudC9taWMuZ2lmJyApO1xuXG4gICAgaWYgKCAhZmluYWxfdHJhbnNjcmlwdCApXG4gICAge1xuICAgICAgICByZXR1cm47XG4gICAgfVxufTtcblxucmVjb2duaXRpb24ub25yZXN1bHQgPSBldmVudCA9Plxue1xuICAgIGxldCBpbnRlcmltX3RyYW5zY3JpcHQgPSAnJztcblxuICAgIGlmICggdHlwZW9mIGV2ZW50LnJlc3VsdHMgPT09ICd1bmRlZmluZWQnIClcbiAgICB7XG4gICAgICAgIHJlY29nbml0aW9uLm9uZW5kID0gbnVsbDtcbiAgICAgICAgcmVjb2duaXRpb24uc3RvcCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSBldmVudC5yZXN1bHRJbmRleDsgaSA8IGV2ZW50LnJlc3VsdHMubGVuZ3RoOyArK2kgKVxuICAgIHtcbiAgICAgICAgaWYgKCBldmVudC5yZXN1bHRzW2ldLmlzRmluYWwgKVxuICAgICAgICB7XG4gICAgICAgICAgICBmaW5hbF90cmFuc2NyaXB0ICs9IGV2ZW50LnJlc3VsdHNbaV1bMF0udHJhbnNjcmlwdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIGludGVyaW1fdHJhbnNjcmlwdCArPSBldmVudC5yZXN1bHRzW2ldWzBdLnRyYW5zY3JpcHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkc2VhcmNoVGV4dEFyZWEudGV4dCggY2FwaXRhbGl6ZSggZmluYWxfdHJhbnNjcmlwdCB8fCBpbnRlcmltX3RyYW5zY3JpcHQgKSApO1xuICAgICRzZWFyY2hUZXh0QXJlYS50cmlnZ2VyKCAnY2hhbmdlJyApO1xufTtcblxuXG5leHBvcnQgY29uc3Qgc3BlZWNoTGlzdGVuZXIgPSBldmVudCA9Plxue1xuICAgIGlmICggcmVjb2duaXppbmcgKVxuICAgIHtcbiAgICAgICAgcmVjb2duaXRpb24uc3RvcCgpO1xuICAgICAgICBjbGVhckludGVydmFsKCB0aW1lciApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZpbmFsX3RyYW5zY3JpcHQgPSAnJztcbiAgICAkc2VhcmNoVGV4dEFyZWEudGV4dCggJycgKTtcblxuICAgIHJlY29nbml0aW9uLnN0YXJ0KCk7XG4gICAgc3RhcnRfaW1nLmF0dHIoICdzcmMnLCAnLy93d3cuZ29vZ2xlLmNvbS9pbnRsL2VuL2Nocm9tZS9hc3NldHMvY29tbW9uL2ltYWdlcy9jb250ZW50L21pYy1zbGFzaC5naWYnICk7XG4gICAgc3RhcnRUaW1lcigpO1xufTtcblxuY29uc3Qgc3RhcnRUaW1lciA9ICgpID0+XG57XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KCAoKSA9PlxuICAgIHtcbiAgICAgICAgcmVjb2duaXRpb24uc3RvcCgpO1xuICAgICAgICBjbGVhckludGVydmFsKCB0aW1lciApO1xuICAgIH0sIDQwMDAgKTtcbn07XG4iLCJjb25zdCBmaXJzdF9jaGFyID0gL1xcUy87XG5leHBvcnQgY29uc3QgY2FwaXRhbGl6ZSA9IHMgPT4gcy5yZXBsYWNlKCBmaXJzdF9jaGFyLCBtID0+IG0udG9VcHBlckNhc2UoKSApO1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGV2ZW5zaHRlaW5fZGlzdGFuY2UjSXRlcmF0aXZlX3dpdGhfdHdvX21hdHJpeF9yb3dzXG5leHBvcnQgY29uc3QgbGV2ZW5zaHRlaW4gPSAoIHN0cl9tLCBzdHJfbiApID0+XG57XG4gICAgbGV0IHN0cl9tX2xlbiA9IHN0cl9tLmxlbmd0aDtcbiAgICBsZXQgc3RyX25fbGVuID0gc3RyX24ubGVuZ3RoO1xuXG4gICAgaWYgKCBzdHJfbSA9PT0gc3RyX24gKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgaWYgKCBzdHJfbV9sZW4gPT09IDAgKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHN0cl9uX2xlbjtcbiAgICB9XG5cbiAgICBpZiAoIHN0cl9uX2xlbiA9PT0gMCApXG4gICAge1xuICAgICAgICByZXR1cm4gc3RyX21fbGVuO1xuICAgIH1cblxuICAgIGxldCB2MCA9IG5ldyBVaW50OEFycmF5KCBzdHJfbl9sZW4gKyAxICk7XG4gICAgbGV0IHYxID0gbmV3IFVpbnQ4QXJyYXkoIHN0cl9uX2xlbiArIDEgKTtcblxuICAgIC8vIGluaXRpYWxpemUgdjAgKHRoZSBwcmV2aW91cyByb3cgb2YgZGlzdGFuY2VzKVxuICAgIC8vIHRoaXMgcm93IGlzIEFbMF1baV06IGVkaXQgZGlzdGFuY2UgZm9yIGFuIGVtcHR5IHNcbiAgICAvLyB0aGUgZGlzdGFuY2UgaXMganVzdCB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgdG8gZGVsZXRlIGZyb20gdFxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN0cl9uX2xlbiArIDE7IGkrKyApXG4gICAge1xuICAgICAgICB2MFtpXSA9IGk7XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3RyX21fbGVuOyBpKyspXG4gICAge1xuICAgICAgICAvLyBjYWxjdWxhdGUgdjEgKGN1cnJlbnQgcm93IGRpc3RhbmNlcykgZnJvbSB0aGUgcHJldmlvdXMgcm93IHYwXG5cbiAgICAgICAgLy8gZmlyc3QgZWxlbWVudCBvZiB2MSBpcyBBW2krMV1bMF1cbiAgICAgICAgLy8gICBlZGl0IGRpc3RhbmNlIGlzIGRlbGV0ZSAoaSsxKSBjaGFycyBmcm9tIHMgdG8gbWF0Y2ggZW1wdHkgdFxuICAgICAgICB2MVswXSA9IGkgKyAxO1xuXG4gICAgICAgIC8vIHVzZSBmb3JtdWxhIHRvIGZpbGwgaW4gdGhlIHJlc3Qgb2YgdGhlIHJvd1xuICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBzdHJfbl9sZW47IGorKyApXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBjb3N0ID0gKCBzdHJfbVtpXSA9PT0gc3RyX25bal0gKSA/IDAgOiAxO1xuICAgICAgICAgICAgdjFbaiArIDFdID0gTWF0aC5taW4oIHYxW2pdICsgMSwgdjBbaiArIDFdICsgMSwgdjBbal0gKyBjb3N0ICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb3B5IHYxIChjdXJyZW50IHJvdykgdG8gdjAgKHByZXZpb3VzIHJvdykgZm9yIG5leHQgaXRlcmF0aW9uXG4gICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHN0cl9tX2xlbiArIDE7IGorKyApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHYwW2pdID0gdjFbal07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdjFbc3RyX25fbGVuXTtcbn07XG5cblxuZXhwb3J0IGNvbnN0IGZ1enp5TWF0Y2ggPSAoIGxpc3QsIHF1ZXJ5ICkgPT5cbntcbiAgICBsZXQgX3F1ZXJ5ID0gUmVnRXhwKCBxdWVyeS5yZXBsYWNlKCAvIC9nLCAnJyApLnNwbGl0KCAnJyApLmpvaW4oICcuKj8nICksICdnaScgKTtcblxuICAgIHJldHVybiBsaXN0LmZpbHRlciggKCBzb25nICkgPT5cbiAgICB7XG4gICAgICAgIHJldHVybiAhX3F1ZXJ5LnRlc3QoIHNvbmcudGl0bGUgKTtcbiAgICB9ICk7XG59O1xuIl19
