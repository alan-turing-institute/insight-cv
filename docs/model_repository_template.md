# Scivision model repository template

In order for `scivision` to be able to load and run a computer vision (CV) model, a GitHub repository containing configuration for one or more models must first be created.

This guide explains how to set up a GitHub repository for your CV model(s) compatible with scivision.

This is also a pre-requisite for adding the model to the scivision "catalog", enabling other users of scivision to use it. To learn how to do this, consult the [contributor page](../contributing.md#gift-extending-the-scivision-catalog) after setting up your model as per this guide.

## 📚 Contents

- 🧱 [Model repo structure](#-model-repo-structure)
- 📁 [Essential repo components](#-essential-repo-components)
  - 🟢 [Model code](#-model-code)
  - 🖋️ [Model config file](#%EF%B8%8F-model-config-file)
  <!-- - Model adapter code (TODO: for a later version of scivision)-->
  - 📄 [Installation documentation](#-installation-documentation)
  - 📜 [Software licence](#-software-licence)
- 🗂️ [Non-essential repo components](#%EF%B8%8F-non-essential-repo-components)
  - 🐍 [Installability with pip](#-installability-with-pip)
  - 🧪 [Tests](#-tests)
  - 📊 [Example data](#-example-data)
- 🗃️ [Example model repos](#%EF%B8%8F-example-model-repos)

## 🧱 Model repo structure

The model repo should be roughly structured like so, where `exampleuser` is the GitHub user and `comp_vis` is the name of the repo that user has created, containing the model(s). The essential components for the repo are marked by an asterisk (*):

<!-- TODO: update so that there are two levels of "essential", level 1 being catalog inclusion and level 2 being working with `load_pretrained_model` -->

```
exampleuser/comp_vis
│   README           *
│   LICENSE          *
│   setup.py
│   requirements.txt
│   
└───.scivision
│   │   model.yml    *
│   
└───comp_vis
│   │   model.py     *
│   │   utils.py
│   │   __init__.py
│   
└───tests
│   │  test_modelA.py
│   │  test_modelB.py
│   │    ...
│   
└───example_data
    │   data_1.csv
    │   data_2.csv
    │   ...
```

## 📁 Essential repo components

The essential components of a scivision model repository include everything that is required to set up your model repository so it is suitable for inclusion in the scivision catalog.

### 🟢 Model code

- the model code, or a script that imports the model from elsewhere

### 🖋️ Model config file

The default name for the config file included in your repo should be `model.yml`, and should be kept in the `.scivision` directory. Take a look at this config from one of our example model repositories: [alan-turing-institute/plankton-cefas-scivision](https://github.com/alan-turing-institute/plankton-cefas-scivision):

```yaml
name: resnet50_cefas_model
url: https://github.com/alan-turing-institute/plankton-cefas-scivision
import: resnet50_cefas
model: resnet50
args:
    label_level: label3_detritus
prediction_fn:
    call: predict_batch
    args:
        X: image
    kwargs:
        batch_size: 3
```

What do the fields of this `model.yml` config refer to?

- `name`: arbitrary name for the specified model(s)
- `url`: points to the repo url
- `import`: the folder containing the model code
- `model`: the name of the model class specified in "model.py" (within the "import" folder)
- `args`: key/value pairs for any arguments of the model class
- `prediction_fn`:
  - `call`: the name of the model class' prediction function
  - `args`: key/value pairs for any arguments of the prediction function
  - `kwargs`: key/value pairs for any key word arguments of the prediction function

It's also possible to specify multiple models from the same model repository. For an example config that demonstrates this, see [scivision-test-plugin/.scivision/model.yml](https://github.com/alan-turing-institute/scivision-test-plugin/blob/main/.scivision/model.yml).

### 📄 Installation documentation

A `README`, which includes detailed instructions on how the model can be installed. Without this, your model(s) will not be accepted for inclusion in the scivision catalog.

### 📜 Software licence

You should include a `LICENSE` file in the repository, so that scivision users who come across it can understand the conditions of its usage. For help deciding which license to include, see www.choosealicense.com

## 🗂️ Non-essential repo components

Non-essential components of the scivision model repository include:

### 🐍 Installability with pip

You can include a `setup.py` to enable the model to be installed via pip. For an explanation of how this works,  see this [packaging guide](https://packaging.python.org/en/latest/tutorials/packaging-projects/#configuring-metadata) for Python. By additionally including a `requirements.txt` with the required packages for your model, you can make it so these are installed along with the model code. Here is an example `setup.py` taken from [alan-turing-institute/plankton-cefas-scivision](https://github.com/alan-turing-institute/plankton-cefas-scivision):

```python
from setuptools import find_packages, setup

requirements = []
with open("requirements.txt") as f:
    for line in f:
        stripped = line.split("#")[0].strip()
        if len(stripped) > 0:
            requirements.append(stripped)

setup(
    name="resnet50_cefas",
    version="0.0.1",
    description="scivision plugin, using CEFAS DSG Plankton ResNet50 model",
    url="https://github.com/alan-turing-institute/plankton-cefas-scivision",
    packages=find_packages(),
    install_requires=requirements,
    python_requires=">=3.7",
)
```

In scivision, once your model(s) have been included in the scivision catalog, pip installability gives users the option to use the `load_pretrained_model` function for easy use of your model code. See the [API docs](https://scivision.readthedocs.io/en/latest/api.html) for details.

### 🧪 Tests

Effective testing of code is vitally important to ensure the reliability of software, and in the context of scientific research code, the reproducibility analyses and results.

We recommend that models repos submitted to the scivision catalog are thoroughly tested. For more information of testing for research code, check out [The Turing Way](https://the-turing-way.netlify.app/reproducible-research/testing.html) online handbook.

### 📊 Example data

We recommend including a directory with a small amount of test image data, in a format that can be used by the model(s) in the repo. This will be useful for scivision users who wish to try running your model(s).

You could for example, include in the repo `README` some example code showing how to run your model(s) on the test data, or indeed a Jupyter notebook with this code that can be easily run.

## 🗃️ Example model repos



