import './App.css';
import { AboutText } from './about.js'

import {
    Routes,
    Route,
    Link,
    NavLink,
    useLocation
} from "react-router-dom";

import {
    React,
    useState,
} from 'react';

import datasource_schema from './datasource_schema.js'
import model_schema from './model_schema.js'
import project_schema from './project_schema.js'

import { Nav, Navbar, Container, Col, Row } from "react-bootstrap";

import 'bootstrap-icons/font/bootstrap-icons.css';

import { GH_TOKEN_KEY, RANDOM_UUID_KEY } from "./config.js";

import { CatalogEntryForm } from "./catalog_entry_form.js"

import { Login, LoginStatusLink } from "./github_helper_funcs.js"

import {
    ModelNav,
    DatasourceNav,
    ProjectNav
} from "./catalog_navigation.js"

import {
    ModelTable,
    DatasourceTable,
    ProjectTable
} from "./table.js"

import {
    ModelGrid,
    DatasourceGrid,
    ProjectGrid
} from "./grid.js"

import {
    Model,
    Datasource,
    Project
} from "./item_pages.js"

import { Home } from "./home.js"

import { Community } from "./Community.js"
import { ScivisionPy } from "./ScivisionPy.js"


// Component: The app
//
// Display the header and sidebar, and handle routing with React Router
function App() {
    const gh_token = sessionStorage[GH_TOKEN_KEY];
    const random_uuid = sessionStorage[RANDOM_UUID_KEY];
    const [gh_logged_in, set_gh_logged_in] = useState(!!gh_token);
    const location = useLocation();
    const location_root = location.pathname.split("/")[1]; // path starts with a '/'

    return (
        <div className="app">
            {/* Main header (Navbar used as a convenient 'banner'
                  * element, but does not actually contain navigation
                  * links) */}
            <Container fluid className="bg-light p-0">
                <Container>
                    <Navbar expand="md flex-nowrap">
                        <Navbar.Brand>
                            <Nav.Link to="" as={NavLink} className="p-0 ">
                                <img src="https://github.com/alan-turing-institute/scivision/blob/main/imgs/logo_name.png?raw=true" className="brandLogo" alt="Scivision" />
                            </Nav.Link>
                        </Navbar.Brand>
                        <span>
                            <a style={{ color: "Black" }} href="https://github.com/alan-turing-institute/scivision">
                                <i className="bi bi-github" aria-label="GitHub" style={{ fontSize: "2.5rem" }}></i>
                            </a>
                        </span>
                    </Navbar>

                    {/* Navigation bar */}
                    <Navbar collapseOnSelect expand="md" className="px-0">
                        <Container fluid className="p-0">
                            <Navbar.Toggle aria-controls="responsive-navbar-nav" className="ml-auto" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="me-auto">
                                    <Nav.Link to="" as={NavLink} eventKey="home">
                                        Home
                                    </Nav.Link>

                                    <Nav.Link to="about" as={NavLink} eventKey="about">
                                        About
                                    </Nav.Link>

                                    <Nav.Link to="scivisionpy" as={NavLink} eventKey="scivisionpy">
                                        Scivision.Py
                                    </Nav.Link>

                                    {/* We want to have the Datasource and Model menu items
                                      * highlighted (as if visited) for any of the routes
                                      * associated with these things.  This is the meaning of the
                                      * expression given for 'active' below. There is probably a
                                      * better way of doing this...*/}

                                    <Nav.Link to="model-grid" as={NavLink}
                                        active={
                                            location_root === "model-table"
                                            || location_root === "new-model"
                                            || location_root === "model"
                                        } eventKey="model">
                                        Models
                                    </Nav.Link>

                                    <Nav.Link to="datasource-grid" as={NavLink}
                                        active={
                                            location_root === "datasource-table"
                                            || location_root === "new-datasource"
                                            || location_root === "datasource"
                                        } eventKey="datasource">
                                        Data
                                    </Nav.Link>
                                    <Nav.Link to="project-grid" as={NavLink}
                                        active={
                                            location_root === "project-table"
                                            || location_root === "new-project"
                                            || location_root === "project"
                                        } eventKey="project">
                                        Projects
                                    </Nav.Link>

                                    <Nav.Link to="community" as={NavLink} eventKey="community">
                                        Community
                                    </Nav.Link>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                </Container>
                <Container fluid className="login-bar p-0">
                    <Container className="login-bar px-3 mb-3 text-right">
                        <Navbar.Text>
                            <LoginStatusLink gh_logged_in={gh_logged_in}
                                set_gh_logged_in={set_gh_logged_in} />
                        </Navbar.Text>
                    </Container>
                </Container>
            </Container>
            {/* Routing table */}
            <Container>
                <Routes>
                    <Route exact path="" element={
                        <Home />
                    } />

                    <Route path="/about" element={
                        <AboutText />
                    } />

                    <Route path="/scivisionpy" element={
                        <ScivisionPy />
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
                            <Row className="justify-content-md-center">
                                <Col md={{span:8, offset:2}}>
                                    <Model />
                                </Col>
                            </Row>
                        </>
                    } />

                    <Route path="/new-model" element={
                        <>
                            <ModelNav />
                            <h3>Add a model to the catalog</h3>
                            <h4>Prerequistes</h4>

                            <Row>
                                <Col md={{ span:8, offset: 2}}>
                                <ul>
                                    <li> The source code of your model is shared in a public repository (GitHub or elsewhere). The Scivision catalog does not host your model source code directly, just some metadata about it, so this must be accessible elsewhere.</li>
                                    <li> Your model is in the <a href="https://scivision.readthedocs.io/en/latest/model_repository_template.html#model-repo-structure">correct format for Scivision</a></li>
                                    <li> Make a note of the direct link to the <a href="https://scivision.readthedocs.io/en/latest/model_repository_template.html#model-config-file">model config file</a> in your repository, to use below</li>
                                </ul>
                                </Col>
                            </Row>

                            <h4> Add your model</h4>

                            <Row>
                              <Col md ={{ span:8, offset: 2}}>
                                <p>Add some details about your model below. Submitting the form will open a pull request (from your GitHub user account) that adds details of your model to the catalog. Further discussion is possible at that point, so it doesn't need to be complete or perfect at this stage.</p>
                                <p>Make sure to <strong>log in with the link above</strong> before completing the form</p>
                              </Col>
                              <Col md ={{ span:8, offset: 2}}>
                                <CatalogEntryForm
                                    gh_logged_in={gh_logged_in}
                                    schema={model_schema}
                                    catalog_kind="model"
                                    catalog_path="scivision/catalog/data/models.json"
                                    download_filename="one-model.json"
                                />
                              </Col>
                            </Row>
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
                            <Row className="justify-content-md-center">
                                <Col md={{span:8, offset:2}}>
                                  <Datasource />
                                </Col>
                            </Row>
                        </>
                    } />

                    <Route path="/new-datasource" element={
                        <>
                            <DatasourceNav />

                            <h3>Add a datasource to the catalog</h3>
                            <h4>Prerequistes</h4>

                            <Row>
                                <Col md={{ span:8, offset: 2}}>
                                  <ul>
                                      <li> Your data is in a publicly accessible location (for example, on <a href="https://zenodo.org/">Zenodo</a>). The Scivision catalog does not host your data directly, just some metadata about it, so this must be accessible elsewhere.</li>
                                      <li> Your data repository is in the <a href="https://scivision.readthedocs.io/en/latest/data_repository_template.html#data-repo-structure">format expected by Scivision</a> </li>
                                      <li> Make a note of the direct link to the <a href="https://scivision.readthedocs.io/en/latest/data_repository_template.html#data-config-file">data config file</a> in your repository, to use below</li>
                                  </ul>
                                </Col>
                            </Row>

                            <h4> Add your datasource</h4>

                            <Row>
                                <Col md={{ span:8, offset: 2}}>
                                  <p>Add some details about your data below. Submitting the form will open a pull request (from your GitHub user account) that adds details of your datasource to the catalog. Further discussion is possible at that point, so it doesn't need to be complete or perfect at this stage.</p>

                                  <p>Make sure to <strong>log in with the link above</strong> before completing the form</p>
                                </Col>
                                <Col md={{ span:8, offset: 2}}>
                                  <CatalogEntryForm
                                      gh_logged_in={gh_logged_in}
                                      schema={datasource_schema}
                                      catalog_kind="datasource"
                                      catalog_path="scivision/catalog/data/datasources.json"
                                      download_filename="one-datasource.json"
                                  />
                                </Col>
                            </Row>
                        </>
                    } />

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
                            <Row className="justify-content-md-center">
                                <Col md={{span:8, offset:2}}>
                                  <Project />
                                </Col>
                            </Row>
                        </>
                    } />

                    <Route path="/new-project" element={
                        <>
                            <ModelNav />
                            <h3>Create a Scivision project page for your research</h3>
                            <h4>Prerequistes</h4>

                            <Row>
                                <Col md={{ span:8, offset: 2}}>
                                  <ul>
                                      <li>You have already added the datasources used in your project to the <Link to="../datasource-grid">Scivision Data catalog</Link>. Click here to add a <Link to="../new-datasource">new datasource</Link>.</li>
                                      <li>You have already added the computer vision models used in your project to the <Link to="../model-grid">Scivision Model catalog</Link>. Click here to add a <Link to="../new-model">new model</Link>.</li>
                                  </ul>
                              </Col>
                            </Row>

                            <h4> Add your project</h4>

                            <Row>
                                <Col md={{ span:8, offset: 2}}>
                                    <p>Add the details that will form the basis of your project's Scivision page below. You can format the text with <a href="https://daringfireball.net/projects/markdown/basics">Markdown</a>, which will allow you to include any headers, lists and links you feel are appropriate. You can then select the models and data you added.</p>
                                    <p>Submitting the form will open a pull request (from your GitHub user account) that adds details of your project page to Scivision.  Further discussion is possible at that point, so it doesn't need to be complete or perfect at this stage.</p>
                                    <p>Make sure to <strong>log in with the link above</strong> before completing the form</p>
                                </Col>
                                <Col md ={{ span:8, offset: 2}}>
                                    <CatalogEntryForm
                                        gh_logged_in={gh_logged_in}
                                        schema={project_schema}
                                        uiSchema={{ page: { "ui:widget": "textarea" } }}
                                        catalog_kind="project"
                                        catalog_path="scivision/catalog/data/projects.json"
                                        download_filename="one-project.json"
                                    />
                                </Col>
                          </Row>
                        </>
                    } />

                    <Route path="/community" element={
                        <Community />
                    } />
                </Routes>
            </Container>
        </div>
    );
}

export default App;

