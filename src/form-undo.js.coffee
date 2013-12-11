##
## FormList
# InputValueの値を順番に保持する
class FormList
  list = []
  cursor = -1

  add_list: (input)->
    unless input instanceof(InputValue)
      return

    # 今のカーソルより先にあるのは削除
    if cursor < list.length-1
      list = list[0..cursor-1]
      @before_cursor()

    @last_cursor()
    list.push(input)
    console.log(@values())
    @next_cursor()

  next: ->
    if cursor >= list.length-1
      alert "変更履歴がありません"
      return

    # 0または偶数なら
    if (cursor % 2 == 0)
      @next_cursor()
    # 奇数なら
    else if (cursor % 2 == 1)
      @next_cursor(2)
    else
      @next_cursor()

    node = list[cursor]
    return node.input_object
  before: ->
    if cursor <= 0
      alert "変更履歴がありません"
      return

    # 偶数なら
    if (cursor % 2 == 0)
      @before_cursor(2)
    # 奇数なら
    else if (cursor % 2 == 1)
      @before_cursor()

    node = list[cursor]
    return node.input_object

  last: ->
    node = @last_node()
    return node.input_object

  last_node: ->
    if list.length == 0
      alert "参照できる項目がありません"

    node = list[cursor]

  next_cursor: (num = 1)->
    cursor = cursor + num
  before_cursor: (num = 1)->
    cursor = cursor - num
  last_cursor: (num = 1)->
    console.log(list.length)
    cursor = list.length-1
  current_cursor: ->
    cursor
  inspect: ->
    console.log(cursor)
    console.log(list)
  values: ->
    for val in list
      val.input_object.value

## InputValue
# formのinput要素をキーに、値にinput要素の値を保持するクラス。
# 主にフォーカス時と、chageイベント時に値が押し込まれる
class InputValue
  constructor: (obj) ->
    if obj.type == "checkbox"
      @input_object = {elem: obj, value: obj.checked}
    else if obj.type == "select-one"
      @input_object = {elem: obj, value: obj.selectedIndex}
    else if obj.type == "select-multiple"
      values = (option.value for option in obj when option.selected) # 選択されている要素のみ取得
      @input_object = {elem: obj, value: values}
    else
      @input_object = {elem: obj, value: obj.value}
  input_object: @input_object
  toString: -> "InputValue"

class FormObserver
  list = new FormList
  focus_obj = null

  constructor: (form) ->
    # 指定要素にバインドしていく
    for input in $(form).find("input, select, textarea")

      # フォーカス時の値をInputValueインスタンスを上書き保存
      $(input).bind "focus", ( event ) =>
        if @event_target(event).type == "radio"
          # radioだけはtrueのものだけとる
          for radio in document.getElementsByName(@event_target(event).name)
            if radio.checked
              focus_obj = new InputValue(radio)
        else
          # 最新のフォーカスを常に上書きで代入
          focus_obj = new InputValue(@event_target(event))

      # 値設定時には値をInputValueインスタンスに保存
      switch input.type
        when "text", "textarea", "checkbox", "select-one", "radio", "select-multiple"
          $(input).bind "change", ( event ) =>
            if focus_obj?
              if focus_obj instanceof(InputValue)
                list.add_list(focus_obj)
                change_obj = new InputValue(@event_target(event))
                list.add_list(change_obj)
            else
              # 複数選択selectボックスはそのまま次の値を選ぶとfocusイベントが発生しないので
              unless focus_obj?
                if (@event_target(event).type == "select-one" && @event_target(event).size > 1) || @event_target(event).type == "select-multiple"
                  list.add_list(list.last_node())
                  change_obj = new InputValue(@event_target(event))
                  list.add_list(change_obj)
            focus_obj = null
        when "password", "hidden", "submit", "reset", "button", "image", "file"
          # これらは管理しない
        else
          console.log(input.type)

  # 戻す
  undo: ->
    @set_elem(list.before())
    false
  # やり直し
  redo: ->
    @set_elem(list.next())
    false
  inspect: ->
    list.inspect()
    false
  set_elem: (node)->
    if node?
      if node.elem.type == "checkbox"
        node.elem.checked = node.value
      else if node.elem.type == "select-one"
        node.elem.selectedIndex = node.value
      else if node.elem.type == "select-multiple"
        for option in node.elem
          option.selected = false
          if option.value in node.value
            option.selected = true
      else if node.elem.type == "radio"
        for radio in document.getElementsByName(node.elem.name)
          radio.checked = false
          if radio.value == node.value
            radio.checked = true
      else
        node.elem.value = node.value

  event_target: (event) ->
    if event.currentTarget?
      event.currentTarget
    else
      event.srcElement


# typeによるsetとchangeとかを吸収してくれるアダプタクラス的なの

# for debug
$ ->
  form = new FormObserver('form')

  $('body').before('<button class="btn before_btn" name="button" onClick="alert("sdfaf")">戻す</button>')
  $('body').before('<button class="btn next_btn" name="button" onClick="alert("sdfaf")">やり直し</button>')
  $('body').before('<button class="btn confirm_btn" name="button" onClick="alert("sdfaf")">console確認</button>')

  $('body').append('<button class="btn before_btn" name="button" onClick="alert("sdfaf")">戻す</button>')
  $('body').append('<button class="btn next_btn" name="button" onClick="alert("sdfaf")">やり直し</button>')
  $('body').append('<button class="btn confirm_btn" name="button" onClick="alert("sdfaf")">console確認</button>')

  $('.before_btn').click ->
    form.undo()

  $('.next_btn').click ->
    form.redo()

  $('.confirm_btn').click ->
    form.inspect()
