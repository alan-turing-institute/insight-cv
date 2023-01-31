import './App.css';
import { AboutText } from './about.js'

import biglogo from './logo-full.png';
import nbScreenshot1 from './nb-1.jpg'
import nbScreenshot2 from './nb-2.jpg'


import { Buffer } from 'buffer';

import {
    HashRouter as Router,
    Routes,
    Route,
    Navigate,
    Link,
    NavLink,
    useSearchParams,
    useParams,
    useLocation
} from "react-router-dom";

import { withRouter, useNavigate } from "react-router";

import { React, useState, useEffect, useRef } from 'react';

import Form from '@rjsf/bootstrap-4';
import datasource_schema from './datasource_schema.js'
import model_schema from './model_schema.js'
import project_schema from './project_schema.js'

import { Nav, Navbar } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

import 'bootstrap-icons/font/bootstrap-icons.css';

import datasources from './data/datasources.json';
import models from './data/models.json';
import projects from './data/projects.json';
import DataTable from 'react-data-table-component';

import { Octokit } from "octokit";
import { createPullRequest } from "octokit-plugin-create-pull-request";

import MarkdownView from 'react-showdown';


const server_configs = {
    development: {
        uri: 'https://scivision-dev-gh-gatekeeper.azurewebsites.net/authenticate/',
        client_id: 'b1f4db23eb46160d16b7',
        redirect_uri: 'http://localhost:3000/scivision/#/login/'
    },
    production: {
        uri: 'https://scivision-gh-gatekeeper.azurewebsites.net/authenticate/',
        client_id: '13bcb3c2a2c31a9f6f02',
        redirect_uri: 'https://alan-turing-institute.github.io/scivision/#/login/'
    }
}

const server_config_selected = server_configs[process.env.NODE_ENV];

const OctokitPRPlugin = Octokit.plugin(createPullRequest);
const GH_TOKEN_KEY = "gh_token";
const RANDOM_UUID_KEY = "random_uuid";


// Load the thumbnail images

// From a webpack object returned by require.context (ctxt), make a
// dictionary from the resource name to its path
//
// ctxt is callable, and calling it with the name of a resource
// returns the path to that resource.  It also has a '.keys()' method,
// which returns all the included resources.
//
// Could strip the leading './' and trailing extension (and then handle
// several file types)
function context_to_paths(ctxt) {
    return ctxt.keys().reduce((dict, name) => {
        dict[name] = ctxt(name);
        return dict;
    }, {});
}

const model_thumbnails_ctxt = require.context(
    './data/thumbnails/models', false, /\.jpg$/
);
const model_thumbnails = context_to_paths(model_thumbnails_ctxt);

const datasource_thumbnails_ctxt = require.context(
    './data/thumbnails/datasources', false, /\.jpg$/
);
const datasource_thumbnails = context_to_paths(datasource_thumbnails_ctxt);

const project_thumbnails_ctxt = require.context(
    './data/thumbnails/projects', false, /\.jpg$/
);
const project_thumbnails = context_to_paths(project_thumbnails_ctxt);


