import { useState } from "react";
import useScript from "react-use-scripts";
import DataTable from "react-data-table-component";

import ModelNav from "./ModelNav.jsx";
import { model_thumbnails } from "./thumbnails.js";
import {
  renderThumbnailForTable,
  TableCardDropdown,
} from "./table_helpers.jsx";
import { TaskBadge } from "./badges.jsx";

import models from "./catalog/data/models.json";

// Component: Fragment containing definition items for the expanded
// view of the Model table and the page for one Model
//
// * data - one Model
function modelDefinitionList({ data }) {
  return (
    <dl className="row">
      <dt className="col-sm-3">Description</dt>
      <dd className="col-sm-9">
        {data.description ? data.description : "(none provided)"}
      </dd>

      <dt className="col-sm-3">Location</dt>
      <dd className="col-sm-9">
        <a href={data.url}>{data.url}</a>
      </dd>
    </dl>
  );
}

// Component: Models, table view
// route: /Models
function ModelTableContents() {
  const [modelChecksReport, setmodelChecksReport] = useState(null);

  function modelCheckResult(name) {
    if (modelChecksReport !== null) {
      const report = modelChecksReport.report[name];
      if (report !== undefined) {
        return report.check_result;
      } else {
        return "Unknown";
      }
    } else {
      return "Unknown";
    }
  }

  function modelCheckTime() {
    if (modelChecksReport) {
      var time = new Date(modelChecksReport.time);
      return time.toUTCString();
    } else {
      return "(never)";
    }
  }

  function modelValidationTimeString() {
    return `last run ${modelCheckTime()}`;
  }

  const columns = [
    {
      name: "Thumbnail",
      width: "150px",
      selector: (row) =>
        model_thumbnails[`./${row.name}.jpg`] === undefined,
      sortable: true,
      cell: (row, index, column, id) => {
        const thumb = model_thumbnails[`./${row.name}.jpg`];
        return renderThumbnailForTable(thumb);
      },
    },
    {
      selector: (row) => row.name,
      name: "Name",
      sortable: true,
      grow: 0.5,
    },
    {
      selector: (row) => row.tasks,
      name: "Tasks",
      cell: (row, index, column, id) =>
        row.tasks.map((t) => <TaskBadge key={t} taskName={t} />),
    },
    {
      selector: (row) => {
        const result = modelCheckResult(row.name);
        if (result === "Pass") {
          return (
            <img
              src="https://img.shields.io/badge/scivision_metadata-pass-green"
              title="The metadata for this model was successfully loaded by scivision, from the location in the catalog"
            />
          );
        } else if (result === "Fail") {
          return (
            <img
              src="https://img.shields.io/badge/scivision_metadata-fail-red"
              title="Scivision metadata (yaml) file for this model failed to load or was missing at the indicated location"
            />
          );
        } else {
          return (
            <img
              src="https://img.shields.io/badge/scivision_metadata-unknown-lightgray"
              title="Could not access the result for this validation check"
            />
          );
        }
      },
      name: (
        <span
          className="tooltip-available"
          title={modelValidationTimeString()}
        >
          Validation checks
        </span>
      ),
      grow: 0.5,
    },
  ];

  const check_models_script_url =
  "https://github.com/alan-turing-institute/scivision/releases/download/model-checks-report-latest-release/check_models.js"

  useScript({
    src: check_models_script_url,
    onReady: () => setmodelChecksReport(window.global_CheckModelReport),
    onError: () =>
      console.log(
        `Could not load latest model checks from ${check_models_script_url}`,
      ),
  });

  return (
    <DataTable
      columns={columns}
      data={models.entries}
      title=""
      expandableRowsComponent={(props) => (
        <TableCardDropdown element={<modelDefinitionList {...props} />} />
      )}
      expandableRows
      expandableRowsHideExpander
      expandOnRowClicked
    />
  );
}

// Component: Models, table view
// route: /Models
export default function ModelTable() {
  return (
    <>
      <ModelNav />
      <h3>Models</h3>
      <ModelTableContents />
    </>
  );
}
