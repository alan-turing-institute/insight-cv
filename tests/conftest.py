from scivision.io import package_from_config
from scivision.io import PretrainedModel

import subprocess
import sys
import fsspec
import yaml
import pytest

# Set up some global vars for tests that require an example model
file = fsspec.open('tests/test_model_scivision.yml')
with file as config_file:
    stream = config_file.read()
    imagenet_model_config = yaml.safe_load(stream)


# Assign the model config to global var
@pytest.fixture(scope='session', autouse=True)
def IMAGENET_MODEL_CONFIG(request):
    return imagenet_model_config


# Create the model
@pytest.fixture(scope='session', autouse=True)
def IMAGENET_MODEL(request):
    return PretrainedModel(imagenet_model_config)


# The dataset to run model on
@pytest.fixture(scope='session', autouse=True)
def KOALA(request):
    return 'tests/img/koala.jpeg'


# Install the model package so it can be used in tests
subprocess.check_call([sys.executable, "-m", "pip", "install", package_from_config(imagenet_model_config)])


# Set up some global vars for tests that require an example data plugin
file = fsspec.open('tests/test_data_plugin.yml')
with file as config_file:
    stream = config_file.read()
    data_plugin_config = yaml.safe_load(stream)


# Install the data plugin package so it can be used in tests
subprocess.check_call([sys.executable, "-m", "pip", "install", package_from_config(data_plugin_config)])
