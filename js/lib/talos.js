var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');

// Custom View. Renders the widget model.
var TalosView = widgets.DOMWidgetView.extend({
  render: function() {
    var html = `
                <div class='TalosView'>
                    <style>
                        .TalosView .preview table {
                            min-width: 300px;
                        }

                        .TalosView td, th {
                            padding: 5px;
                            border-left: 1px solid #e0e0e0;
                        }

                        .TalosView tr {
                            background-color: #fafafa;
                        }

                        .TalosView tr:nth-child(even) {
                            background-color: #f0f0f0;
                        }

                        .TalosView th {
                            background-color: #ededed;
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

                    <div class='control'>
                        <button class='stop'>停止执行</button>
                        QID: <span class='qid'></span>
                    </div>
                    <pre class='engine-log'>
                        Loading...
                    </pre>
                    <div class='preview'>
                        Loading...
                    </div>
                </div>
            `;

    this.$el.html(html);

    this.model.on('change:qid'     , this._qid_changed     , this);
    this.model.on('change:info'    , this._info_changed    , this);
    this.model.on('change:preview' , this._preview_changed , this);

    this._qid_changed();
    this._info_changed();
    this._preview_changed();

    this._stop = false;
    this._ping = this._ping.bind(this);
    this._ping();
  },

  events: {
    'click .stop': '_handle_stop'
  },

  _handle_stop: function() {
    this._stop = true;
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
    var caption = tag('caption');

    var caption_html = caption('Full result stored in vairable <strong>_.result</strong>');
    var headers_html = thead(tr(headers.map(x => th(x)).join('\n')));
    var rows_html = tbody(rows.map(row => tr(row.map(cell => td(cell)).join('\n'))).join('\n'));
    this.$el.find('.preview').html(table(caption_html + headers_html + rows_html));
  },

  _ping: function() {
    if (this._stop || Object.keys(this.model.get('preview')).length > 0) {
      return;
    }

    this.send({'event': 'ping'});
    setTimeout(this._ping, 1000);
  }
});

module.exports = {
    TalosView : TalosView
};
