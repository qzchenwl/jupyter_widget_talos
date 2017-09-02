from ._version import version_info, __version__

from .talos import *

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'jupyter_widget_talos',
        'require': 'jupyter_widget_talos/extension'
    }]
