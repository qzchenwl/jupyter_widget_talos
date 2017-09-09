#!/bin/bash

python setup.py build
pip install -e .
jupyter nbextension install --py --symlink --sys-prefix jupyter_widget_talos
jupyter nbextension enable --py --sys-prefix jupyter_widget_talos

jupyter notebook
