const schema = {
    "title": "A project catalog entry",
    "type": "object",
    "properties": {
        "name": {
            "title": "Name",
            "description": "Short, unique name for the project (one or two words, under 20 characters recommended)",
            "type": "string"
        },
        "header": {
            "title": "Header",
            "description": "Header that will display at the top of the project page",
            "type": "string"
        },
        "description": {
            "title": "Description",
            "description": "Short description of the project (that will appear when hovering on the project thumbnail)",
            "type": "string"
        },
        "page": {
            "title": "Page",
            "description": "Markdown formatted content for the project page",
            "type": "string"
        },
        "models": {
            "title": "Models",
            "description": "Which models from the scivision catalog are used in the project?",
            "default": [],
            "type": "array",
            "items": {
                "$ref": "#/definitions/ModelEnum"
            }
        },
        "datasources": {
            "title": "Datasources",
            "description": "Which datasources from the scivision catalog are used in the project?",
            "default": [],
            "type": "array",
            "items": {
                "$ref": "#/definitions/DataEnum"
            }
        },
        "tasks": {
            "title": "Tasks",
            "description": "Which task (or tasks) do the CV models used in the project perform?",
            "default": [],
            "type": "array",
            "items": {
                "$ref": "#/definitions/TaskEnum"
            }
        },
        "institution": {
            "title": "Institution(s)",
            "description": "A list of institutions that produced or are associated with the project (one per item)",
            "default": [],
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "tags": {
            "title": "Tags",
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": ["name", "header", "tags"],
    "additionalProperties": false,
    "definitions": {
        "ModelEnum": {
            "title": "ModelEnum",
            "description": "An enumeration.",
            "enum": ["stardist", "PlantCV", "greenotyper", "mapreader-plant", "resnet50-plankton", "vedge-detector", "image-classifiers", "huggingface-classifiers", "huggingface-segmentation", "huggingface-object-detection", "detectreeRGB-forest", "flower-classification-model", "butterfly-classification-model"]
        },
        "DataEnum": {
            "title": "DataEnum",
            "description": "An enumeration.",
            "enum": ["stardist-cell-nuclei-2D", "oppd-seedlings", "scivision-test-data", "cefas-plankton", "coastal-edges", "treecrowns", "sentinel2_stac", "flowers", "butterflies", "Parakeet", "cell-cycle-scivision"]
        },
        "TaskEnum": {
            "title": "TaskEnum",
            "description": "An enumeration.",
            "enum": ["classification", "object-detection", "segmentation", "thresholding", "other"],
            "type": "string"
        }
    }
}

export default schema;