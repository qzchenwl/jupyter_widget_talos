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
                            font-size: 12px;
                        }

                        .TalosView td, th {
                            padding: 5px;
                        }

                        .TalosView tbody tr:nth-child(odd) {
                            background-color: #f5f5f5;
                        }

                        .TalosView thead {
                            border-bottom: 1px solid black;
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
    var caption = tag('caption');

    var caption_html = caption('Full result stored in vairable <strong>_.result</strong>');
    var headers_html = thead(tr(headers.map(x => th(x)).join('\n')));
    var rows_html = tbody(rows.map(row => tr(row.map(cell => td(cell)).join('\n'))).join('\n'));
    this.$el.html(table(caption_html + headers_html + rows_html));
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