// Utility function to download a text file, with the given filename and contents 'text'
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Component: Form to create new catalog entry (for download or PR)
// routes: /new-model, /new-datasource
//
// The two submit options either download the form data as json, or
// create a pull request with the new entry on behalf of the user.
//
// This Component can be used for both the model and datasource
// catalogs, through the props.
//
// * gh_logged_in - login status (grey out the PR button if not logged in)
// * schema - json schema object, used to generate the form
// * catalog_kind - "datasource" or "model",
function CatalogEntryForm({ gh_logged_in, schema, uiSchema, catalog_kind, catalog_path, download_filename }) {

    // The modal dialogue shows when 'pr_failed' is true.  Separate
    // state variable (pr_message) for the message, since closing the
    // modal clears the failure flag, but the message is still visible
    // briefly
    const [ pr_message, set_pr_message ] = useState("");
    const [ pr_failed, set_pr_failed ] = useState(false);
    const [ pr_loading, set_pr_loading ] = useState(false);

    // There is a single onSubmit event for both buttons, but can
    // use the onClick of the button to set this flag and decide
    // which one
    let pr_flag;

    return (
        <div className="mb-5">
            <Modal show={!!pr_failed} onHide={() => set_pr_failed(false)} >
                <Modal.Header closeButton>
                    <b>Error opening pull request on GitHub</b>
                </Modal.Header>
                <Modal.Body>
                    The error was:<div className="text-monospace mt-2 col">{pr_message}</div>
                </Modal.Body>
            </Modal>
            <Form onSubmit={
                      async (new_entry_submission) => {
                          const entry = new_entry_submission.formData;
                          if (pr_flag) {
                              const octokit = new OctokitPRPlugin({
                                  auth: sessionStorage[GH_TOKEN_KEY]
                              });

                              set_pr_loading(true);

                              try {
                                  // TODO: record gh_username on login
                                  const {
                                      data: { login: gh_username, },
                                  } = await octokit.rest.users.getAuthenticated();

                                  ///////////
                                  // Sync user fork
                                  //
                                  // This is a workaround to a possible bug in octokit-plugin-create-pull-request
                                  // triggered when the user has an out of date fork, resulting in a 404.
                                  // The workaround is just to synchronise the fork.
                                  //
                                  // With the workaround there is a theoretical chance that the base repository
                                  // is updated after the call to mergeUpstream but before createPullRequest, but
                                  // this can really only be fixed upstream.

                                  const scivision_forks = await octokit.rest.repos.listForks({
                                      owner: "alan-turing-institute",
                                      repo: "scivision",
                                  });

                                  const user_scivision_fork = scivision_forks.data.find(
                                      (fork) => fork.owner && fork.owner.login == gh_username
                                  );

                                  // Array.find returns undefined if no matches -- in that case,
                                  // no need to update anything (octokit.createPullRequest
                                  // will create a fresh one)
                                  if (user_scivision_fork !== undefined) {
                                      await octokit.rest.repos.mergeUpstream({
                                          owner: gh_username,
                                          repo: user_scivision_fork.name,
                                          branch: user_scivision_fork.default_branch,
                                      });
                                  }
                                  //
                                  ///////////

                                  const response = await octokit.createPullRequest({
                                      owner: "alan-turing-institute",
                                      repo: "scivision",
                                      title: `Add "${entry.name}" to the ${catalog_kind} catalog`,
                                      body: "This PR was automatically generated by the Scivision frontend.",
                                      base: "main",
                                      head: `add-${catalog_kind}-${crypto.randomUUID().toUpperCase()}`,
                                      update: false,
                                      forceFork: true,
                                      changes: [
                                          {
                                              files: {
                                                  [catalog_path]:
                                                  ({ exists, encoding, content}) => {
                                                      const content_str = Buffer.from(content, encoding);
                                                      let cat = JSON.parse(content_str);
                                                      cat.entries.push(entry);
                                                      return JSON.stringify(cat, null, 2);
                                                  }
                                              },
                                              commit: `Create entry for "${entry.name}" in the ${catalog_kind} catalog`
                                          }
                                      ]
                                  });
                                  if (response.status >= 200 && response.status < 300) {
                                      window.location = response.data.html_url;
                                  } else {
                                      throw new Error(response.data);
                                  }
                              } catch (e) {
                                  set_pr_message(e.message);
                                  set_pr_failed(true);
                                  set_pr_loading(false);
                              }

                          } else {
                              download(download_filename, JSON.stringify(entry, null, 2));
                          }
                      }
                  }
                  schema={schema} uiSchema={uiSchema}>

                <button type="submit"
                        onClick={ () => pr_flag = true }
                        className="btn btn-primary"
                        disabled={!gh_logged_in || pr_loading}>
                    Open Pull Request on GitHub
                    { pr_loading ? <>&nbsp;<Spinner animation="border" role="status" size="sm"/></> : <></> }
                    { gh_logged_in ? <></> : <> (login to enable)</> }
                </button>
                <button type="submit"
                        onClick={ () => pr_flag = false }
                        className="btn btn-link">
                    Download entry data as json
                </button>
            </Form>
        </div>);
}

// Obtain the GitHub OAuth token from Scivision backend
//
// * gh-code - the code obtained from the GitHub OAuth API
async function get_github_token(gh_code) {
    const response = await fetch(server_config_selected.uri + gh_code);
    const json = await response.json();
    if (!json.token) {
        if (json.error) {
            throw json.error;
        } else {
            throw "An unknown error occurred";
        }
    }
    return json.token;
}

// Component: Login progress/redirection page
// route /login/:referrer
//
// This is used as the redirect URL for GitHub OAuth login - GitHub
// redirects back to this page after a login attempt.  This component
// then redirects again to the requested page given as the 'referrer'
// parameter, expected to be the page the user was viewing when they
// initiated the login.
function Login({ gh_logged_in, set_gh_logged_in }) {
    const login_attempted = useRef(false);
    const { referrer_encoded } = useParams();
    const navigate = useNavigate();

    const location = new URL(window.location);
    const query_params = location.searchParams;

    const gh_code = query_params.get('code');
    const gh_state = query_params.get('state');

    const random_uuid = sessionStorage[RANDOM_UUID_KEY];

    const referrer = decodeURIComponent(referrer_encoded);

    useEffect(() => {
        if (!login_attempted.current) {
            login_attempted.current = true;
            if (gh_code) {
                (async () => {
                    if (gh_logged_in) throw "Already logged in to GitHub";
                    if (gh_state != random_uuid) throw "OAuth state mismatch";
                    return get_github_token(gh_code);
                })()
                    .then((tok) => {
                        sessionStorage[GH_TOKEN_KEY] = tok;
                        set_gh_logged_in(true);
                    })
                    .catch((e) => {
                        console.log(`Could not log in to GitHub.  The reason was: ${e}`);
                    })
                    .finally(() => {
                        // Clearing the search parameters triggers a
                        // reload, and then 'navigate' is never called.
                        //
                        // window.location.search = "";
                        navigate(referrer);
                    });
            } else {
                console.log("Missing 'code' query parameter");
            }
        }
    }, []);

    return (
        <div>
            Logging in...&nbsp;&nbsp;
            <p>Navigate away from this page to abort</p>
            <p />
            <Spinner animation="border" role="status" size="sm"/>
        </div>
    );
}

