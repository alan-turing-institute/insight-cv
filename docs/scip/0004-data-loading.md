# Template for new SCIPs

## Metadata

Editor:
  ...

Status (raw | draft | stable | deprecated | retired):
  raw

## Description

...

## Requirements

### What is included in the catalog entry for a datasource?

- A URL to a remote location (as given below)
  - The URL should be a browsable location, structured according to one of the supported 'data-sharing patterns' (see below)
  - 

- An indication of additional scivision plugins required to load the data, if not (?)

### Image formats

- Built-in support for any common format (via a library, such as skimage)
- Built-in support for formats common across scientific domains, not included in the above
  - Whether to support a given format should be considered against the cost of the additional dependencies it requires, and the burden of these (e.g. something that makes core scivision less portable, or adds an extra installation step might be rejected, but a single python-only dependency considered acceptable)

- A 'plugin' system for extending to additional formats
### Loaded data formats

- Lazy loading with `dask`/`xarray`
- Simpler format such as `numpy` for smaller datasets when lazy load/ parallel computing not required
#### Additional image formats

Below is a list of additional image formats to consider for built-in support

-
-


### Supported data services

#### Notes

- 'Core' scivision (without additional) should maintain support for several remote data is commonly archived.

- Often locations are specified using URLs with a http/https scheme, but e.g. directory browsing is not supported by http, which limits the generality or usefulness of this approach.

- One possibility that is supported by plain http is a direct link to 'archive' file system (e.g. a zip file containing one of the patterns below).

- Examples consisting of a single image are supported for the same reason, but might not be particularly interesting

- A single file containing some metadata for Intake or a scivision plugin is another possibility

#### Particular services to support

- Automatic support for single image files and archives
- The URL of an Intake catalog
- The URL of some data-plugin metadata
- Zenodo
- GitHub
- Support layers which might be useful for labelling and inspection of model outputs e.g. Points, Shapes, Surface, Tracks and Vectors

#### Pull requests accepted

  - Improve, updating, maintaining the existing supported services (e.g. fixing the library to work after an API change

  - Adding support for other common remote locations (a test might be: are there two or more independent data sources in the catalog that)


### Native support for common data sharing patterns

#### Directory of image files

#### Image + csv labels

#### An Intake yaml file catalog

#### A yaml file, with metadata for a custom data plugin


## High-level software design

For Scivision.Py

- Consider using fsspec for handling remote locations (get archive support, variety of URL schemes)

- Abstract base class for a `DataService`

## Remaining questions

...
