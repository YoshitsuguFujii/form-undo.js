======================
formの取り消す(undo)・やり直す(redo)を提供するjs

要 Jquery(require jquery)

使い方
------
# 対象となるformを設定します(set html element)
form = new FormObserver('form')
form = new FormObserver('.form-class')
form = new FormObserver('#form-id')

ボタンのclickイベントとかで以下を呼び出します(then you can call function when you need.  like as click event)
# 戻す(redo)
form.undo()
# やり直し(undo)
form.redo()

