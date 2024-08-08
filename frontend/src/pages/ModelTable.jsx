import { global_CheckModelReport } from '@/consts/check_models.js'

import DataTable from 'react-data-table-component'

import { extractThumbnailFromName } from '@/utils/ExtractThumbnails'
import {
    renderThumbnailForTable,
    TableCardDropdown,
} from '../table_helpers.jsx'
import { TaskBadge } from '@/components/Badges'

import models from '../catalog/data/models.json'
import { ModelsHeader } from '@/components/Typography'

// Component: Fragment containing definition items for the expanded
// view of the model table, and the model page
//
// * data - one model
function ModelDefinitionList({ data }) {
    return (
        <dl className="row">
            <dt className="col-sm-3">Description</dt>
            <dd className="col-sm-9">
                {data.description ? data.description : '(none provided)'}
            </dd>

            <dt className="col-sm-3">Homepage</dt>
            <dd className="col-sm-9">
                <a href={data.url}>{data.url}</a>
            </dd>

            <dt className="col-sm-3">Install with pip</dt>
            <dd className="col-sm-9">
                <div>
                    <code>pip install {data.pkg_url}</code>
                </div>
            </dd>
        </dl>
    )
}

function ModelTableContents() {
    const modelChecksReport = global_CheckModelReport
    
    function modelCheckResult(name) {
        if (modelChecksReport !== null) {
            const report = modelChecksReport.report[name]
            if (report !== undefined) {
                return report.check_result
            } else {
                return 'Unknown'
            }
        } else {
            return 'Unknown'
        }
    }

    function modelCheckTime() {
        if (modelChecksReport) {
            var time = new Date(modelChecksReport.time)
            return time.toUTCString()
        } else {
            return '(never)'
        }
    }

    function modelValidationTimeString() {
        return `last run ${modelCheckTime()}`
    }

    const columns = [
        {
            name: 'Thumbnail',
            width: '150px',
            selector: (row) =>
                extractThumbnailFromName('model', row.name) === undefined,
            sortable: true,
            cell: (row) => {
                const thumb = extractThumbnailFromName('model', row.name)
                return renderThumbnailForTable(thumb, row.name, 'model')
            },
        },
        {
            name: 'Name',
            sortable: true,
            grow: 0.5,
            selector: (row) => row.name,
        },
        {
            name: 'Tasks',
            selector: (row) => row.tasks,
            cell: (row) =>
                row.tasks.map((t) => <TaskBadge key={t} taskName={t} />),
        },
        {
            selector: (row) => {
                const result = modelCheckResult(row.name)

                if (result === 'Pass') {
                    return (
                        <img
                            src="https://img.shields.io/badge/scivision_metadata-pass-green"
                            title="The metadata for this model was successfully loaded by Scivision, from the location in the catalog"
                        />
                    )
                } else if (result === 'Fail') {
                    return (
                        <img
                            src="https://img.shields.io/badge/scivision_metadata-fail-red"
                            title="Scivision metadata (yaml) file for this model failed to load or was missing at the indicated location"
                        />
                    )
                } else {
                    return (
                        <img
                            src="https://img.shields.io/badge/scivision_metadata-unknown-lightgray"
                            title="Could not access the result for this validation check"
                        />
                    )
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
    ]

    return (
        <DataTable
            columns={columns}
            data={models.entries}
            defaultSortFieldId={2} 
            title=""
            expandableRowsComponent={(props) => (
                <TableCardDropdown
                    element={<ModelDefinitionList {...props} />}
                />
            )}
            expandableRows
            expandableRowsHideExpander
            expandOnRowClicked
        />
    )
}

// Component: Models, table view
// route: /models
export default function ModelTable() {
    return (
        <>
            <ModelsHeader />
            <ModelTableContents />
        </>
    )
}
