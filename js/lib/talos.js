var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');

// Custom View. Renders the widget model.
var TalosView = widgets.DOMWidgetView.extend({
  render: function() {
    var html = `
                <div class='TalosView'>
                    <style>
                        .TalosView .display table {
                            min-width: 300px;
                            font-size: 12px;
                        }

                        .TalosView td, th {
                            padding: 5px;
                            text-align: right;
                            vertical-align: middle;
                            padding: 0.5em 0.5em;
                            line-height: normal;
                            white-space: normal;
                            max-width: none;
                            border: none;
                        }

                        .TalosView tbody tr:nth-child(odd) {
                            background-color: #f5f5f5;
                        }

                        .TalosView tbody tr:hover {
                            background: rgba(66, 165, 245, 0.2);
                        }

                        .TalosView thead {
                            border-bottom: 1px solid black;
                        }

                        .TalosView tfoot {
                            border-top: 1px solid black;
                        }

                        .TalosView tfoot td {
                            text-align: center;
                        }

                        .TalosView .engine-log {
                            width: 100%;
                            height: 200px;
                            overflow: auto;
                            border: solid lightgray 1px;
                            margin: 5px 0;
                            padding: 5px;
                        }

                        .TalosView .preview {
                            overflow: auto;
                            border: solid lightgray 1px;
                            margin: 5px 0;
                            padding: 5px;
                        }
                    </style>
                    <div class='display'>
                        <div class='control'>
                            <button class='stop'>停止执行</button>
                            QID: <span class='qid'></span>
                        </div>
                        <pre class='engine-log'>
                            加载中...
                        </pre>
                        <div class='preview'>
                            加载中...
                        </div>
                    </div>
                </div>
            `;

    this.$el.html(html);

    this.model.on('change:qid'     , this._qid_changed     , this);
    this.model.on('change:info'    , this._info_changed    , this);
    this.model.on('change:preview' , this._preview_changed , this);
    this.model.on('change:finished', this._finished_changed, this);

    this._qid_changed();
    this._info_changed();
    this._preview_changed();

    this._ping = this._ping.bind(this);

    if (this.model.get('auto_update')) {
        this._ping();
    }
  },

  events: {
    'click .stop': '_handle_stop'
  },

  _handle_stop: function() {
    this.model.set('finished', true);
    this.touch();
  },

  _qid_changed: function() {
    this.$el.find('.qid').text(this.model.get('qid'));
  },

  _info_changed: function() {
    var el = this.$el.find('.engine-log')[0];
    el.innerText = this.model.get('info')['engine_log'];
    el.scrollTop = el.scrollHeight;
  },

  _preview_changed: function() {
    var preview = this.model.get('preview');
    var headers = preview.headers;
    var rows = preview.rows;
    if (!headers || !rows) {
      return;
    }

    var tag = t => x => `<${t}>${x}</${t}>`;
    var th = tag('th');
    var tr = tag('tr');
    var td = tag('td');
    var table = tag('table');
    var thead = tag('thead');
    var tbody = tag('tbody');
    var tfoot = tag('tfoot');

    var tfoot_html = tfoot(`<tr><td colspan='${headers.length}'>完整结果存在变量 <strong>_.result</strong> 里</td></tr>`);
    var thead_html = thead(tr(headers.map(x => th(x)).join('\n')));
    var tbody_html = tbody(rows.map(row => tr(row.map(cell => td(cell)).join('\n'))).join('\n'));
    this.$el.find('.display').html(table(thead_html + tbody_html + tfoot_html));
  },

  _finished_changed: function() {
    this.$el.find('button.stop')[0].disabled = this.model.get('finished');
  },

  _ping: function() {
    if (this.model.get('finished') || Object.keys(this.model.get('preview')).length > 0) {
      return;
    }

    this.send({'event': 'ping'});
    setTimeout(this._ping, 1000);
  }
});

module.exports = {
    TalosView : TalosView
};