// GitHub OAuth login
//
// * referrer - redirect back to this page
// * gh_logged_in - current login state
//
// This function is called to initiate a login attempt
function github_auth({ referrer, gh_logged_in }) {
    if (!gh_logged_in) {
        var github_auth_url = new URL('https://github.com/login/oauth/authorize');

        const random_uuid = crypto.randomUUID();
        sessionStorage[RANDOM_UUID_KEY] = random_uuid;

        const referrer_encoded = encodeURIComponent(encodeURIComponent(referrer));

        github_auth_url.search = new URLSearchParams({
            client_id: server_config_selected.client_id,
            redirect_uri: server_config_selected.redirect_uri + referrer_encoded,
            scope: "public_repo",
            state: random_uuid,
        }).toString();

        // Redirect to GitHub
        window.location = github_auth_url;

    } else {
        // Should not get here via the web interface (the login link
        // should not be visible when already logged in)
        console.log("Already logged in to GitHub");
    }
}

// Component: Fragment containing definition items for the expanded
// view of the model table, and the model page
//
// * data - one model
function ModelDefinitionListFragment({data}) {
    return (<>
                <dt className="col-sm-3">Description</dt>
                <dd className="col-sm-9">{data.description?data.description:"(none provided)"}</dd>

                <dt className="col-sm-3">Homepage</dt>
                <dd className="col-sm-9"><a href={data.url}>{data.url}</a></dd>

                <dt className="col-sm-3">Install with pip</dt>
                <dd className="col-sm-9">
                    <div><code>pip install {data.pkg_url}</code></div>
                </dd>
                <dt className="col-sm-3"><a href="https://scivision.readthedocs.io/en/latest/api.html">Scivision Python Code</a>:</dt>
                <dd className="col-sm-9">
                    <div>
                      <p><code>import scivision</code></p>
                      <p><code>model = scivision.load_pretrained_model({data.url})</code></p>
                      <p><code>data = scivision.load_dataset({'<datasource url>'})</code></p>
                      <p><code>model.predict(data)</code></p>
                    </div>
                </dd>
            </>);
}

// Component: Fragment containing definition items for the expanded
// view of the datasource table and the page for one datasource
//
// * data - one datasource
function DatasourceDefinitionListFragment({data}) {
    return (<>
                <dt className="col-sm-3">Description</dt>
                <dd className="col-sm-9">{data.description?data.description:"(none provided)"}</dd>

                <dt className="col-sm-3">Location</dt>
                <dd className="col-sm-9"><a href={data.url}>{data.url}</a></dd>
            </>);
}

// Component: Fragment containing definition items for the expanded
// view of the project table and the page for one project
//
// * data - one project
function ProjectDefinitionListFragment({data}) {
    return (<>
  
                <dt className="col-sm-3">{data.header?data.header:"(none provided)"}</dt>
                <dd className="col-sm-9">{data.description?data.description:"(none provided)"}</dd>

            </>);
}

// Component: List of models or datasources (depending on prop), with
// choice of grid or table view.  One of these views will be rendered,
// depending on the route
//
// route: /model-table, /model-grid, /datasource-table, /datasource-grid
//
// * props - { gridRoute, tableRoute }
//   where
//     gridRoute, tableRoute - the route for the grid and table views
function TableGridViewNav(props) {
    return (
        <Nav className="mb-2" variant="tabs">
            <Nav.Item>
                <Nav.Link to={props.gridRoute} as={NavLink}>
                    <i className="bi bi-grid" />{/* Thumbnails*/}
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link to={props.tableRoute} as={NavLink}>
                    <i className="bi bi-list-ul" />{/* Table*/}
                </Nav.Link>
            </Nav.Item>
            <Nav.Item className="ml-auto">
                <Nav.Link to={props.createNewRoute} as={NavLink}>
                    <i className="bi bi-file-earmark-plus" /> Create new entry
                </Nav.Link>
            </Nav.Item>
        </Nav>
    );
}

// Component: A badge indicating a task with the given name
// TODO: distinct colours for each task
function TaskBadge({taskName}) {
    return (
        <>
            <span className="badge badge-primary">{taskName}</span>
            &nbsp;
        </>
    );
}

// Helper function (used in ModelTable and DatasourceTable -- not the
// corresponding Gridviews) returning a thumbnail element
function renderThumbnailForTable(thumb) {
    if (thumb != undefined) {
        return (
            <img src={thumb}
                 width="128"
                 height="128"
                 className="img-thumbnail"
            />
        );
    } else {
        return (<></>);
    }
}

// Component: Format the element in an 'info box'.
// Used for expanded rows in ModelTable/DatasourceTable
function TableCardDropdown({element}) {
    return (
        <div className="border-bottom">
            <div className="card mt-1 mb-3 bg-light">
                <div className="card-body">
                    <dl className="row">
                        {element}
                    </dl>
                </div>
            </div>
        </div>
    );
}

// Component: Models, table view
// route: /models
function ModelTable() {
    const columns = [
        {
            name: 'Thumbnail',
            width: "150px",
            selector: row => model_thumbnails[`./${row.name}.jpg`] === undefined,
            sortable: true,
            cell: (row, index, column, id) => {
                const thumb = model_thumbnails[`./${row.name}.jpg`];
                return renderThumbnailForTable(thumb);
            }
        },
        {
            name: "Name",
            sortable: true,
            grow: 0.5,
            selector: row => row.name,
        },
        {
            name: "Tasks",
            selector: row => row.tasks,
            cell: (row, index, column, id) => row.tasks.map(
                (t) => <TaskBadge taskName={t} />
            ),
        },
    ];

    return (
        <DataTable columns={columns} data={models.entries} title=""
                   expandableRowsComponent={(props) => (
                       <TableCardDropdown
                           element={
                               <ModelDefinitionListFragment {...props}/>
                           } />
                   )}
                   expandableRows
                   expandableRowsHideExpander
                   expandOnRowClicked
        />
    );
}

