import { Link, useParams } from "react-router-dom";

import { React } from 'react';

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import datasources from './data/datasources.json';
import models from './data/models.json';
import projects from './data/projects.json';
import MarkdownView from 'react-showdown';

import {
    model_thumbnails, 
    datasource_thumbnails, 
    project_thumbnails
} from "./thumbnails.js"

import { makePopover } from "./grid.js"


// Component: Details about a model
// route: /model/:model-name
//                    <ModelDefinitionListFragment data={model} />

export function Model() {
    const { model_name_encoded } = useParams();
    const model_name = decodeURIComponent(model_name_encoded);
    const model = models.entries.find(model => model.name === model_name);
    
    let scivision_code = <></>
    if (model.scivision_usable){
      scivision_code = <>
                            <dt className="col-sm-3">Use me with <a href="https://scivision.readthedocs.io/en/latest/api.html">Scivision.Py</a>:</dt>
                            <dd className="col-sm-9">
                                <p><code>from scivision import load_pretrained_model</code></p>
                                <p><code>load_pretrained_model("{model.url}")</code></p>
                            </dd>
                            </>;
    } else {
      scivision_code = <></>;
    }
    // TODO: make the install instructions model specific

    return (<>
                <h3>{model.name.charAt(0).toUpperCase() + model.name.slice(1)}</h3>
                <img src={model_thumbnails[`./${model.name}.jpg`]} alt={model.name}/>
                <dl className="row">
                  <>
                    <dt className="col-sm-3">Description</dt>
                    <dd className="col-sm-9">{model.description?model.description:"(none provided)"}</dd>

                    <dt className="col-sm-3">Homepage</dt>
                    <dd className="col-sm-9"><a href={model.url}>{model.url}</a></dd>

                    <dt className="col-sm-3">Install with pip</dt>
                    <dd className="col-sm-9">
                        <div><code>pip install {model.pkg_url}</code></div>
                    </dd>
                    
                    {scivision_code}
                  </>
                </dl>
            </>);
}

// Component: Details about a datasource
// route: /datasource/:datasource-name
export function Datasource() {
    const { datasource_name_encoded } = useParams();
    const datasource_name = decodeURIComponent(datasource_name_encoded);
    const datasource = datasources.entries.find(ds => ds.name === datasource_name);

    return (<>
                <h3>{datasource.name.charAt(0).toUpperCase() + datasource.name.slice(1)}</h3>
                <img src={datasource_thumbnails[`./${datasource.name}.jpg`]} alt = {datasource.name}/>
                <dl className="row">
                  <dt className="col-sm-3">Description</dt>
                  <dd className="col-sm-9">{datasource.description?datasource.description:"(none provided)"}</dd>

                  <dt className="col-sm-3">Location</dt>
                  <dd className="col-sm-9"><a href={datasource.url}>{datasource.url}</a></dd>
                </dl>
            </>);
}

// Component: Details about a project
// route: /project/:project-name
export function Project() {
  const { project_name_encoded } = useParams();
  const project_name = decodeURIComponent(project_name_encoded);
  const project = projects.entries.find(ds => ds.name === project_name);
  let model_path = "../model/"
  let data_path = "../datasource/"
  const datasource_links = [];
  const model_links = [];
  for (const model_name of project.models) {
    let full_path = model_path.concat(model_name)
    const model = models.entries.find(model => model.name === model_name);
    let thumbnail = <Link to={full_path}><img src={model_thumbnails[`./${model.name}.jpg`]} className="halfsize_thumbnails" alt={model.name}/></Link>;
    model_links.push(<OverlayTrigger
                        key = {model.name}
                        overlay={makePopover(model)}
                        placement="auto">
                        {thumbnail}
                     </OverlayTrigger>
                    );
  }
  for (const datasource_name of project.datasources) {
    let full_path = data_path.concat(datasource_name)
    const datasource = datasources.entries.find(datasource => datasource.name === datasource_name);
    let thumbnail = <Link to={full_path}><img src={datasource_thumbnails[`./${datasource.name}.jpg`]} className="halfsize_thumbnails" alt={datasource.name}/></Link>;
    datasource_links.push(<OverlayTrigger
                            key = {datasource.name}
                            overlay={makePopover(datasource)}
                            placement="auto">
                            {thumbnail}
                            </OverlayTrigger>
                          );
  }
    return (
      <>
          <h1>{project.header}</h1>
          <img src={project_thumbnails[`./${project.name}.jpg`]} alt={project.header} />
          <MarkdownView
            markdown={project.page}
            options={{ tables: true, emoji: true }}
          />
          <h2>Associated CV models and data:</h2>
          <dl className="row">
            <dt className="col-sm-3">Models</dt>
            <dd className="col-sm-9">{model_links}</dd>
            <dt className="col-sm-3">Data</dt>
            <dd className="col-sm-9">{datasource_links}</dd>
          </dl>
    </>
    );
}

