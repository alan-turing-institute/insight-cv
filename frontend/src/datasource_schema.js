const schema = {
    "title": "Datasource catalog entry",
    "type": "object",
    "properties": {
        "name": {
            "title": "Name",
            "description": "Short name for the datasource, that must be unique among all catalog entries (one or two words, under 20 characters recommended)",
            "type": "string"
        },
        "description": {
            "title": "Description",
            "description": "Detailed description of the dataset (no length limit)",
            "type": "string"
        },
        "tasks": {
            "title": "Suitable tasks",
            "description": "For which task or tasks is this datasource likely to be suitable? (Select any number of the following items)",
            "type": "array",
            "items": {
                "$ref": "#/definitions/TaskEnum"
            },
            "uniqueItems": true
        },
        "labels_provided": {
            "title": "Labels provided",
            "description": "Is this a labelled dataset? This can make it suitable for training or validation",
            "default": false,
            "type": "boolean"
        },
        "domains": {
            "title": "Domain areas",
            "description": "Which domain area or areas is this datasource from? (One per item, no duplicates)",
            "uniqueItems": true,
            "type": "array",
            "items": {
                "type": "string",
                "examples": ["optical-microscopy", "multispectral", "hyperspectral", "oceanography", "computer-vision", "earth-observation", "ecology"]
            }
        },
        "url": {
            "title": "URL",
            "description": "The URL of the scivision datasource yml file",
            "minLength": 1,
            "maxLength": 65536,
            "format": "uri",
            "type": "string"
        },
        "format": {
            "title": "Format",
            "type": "string",
            "examples": ["image"]
        },
        "institution": {
            "title": "Institution(s)",
            "description": "A list of institutions that produced or are associated with the dataset (one per item)",
            "default": [],
            "type": "array",
            "items": {
                "type": "string",
                "examples": ["epfl", "Aarhus University", "CEFAS", "Wikipedia by Erik Veland", "Centre for Environment, Fisheries and Aquaculture Science (CEFAS)", "Cambridge University"]
            }
        },
        "tags": {
            "title": "Tags",
            "description": "A list of free-form data to associate with the dataset",
            "default": [],
            "type": "array",
            "items": {
                "type": "string",
                "examples": ["help-needed", "3D", "cell", "cell-counting", "biology", "biomedical-science", "2D", "plant-phenotyping", "agriculture", "climate-change-and-agriculture", "demo", "plankton", "ecology", "environmental-science", "satellite", "remote-sensing"]
            }
        }
    },
    "required": ["name"],
    "additionalProperties": false,
    "definitions": {
        "TaskEnum": {
            "title": "TaskEnum",
            "description": "An enumeration.",
            "enum": ["classification", "object-detection", "segmentation", "thresholding", "other"],
            "type": "string"
        }
    }
};

export default schema;