// Component: Datasources, table view
// route: /datasources
function DatasourceTable() {
    const columns = [
        {
            name: 'Thumbnail',
            width: "150px",
            selector: row => datasource_thumbnails[`./${row.name}.jpg`] === undefined,
            sortable: true,
            cell: (row, index, column, id) => {
                const thumb = datasource_thumbnails[`./${row.name}.jpg`];
                return renderThumbnailForTable(thumb);
            }
        },
        {
            selector: row => row.name,
            name: 'Name',
            sortable: true,
            grow: 0.3
        },
        {
            selector: row => row.tasks,
            name: 'Tasks',
            cell: (row, index, column, id) => row.tasks.map(
                (t) => <TaskBadge taskName={t} />
            )
        },
    ];

    return (
        <DataTable columns={columns} data={datasources.entries} title=""
                   expandableRowsComponent={(props) => (
                       <TableCardDropdown
                           element={
                               <DatasourceDefinitionListFragment {...props}/>
                           } />
                   )}
                   expandableRows
                   expandableRowsHideExpander
                   expandOnRowClicked
        />
    );
}

// Component: Projects, table view
// route: /projects
function ProjectTable() {
    const columns = [
        {
            name: 'Thumbnail',
            width: "150px",
            selector: row => project_thumbnails[`./${row.name}.jpg`] === undefined,
            sortable: true,
            cell: (row, index, column, id) => {
                const thumb = project_thumbnails[`./${row.name}.jpg`];
                return renderThumbnailForTable(thumb);
            }
        },
        {
            selector: row => row.name,
            name: 'Name',
            sortable: true,
            grow: 0.3
        },
        {
            selector: row => row.tasks,
            name: 'Tasks',
            cell: (row, index, column, id) => row.tasks.map(
                (t) => <TaskBadge taskName={t} />
            )
        },
    ];

    return (
        <DataTable columns={columns} data={projects.entries} title=""
                   expandableRowsComponent={(props) => (
                       <TableCardDropdown
                           element={
                               <ProjectDefinitionListFragment {...props}/>
                           } />
                   )}
                   expandableRows
                   expandableRowsHideExpander
                   expandOnRowClicked
        />
    );
}

// returns a function component, for a Popover describing the current
// resource (model or datasource).  Assumes it has name, description,
// and tasks properties.
//
// * data - the model or datasource
function makePopover(data) {
    return (props) => (
        <Popover id="popover-basic" {...props}>
            <Popover.Content>
                <strong>{data.name}</strong> {data.description} &nbsp;
                {data.tasks.map((t) => <TaskBadge taskName={t} />)}
            </Popover.Content>
        </Popover>
    );
}

// Curried function for making thumbnail
// * getThumbnail - a function from data to the (path to the)
//   corresponding thumbnail image
// * getLink - a function from data to a link to information about the
//   resource represented by data (that is, if data is a model,
//   getLink(data) is the model card page for that model)
// * data - the model or datasource
// * doPopover - boolean, add an overlay trigger with some pop up text?
//   In this case, data must have a 'tasks' member
// * asCard - wrap the thumbnail in 'card' and 'card-body' divs?
function makeThumbnail({getThumbnail, getLink, doPopover, asCard}) {
    return function (data) {
        const thumbnail_src = getThumbnail(data);
        const thumbnail_resource_link = getLink(data);
        let thumbnail;
        if (thumbnail_src === undefined) {
            thumbnail = (
                <svg width="100%" height="auto" role="img" style={{ aspectRatio: 1 }}>
                    <rect width="100%" height="100%" fill="#cccccc"></rect>
                    <text x="50%" y="50%" fill="white"
                          textAnchor="middle" dominantBaseline="middle"
                          fontSize="10pt">
                        {data.name}
                    </text>
                </svg>
            );
        } else {
            thumbnail = <img className="card-img-top"
                             src={thumbnail_src}
                             width="100%"
                             height="100%" />
        }

        // Add popover
        if (doPopover && doPopover !== undefined) {
            thumbnail = (
                <OverlayTrigger
                    overlay={makePopover(data)}
                    placement="auto">
                    {thumbnail}
                </OverlayTrigger>
            )
        // Where no popover, thumnail includes description as text below
        } else {
            // Add a full stop if the description doesn't have one
            if (data.description.slice(-1) != '.'){
              var fstop = '.';
            } else {
              var fstop = '';
            }
            thumbnail = (
              <div>
                {thumbnail}
                <div className="gridtext">
                <p></p>
                {data.description}
                {fstop}
                </div>
              </div>
            )
        }

        // Add card formatting
        if (asCard && asCard !== undefined) {
            thumbnail = (
                <div className="card">
                    <div className="card-body">
                        {thumbnail}
                    </div>
                </div>
            )
        }


        return (
            <Link to={thumbnail_resource_link}>
                {thumbnail}
            </Link>
        );
    }
}

