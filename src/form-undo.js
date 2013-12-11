var FormList, FormObserver, InputValue,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

FormList = (function() {
  var cursor, list;

  function FormList() {}

  list = [];

  cursor = -1;

  FormList.prototype.add_list = function(input) {
    if (!(input instanceof InputValue)) {
      return;
    }
    if (cursor < list.length - 1) {
      list = list.slice(0, (cursor - 1) + 1 || 9e9);
      this.before_cursor();
    }
    this.last_cursor();
    list.push(input);
    console.log(this.values());
    return this.next_cursor();
  };

  FormList.prototype.next = function() {
    var node;
    if (cursor >= list.length - 1) {
      alert("変更履歴がありません");
      return;
    }
    if (cursor % 2 === 0) {
      this.next_cursor();
    } else if (cursor % 2 === 1) {
      this.next_cursor(2);
    } else {
      this.next_cursor();
    }
    node = list[cursor];
    return node.input_object;
  };

  FormList.prototype.before = function() {
    var node;
    if (cursor <= 0) {
      alert("変更履歴がありません");
      return;
    }
    if (cursor % 2 === 0) {
      this.before_cursor(2);
    } else if (cursor % 2 === 1) {
      this.before_cursor();
    }
    node = list[cursor];
    return node.input_object;
  };

  FormList.prototype.last = function() {
    var node;
    node = this.last_node();
    return node.input_object;
  };

  FormList.prototype.last_node = function() {
    var node;
    if (list.length === 0) {
      alert("参照できる項目がありません");
    }
    return node = list[cursor];
  };

  FormList.prototype.next_cursor = function(num) {
    if (num == null) {
      num = 1;
    }
    return cursor = cursor + num;
  };

  FormList.prototype.before_cursor = function(num) {
    if (num == null) {
      num = 1;
    }
    return cursor = cursor - num;
  };

  FormList.prototype.last_cursor = function(num) {
    if (num == null) {
      num = 1;
    }
    console.log(list.length);
    return cursor = list.length - 1;
  };

  FormList.prototype.current_cursor = function() {
    return cursor;
  };

  FormList.prototype.inspect = function() {
    console.log(cursor);
    return console.log(list);
  };

  FormList.prototype.values = function() {
    var val, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      val = list[_i];
      _results.push(val.input_object.value);
    }
    return _results;
  };

  return FormList;

})();

InputValue = (function() {

  function InputValue(obj) {
    var option, values;
    if (obj.type === "checkbox") {
      this.input_object = {
        elem: obj,
        value: obj.checked
      };
    } else if (obj.type === "select-one") {
      this.input_object = {
        elem: obj,
        value: obj.selectedIndex
      };
    } else if (obj.type === "select-multiple") {
      values = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = obj.length; _i < _len; _i++) {
          option = obj[_i];
          if (option.selected) {
            _results.push(option.value);
          }
        }
        return _results;
      })();
      this.input_object = {
        elem: obj,
        value: values
      };
    } else {
      this.input_object = {
        elem: obj,
        value: obj.value
      };
    }
  }

  InputValue.prototype.input_object = InputValue.input_object;

  InputValue.prototype.toString = function() {
    return "InputValue";
  };

  return InputValue;

})();

FormObserver = (function() {
  var focus_obj, list;

  list = new FormList;

  focus_obj = null;

  function FormObserver(form) {
    var input, _i, _len, _ref,
      _this = this;
    _ref = $(form).find("input, select, textarea");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      input = _ref[_i];
      $(input).bind("focus", function(event) {
        var radio, _j, _len1, _ref1, _results;
        if (_this.event_target(event).type === "radio") {
          _ref1 = document.getElementsByName(_this.event_target(event).name);
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            radio = _ref1[_j];
            if (radio.checked) {
              _results.push(focus_obj = new InputValue(radio));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        } else {
          return focus_obj = new InputValue(_this.event_target(event));
        }
      });
      switch (input.type) {
        case "text":
        case "textarea":
        case "checkbox":
        case "select-one":
        case "radio":
        case "select-multiple":
          $(input).bind("change", function(event) {
            var change_obj;
            if (focus_obj != null) {
              if (focus_obj instanceof InputValue) {
                list.add_list(focus_obj);
                change_obj = new InputValue(_this.event_target(event));
                list.add_list(change_obj);
              }
            } else {
              if (focus_obj == null) {
                if ((_this.event_target(event).type === "select-one" && _this.event_target(event).size > 1) || _this.event_target(event).type === "select-multiple") {
                  list.add_list(list.last_node());
                  change_obj = new InputValue(_this.event_target(event));
                  list.add_list(change_obj);
                }
              }
            }
            return focus_obj = null;
          });
          break;
        case "password":
        case "hidden":
        case "submit":
        case "reset":
        case "button":
        case "image":
        case "file":
          break;
        default:
          console.log(input.type);
      }
    }
  }

  FormObserver.prototype.undo = function() {
    this.set_elem(list.before());
    return false;
  };

  FormObserver.prototype.redo = function() {
    this.set_elem(list.next());
    return false;
  };

  FormObserver.prototype.inspect = function() {
    list.inspect();
    return false;
  };

  FormObserver.prototype.set_elem = function(node) {
    var option, radio, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results, _results1;
    if (node != null) {
      if (node.elem.type === "checkbox") {
        return node.elem.checked = node.value;
      } else if (node.elem.type === "select-one") {
        return node.elem.selectedIndex = node.value;
      } else if (node.elem.type === "select-multiple") {
        _ref = node.elem;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          option = _ref[_i];
          option.selected = false;
          if (_ref1 = option.value, __indexOf.call(node.value, _ref1) >= 0) {
            _results.push(option.selected = true);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else if (node.elem.type === "radio") {
        _ref2 = document.getElementsByName(node.elem.name);
        _results1 = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          radio = _ref2[_j];
          radio.checked = false;
          if (radio.value === node.value) {
            _results1.push(radio.checked = true);
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      } else {
        return node.elem.value = node.value;
      }
    }
  };

  FormObserver.prototype.event_target = function(event) {
    if (event.currentTarget != null) {
      return event.currentTarget;
    } else {
      return event.srcElement;
    }
  };

  return FormObserver;

})();
