from __future__ import print_function
from pytalos.client import AsyncTalosClient
from traitlets import Unicode, Dict
import ipywidgets as widgets
import pandas as pd
import os

@widgets.register
class TalosWidget(widgets.DOMWidget):
    """An talos widget"""
    _view_name = Unicode('TalosView').tag(sync=True)
    _view_module = Unicode('jupyter_widget_talos').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    qid = Unicode().tag(sync=True)
    info = Dict().tag(sync=True)
    preview = Dict().tag(sync=True)


    def __init__(self, engine, dsn, sql, **kwargs):
        super(TalosWidget, self).__init__(**kwargs)

        self.finished = False
        self.client = AsyncTalosClient(username=os.environ['TALOS_USERNAME'], password=os.environ['TALOS_PASSWORD'])
        self.client.open_session()
        self.qid = self.client.submit(engine=engine, dsn=dsn, statement=sql)
        self.info = self.client.get_query_info(self.qid)

        self.on_msg(self._handle_custom_msg)


    def _handle_custom_msg(self, content, buffers):
        if 'event' in content and content['event'] == 'ping':
            return self.update()


    def update(self):
        if self.finished:
            return False

        self.info = self.client.get_query_info(self.qid)

        status = self.info['status']

        if (status == 'FINISHED'):
            self.finished = True

            result  = self.client.fetch_all(self.qid)
            data    = result['data']
            headers = list(map(lambda c: c['name'], result['columns']))

            self.preview = {
                'headers': headers,
                'rows': data[0:10]
            }

            self.result = pd.DataFrame(data=data, columns=headers)

        elif status in ['ERROR', 'FAILED', 'KILLED']:
            self.finished = True
            self.preview = {
                'headers': ['[' + status + ']'],
                'rows': [[self.info['message']]]
            }

        return True