// Component: Models, thumbnail grid view
// route: /model-grid
function ModelGrid() {
    const image_cards = models.entries.map(
                makeThumbnail({
                    getThumbnail: (model) => model_thumbnails[`./${model.name}.jpg`],
                    getLink: (model) => "/model/" + encodeURIComponent(model.name),
                    doPopover: true,
                    asCard: true
                })
    );

    return (
        <div className="card-columns mt-2">
            {image_cards}
        </div>
    );
}


// Component: Datasources, thumbnail grid view
// route: /datasource-grid
function DatasourceGrid() {
    const image_cards = datasources.entries.map(
        makeThumbnail({
            getThumbnail: (datasource) => datasource_thumbnails[`./${datasource.name}.jpg`],
            getLink: (datasource) => "/datasource/" + encodeURIComponent(datasource.name),
            doPopover: true,
            asCard: true
        })
    );

    return (
        <div className="card-columns mt-2">
            {image_cards}
        </div>
    );
}


// Component: Projects, thumbnail grid view
// route: /project-grid
function ProjectGrid() {
    const image_cards = projects.entries.map(
        makeThumbnail({
            getThumbnail: (project) => project_thumbnails[`./${project.name}.jpg`],
            getLink: (project) => "/project/" + encodeURIComponent(project.name),
            doPopover: false,
            asCard: true
        })
    );

    return (
        <div className="card-columns mt-2">
            {image_cards}
        </div>
    );
}

// Component: Details about a model
// route: /model/:model-name
function Model() {
    const { model_name_encoded } = useParams();
    const model_name = decodeURIComponent(model_name_encoded);
    const model = models.entries.find(model => model.name == model_name);

    return (<>
                <h3>{model.name}</h3>
                <img src={model_thumbnails[`./${model.name}.jpg`]} />
                <dl className="row">
                    <ModelDefinitionListFragment data={model} />
                </dl>
            </>);
}

// Component: Details about a datasource
// route: /datasource/:datasource-name
function Datasource() {
    const { datasource_name_encoded } = useParams();
    const datasource_name = decodeURIComponent(datasource_name_encoded);
    const datasource = datasources.entries.find(ds => ds.name == datasource_name);

    return (<>
                <h3>{datasource.name}</h3>
                <img src={datasource_thumbnails[`./${datasource.name}.jpg`]} />
                <dl className="row">
                    <DatasourceDefinitionListFragment data={datasource} />
                </dl>
            </>);
}

