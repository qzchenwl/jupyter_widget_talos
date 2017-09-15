var jupyter_widget_talos = require('jupyter_widget_talos');

var jupyterlab_widgets = require('@jupyter-widgets/jupyterlab-manager');

module.exports = {
  id: 'jupyter.extensions.jupyter_widget_talos',
  requires: [jupyterlab_widgets.INBWidgetExtension],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'jupyter_widget_talos',
          version: jupyter_widget_talos.version,
          exports: jupyter_widget_talos
      });
  },
  autoStart: true
};