// Component: Details about a project
// route: /project/:project-name
function Project() {
  const { project_name_encoded } = useParams();
  const project_name = decodeURIComponent(project_name_encoded);
  const project = projects.entries.find(ds => ds.name == project_name);
  let model_path = "../model/"
  let data_path = "../datasource/"
  const datasource_links = [];
  const model_links = [];
  for (const model_name of project.models) {
    let full_path = model_path.concat(model_name)
    const model = models.entries.find(model => model.name == model_name);
    let thumbnail = <Link to={full_path}><img src={model_thumbnails[`./${model.name}.jpg`]} class="halfsize_thumbnails"/></Link>;
    model_links.push(<OverlayTrigger
                        overlay={makePopover(model)}
                        placement="auto">
                        {thumbnail}
                     </OverlayTrigger>
                    );
  }
  for (const datasource_name of project.datasources) {
    let full_path = data_path.concat(datasource_name)
    const datasource = datasources.entries.find(datasource => datasource.name == datasource_name);
    let thumbnail = <Link to={full_path}><img src={datasource_thumbnails[`./${datasource.name}.jpg`]} class="halfsize_thumbnails"/></Link>;
    datasource_links.push(<OverlayTrigger
                            overlay={makePopover(datasource)}
                            placement="auto">
                            {thumbnail}
                            </OverlayTrigger>
                          );
  }
    return (
      <>
          <h1>{project.header}</h1>
          <img src={project_thumbnails[`./${project.name}.jpg`]} />
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

// Component: Username/logout link (shown when logged in)
//
// * set_gh_logged_in - setter for State variable
function LoginStatusLinkLoggedIn({ set_gh_logged_in }) {
    const octokit = new Octokit({ auth: sessionStorage[GH_TOKEN_KEY] });
    const [ gh_username, set_gh_username ] = useState("...");
    useEffect(() => {
        (async () => {
            const {
                data: { login },
            } = await octokit.rest.users.getAuthenticated();
            set_gh_username(login);
        })();
    }, [gh_username]);

    return (
        <>
            Logged in as {gh_username}&nbsp;
            <a href="javascript:;"
               onClick={() => {
                   set_gh_logged_in(false);
                   sessionStorage.removeItem(GH_TOKEN_KEY);
               }}>
                (logout)
            </a>
        </>
    );
}

// Component: Login link (shown when not logged in)
//
// * gh_logged_in - State variable
// * set_gh_logged_in - setter for State variable
function LoginStatusLink({ gh_logged_in, set_gh_logged_in }) {
    const loc = useLocation();

    if (!gh_logged_in) {
        return (
            <a href="javascript:;"
                   onClick={() => {
                   github_auth({
                       referrer: loc.pathname,
                       gh_logged_in: gh_logged_in,
                   });
               }}>
                Login with GitHub
            </a>
        );
    } else {
        return (<LoginStatusLinkLoggedIn set_gh_logged_in={set_gh_logged_in} />);
    }
}


// Component: Tab-bar for models (grid, table, create etc)
function ModelNav() {
    return (
        <>
            <TableGridViewNav
                gridRoute="/model-grid"
                tableRoute="/model-table"
                createNewRoute="/new-model"
            />
        </>
    );
}

// Component: Tab-bar for datasources (grid, table, create etc)
function DatasourceNav() {
    return (
        <TableGridViewNav
            gridRoute="/datasource-grid"
            tableRoute="/datasource-table"
            createNewRoute="/new-datasource"
        />
    );
}

// Component: Tab-bar for projects (grid, table, create etc)
function ProjectNav() {
    return (
        <TableGridViewNav
            gridRoute="/project-grid"
            tableRoute="/project-table"
            createNewRoute="/new-project"
        />
    );
}

// helper: select a random sample of size 'n_sample' from the array 'arr'
function sample_without_replacement(arr, n_sample) {
    var samples = []
    for (var i = 0; i < arr.length; i++) {
        if (samples.length == n_sample) break;

        var u = Math.random();

        if ((arr.length - i) * u < n_sample - samples.length) {
            samples.push(arr[i]);
        }
    }
    return samples
}

// Component: The home page
// route: /
function Home() {

    // pick three random models and datasources (with thumbnails)
    //
    const models_sample = sample_without_replacement(
        models.entries, 3
    );
    const datasources_sample = sample_without_replacement(
        datasources.entries, 3
    );
    const projects_sample = sample_without_replacement(
        projects.entries, 3
    );

    return (
        <>
            <div className="mb-5">
                <h4>Models</h4>

                <div className="w-75 mx-auto m-3">

                    <p className="small">Pre-trained computer vision models that can be loaded and run with the <Link to="scivisionpy">Scivision Python library.</Link></p>

                    <div className="card-deck">
                        {
                            models_sample.map((model) => (
                                <div className="card">
                                    {
                                        makeThumbnail({
                                            getThumbnail: (data) => model_thumbnails[`./${data.name}.jpg`],
                                            getLink: (data) => "/model/" + encodeURIComponent(data.name),
                                            doPopover: true,
                                        })(model)
                                    }
                                </div>
                            ))
                        }
                    </div>
                    <p className="p-1 pl-2 small bg-highlight">
                        Discover more models in the complete <Link to="model-grid"><strong>model catalog</strong></Link>
                    </p>
                </div>
            </div>


            <div className="mb-5">
                <h4>Data</h4>

                <div className="w-75 mx-auto m-3">
                    <p className="small">Curated image datasets from diverse scientific domains, suitable for a variety of computer vision tasks and loadable as array data via the numerical Python stack.</p>
                    <div className="card-deck">
                        {
                            datasources_sample.map((ds) => (
                                <div className="card">
                                    {
                                        makeThumbnail({
                                            getThumbnail: (data) => datasource_thumbnails[`./${data.name}.jpg`],
                                            getLink: (data) => "/datasource/" + encodeURIComponent(data.name),
                                            doPopover: true,
                                        })(ds)
                                    }
                                </div>
                            ))
                        }
                    </div>
                    <div className="bg-highlight">
                        <p className="p-1 pl-2 small">
                            Explore the full <Link to="datasource-grid"><strong>datasource catalog</strong></Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-5">
                <h4>Projects</h4>

                <div className="w-75 mx-auto m-3">
                    <p className="small">Research projects that have contributed scientific image data and computer vision models to the Scivision catalog.</p>
                    <div className="card-deck">
                        {
                            projects_sample.map((proj) => (
                                <div className="card">
                                    {
                                        makeThumbnail({
                                            getThumbnail: (project) => project_thumbnails[`./${project.name}.jpg`],
                                            getLink: (project) => "/project/" + encodeURIComponent(project.name),
                                            doPopover: true,
                                        })(proj)
                                    }
                                </div>
                            ))
                        }
                    </div>
                    <div className="bg-highlight">
                        <p className="p-1 pl-2 small">
                            Explore the full <Link to="project-grid"><strong>project catalog</strong></Link>
                        </p>
                    </div>
                </div>
            </div>

        </>
    );
}


// Component: The app
//
// Display the header and sidebar, and handle routing with React Router
function App() {
    const gh_token = sessionStorage[GH_TOKEN_KEY];
    const random_uuid = sessionStorage[RANDOM_UUID_KEY];
    const [ gh_logged_in, set_gh_logged_in ] = useState(!!gh_token);
    const location = useLocation();
    const location_root = location.pathname.split("/")[1]; // path starts with a '/'

    return (
        <div className="app">
            <div className="container">

                {/* Main header (Navbar used as a convenient 'banner'
                  * element, but does not actually contain navigation
                  * links) */}

                  <Navbar bg="light" expand="lg">
                    <Navbar.Brand>
                        <Nav.Link to="home" as={NavLink}>
                            <img src={biglogo} width="38%" height="auto" alt="Scivision" />
                        </Nav.Link>
                    </Navbar.Brand>
                    <span className="pull-right pb-5">
                      <a style={{color: "Black"}} href="https://github.com/alan-turing-institute/scivision">
                        <i className="bi bi-github" aria-label="GitHub" style={{ fontSize: "2rem" }}></i>
                      </a>
                    </span>
                </Navbar>

                {/* Navigation bar */}
                <Navbar bg="light" expand="lg">
                    <Nav className="me-auto">
                        <Nav.Link to="" as={NavLink}>
                            Home
                        </Nav.Link>

                        <Nav.Link to="about" as={NavLink}>
                            About
                        </Nav.Link>

                        <Nav.Link to="scivisionpy" as={NavLink}>
                            Scivision.Py
                        </Nav.Link>

                        {/* We want to have the Datasource and Model menu items
                          * highlighted (as if visited) for any of the routes
                          * associated with these things.  This is the meaning of the
                          * expression given for 'active' below. There is probably a
                          * better way of doing this...*/}

                        <Nav.Link to="model-grid" as={NavLink}
                                  active={
                                      location_root == "model-table"
                                          || location_root == "new-model"
                                          || location_root == "model"
                                  }>
                            Models
                        </Nav.Link>

                        <Nav.Link to="datasource-grid" as={NavLink}
                                  active={
                                      location_root == "datasource-table"
                                          || location_root == "new-datasource"
                                          || location_root == "datasource"
                                  }>
                            Data
                        </Nav.Link>
                        <Nav.Link to="project-grid" as={NavLink}
                                  active={
                                      location_root == "project-table"
                                          || location_root == "new-project"
                                          || location_root == "project"
                                  }>
                            Projects
                        </Nav.Link>

                        <Nav.Link to="community" as={NavLink}>
                            Community
                        </Nav.Link>

                        {/***
                        <Nav.Item>
                            <a href="https://scivision.readthedocs.io/en/latest/">Python Package Docs</a>
                        </Nav.Item>

                        <Nav.Item>
                            <a href="https://pypi.org/project/scivision/">Python Package PyPI</a>
                        </Nav.Item>

                        <Nav.Item>
                            <a href="https://github.com/alan-turing-institute/scivision">GitHub repo</a>
                        </Nav.Item>
                         ***/}
                    </Nav>
                </Navbar>

                <div className="login-bar px-3 mb-3 text-right">
                    <Navbar.Text>
                        <LoginStatusLink gh_logged_in={gh_logged_in}
                                         set_gh_logged_in={set_gh_logged_in} />
                    </Navbar.Text>
                </div>


                {/* Routing table */}
                <div className="mx-3">
                    <Routes>
                        <Route exact path="" element={
                                   <Home />
                               } />

                        <Route path="/about" element={
                                   <>
                                       <h3>A toolkit for scientific image analysis</h3>
                                       <div className="text-readable-width mt-4">
                                           <AboutText />
                                       </div>
                                   </>
                               } />

                        <Route path="/scivisionpy" element={
                                   <>
                                       <h3>The Scivision.Py Python Library</h3>
                                       <div className="text-readable-width mt-4">
                                           See the <a href="https://scivision.readthedocs.io/en/latest/">documentation</a>.
                                       </div>
                                   </>
                        } />

                        <Route path="/login/:referrer_encoded" element={
                                   <Login
                                       gh_logged_in={gh_logged_in}
                                       set_gh_logged_in={set_gh_logged_in}
                                   />
                               } />

                        <Route path="/model-grid" element={
                                   <>
                                       <ModelNav />
                                       <ModelGrid />
                                   </>
                               } />

                        <Route path="/model-table" element={
                                   <>
                                       <ModelNav />
                                       <ModelTable />
                                   </>
                               } />

                        <Route path="/model/:model_name_encoded" element={
                                   <>
                                       <ModelNav />
                                       <div className="text-readable-width mt-4">
                                           <Model />
                                       </div>
                                   </>
                               } />

                        <Route path="/new-model" element={
                                   <>
                                       <ModelNav />
                                       <h3>Add a model to the catalog</h3>
                                       <h4>Prerequistes</h4>

                                       <p  className="text-readable-width">
                                       <ul>
                                       <li> The source code of your model is shared in a public repository (GitHub or elsewhere). The Scivision catalog does not host your model source code directly, just some metadata about it, so this must be accessible elsewhere.</li>
                                       <li> Your model is in the <a href="https://scivision.readthedocs.io/en/latest/model_repository_template.html#model-repo-structure">correct format for Scivision</a></li>
                                       <li> Make a note of the direct link to the <a href="https://scivision.readthedocs.io/en/latest/model_repository_template.html#model-config-file">model config file</a> in your repository, to use below</li>
                                       </ul>
                                       </p>

                                       <h4> Add your model</h4>

                                       <p className="text-readable-width">
                                          Add some details about your model below.  Submitting the form will open a pull request (from your GitHub user account) that adds details of your model to the catalog.  Further discussion is possible at that point, so it doesn't need to be complete or perfect at this stage.</p>

                                          <p className="text-readable-width mt-4">
                                          Make sure to <strong>log in with the link above</strong> before completing the form
                                          </p>
                                       <div className="text-readable-width mt-4">
                                           <CatalogEntryForm
                                               gh_logged_in={gh_logged_in}
                                               schema={model_schema}
                                               catalog_kind="model"
                                               catalog_path="scivision/catalog/data/models.json"
                                               download_filename="one-model.json"
                                           />
                                       </div>
                                   </>
                               } />

                        <Route path="/datasource-grid" element={
                                   <>
                                       <DatasourceNav />
                                       <DatasourceGrid />
                                   </>
                               } />

                        <Route path="/datasource-table" element={
                                   <>
                                       <DatasourceNav />
                                       <DatasourceTable />
                                   </>
                               } />

                        <Route path="/datasource/:datasource_name_encoded" element={
                                   <>
                                       <DatasourceNav />
                                       <div className="text-readable-width mt-4">
                                           <Datasource />
                                       </div>
                                   </>
                               } />

                        <Route path="/new-datasource" element={
                                   <>
                                       <DatasourceNav />

                                       <h3>Add a datasource to the catalog</h3>
                                       <h4>Prerequistes</h4>

                                       <p  className="text-readable-width">
                                       <ul>
                                       <li> Your data is in a publicly accessible location (for example, on <a href="https://zenodo.org/">Zenodo</a>). The Scivision catalog does not host your data directly, just some metadata about it, so this must be accessible elsewhere.</li>
                                       <li> Your data repository is in the <a href="">format expected by Scivision</a> </li>
                                       <li> Make a note of the direct link to the <a href="https://scivision.readthedocs.io/en/latest/data_repository_template.html#data-config-file">data config file</a> in your repository, to use below</li>


                                       </ul>
                                       </p>

                                       <h4> Add your datasource</h4>

                                       <p className="text-readable-width">
                                          Add some details about your data below.  Submitting the form will open a pull request (from your GitHub user account) that adds details of your datasource to the catalog.  Further discussion is possible at that point, so it doesn't need to be complete or perfect at this stage.</p>

                                          <p className="text-readable-width mt-4">
                                          Make sure to <strong>log in with the link above</strong> before completing the form
                                          </p>


                                       <div className="text-readable-width mt-4">
                                           <CatalogEntryForm
                                               gh_logged_in={gh_logged_in}
                                               schema={datasource_schema}
                                               catalog_kind="datasource"
                                               catalog_path="scivision/catalog/data/datasources.json"
                                               download_filename="one-datasource.json"
                                           />
                                       </div>
                                   </>
                               }/>
                               
                        <Route path="/project-grid" element={
                                  <>
                                      <ProjectNav />
                                      <ProjectGrid />
                                  </>
                              } />

                        <Route path="/project-table" element={
                                   <>
                                       <ProjectNav />
                                       <ProjectTable />
                                   </>
                               } />

                        <Route path="/project/:project_name_encoded" element={
                                  <>
                                      <ProjectNav />
                                      <div className="text-readable-width mt-4">
                                          <Project />
                                      </div>
                                  </>
                              } />
                              
                        <Route path="/new-project" element={
                                   <>
                                       <ModelNav />
                                       <h3>Create a Scivision project page for your research</h3>
                                       <h4>Prerequistes</h4>

                                       <p  className="text-readable-width">
                                       <ul>
                                       <li>You have already added the datasources used in your project to the <Link to="../datasource-grid">Scivision Data catalog</Link>. Click here to add a <Link to="../new-datasource">new datasource</Link>.</li>
                                       <li>You have already added the computer vision models used in your project to the <Link to="../model-grid">Scivision Model catalog</Link>. Click here to add a <Link to="../new-model">new model</Link>.</li>
                                       </ul>
                                       </p>

                                       <h4> Add your project</h4>
                                       
                                       <p className="text-readable-width">
                                          Add the details that will form the basis of your project's Scivision page below. You can format the text with <a href="https://daringfireball.net/projects/markdown/basics">Markdown</a>, which will allow you to include any headers, lists and links you feel are appropriate. You can then select the models and data you added.</p>
                                       <p></p>
                                       <p className="text-readable-width">
                                          Submitting the form will open a pull request (from your GitHub user account) that adds details of your project page to Scivision.  Further discussion is possible at that point, so it doesn't need to be complete or perfect at this stage.</p>

                                          <p className="text-readable-width mt-4">
                                          Make sure to <strong>log in with the link above</strong> before completing the form
                                          </p>
                                       <div className="text-readable-width mt-4">
                                           <CatalogEntryForm
                                               gh_logged_in={gh_logged_in}
                                               schema={project_schema}
                                               uiSchema={{page: {"ui:widget": "textarea"}}}
                                               catalog_kind="project"
                                               catalog_path="scivision/catalog/data/projects.json"
                                               download_filename="one-project.json"
                                           />
                                       </div>
                                   </>
                               } />

                        <Route path="/community" element={
                                   <>
                                       <h3>Community Resources</h3>
                                       <div className="text-readable-width mt-3">
                                           <ul>

                                               <li>
                                                   Our <a href="https://github.com/alan-turing-institute/scivision/blob/main/CODE_OF_CONDUCT.md">Code of Conduct</a>
                                               </li>
                                               <li>
                                                   <a href="https://github.com/alan-turing-institute/scivision/discussions">
                                                      GitHub Discussions
                                                   </a>
                                               </li>
                                               <li>
                                                   <a href="https://scivision.readthedocs.io/en/latest/scip_index.html">SCIPI</a>, the Scivision Improvement Proposal Index: Community driven design documents, specs and proposals
                                               </li>
                                               <li>Email the Scivision core maintainers at <a href="mailto:scivision@turing.ac.uk">scivision@turing.ac.uk</a></li>
                                           </ul>
                                       </div>
                                   </>
                               }/>
                    </Routes>
                </div>
            </div>
        </div>
);
}

export default App;
