import CatalogEntryForm, {
    CatalogFormHowItWorksBox,
} from '@/components/CatalogEntryForm.jsx'
import { PageTitle } from '@/components/Typography'

import model_schema from '../catalog/model_schema.js'

export default function ModelNew() {
    return (
        <>
            <PageTitle>Add a model to the catalog</PageTitle>

            <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                            <h3>What is this?</h3>
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-3 sm:mt-0 md:text-base">
                            <p>
                                Use this form to propose a pre-trained model for
                                inclusion in the catalog.
                                <br />
                                <br />
                            </p>

                            <CatalogFormHowItWorksBox />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                            <h3>Prerequisites</h3>
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-3 sm:mt-0">
                            <div className="prose mt-1 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
                                <ul className="">
                                    <li>
                                        You have a GitHub account
                                        <ul>
                                            <li>
                                                You can sign up for a free
                                                account by going to{' '}
                                                <a href="https://github.com/">
                                                    https://github.com/
                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        Your model is publically available from
                                        a source repository or on a package
                                        server
                                        <ul>
                                            <li>
                                                The Scivision catalog does not
                                                host your model, just a link to
                                                it, so it must be publically
                                                accessible somewhere
                                            </li>
                                            <li>
                                                For example, your model may be
                                                published on PyPI or have its
                                                source code available on GitHub,
                                                GitLab or elsewhere
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        Your model includes everything needed to
                                        run it, including any weights and
                                        parameters
                                        <ul>
                                            <li>
                                                Not <em>just</em> model weights
                                            </li>
                                            <li>
                                                Note: Models that require
                                                training or fitting to data
                                                before running can be suggested,
                                                but answer 'No' to{' '}
                                                <em>
                                                    Model runs with Scivision?
                                                </em>{' '}
                                                below
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        Your model is set up as a Python
                                        package, and is installable with pip
                                        <ul>
                                            <li>
                                                Your model could be published to
                                                PyPI or another package server,
                                                but installing from a direct
                                                link to the source repository is
                                                also accepted
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        {' '}
                                        <strong>(Optionally)</strong> your model
                                        is in the{' '}
                                        <a href="https://scivision.readthedocs.io/en/latest/model_repository_template.html#api">
                                            correct format for Scivision
                                        </a>
                                        <ul>
                                            <li>
                                                This has the benefit of allowing
                                                programmatic access to the model
                                                through{' '}
                                                <a href="/scivisionpy">
                                                    Scivision.Py
                                                </a>
                                            </li>
                                            <li>
                                                {' '}
                                                In this case,{' '}
                                                <em>Scivision metadata URL </em>
                                                should be a direct link to the{' '}
                                                <a href="https://scivision.readthedocs.io/en/latest/model_repository_template.html#model-config-file">
                                                    model config file
                                                </a>{' '}
                                                in your repository
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </dd>
                    </div>
                </dl>
            </div>

            <h2>Add your model</h2>

            <div className="">
                <CatalogEntryForm
                    schema={model_schema}
                    uiSchema={{
                        'ui:title': ' ',
                        description: {
                            'ui:widget': 'textarea',
                        },
                        tasks: {
                            'ui:widget': 'checkboxes',
                            'ui:options': {
                                inline: true,
                            },
                        },
                        labels_provided: {
                            'ui:widget': 'radio',
                        },
                        scivision_usable: {
                            'ui:widget': 'radio',
                        },
                    }}
                    formData={JSON.parse(
                        sessionStorage.getItem('new-model-form-data')
                    )}
                    onChange={(e) =>
                        sessionStorage.setItem(
                            'new-model-form-data',
                            JSON.stringify(e.formData)
                        )
                    }
                    catalog_kind="model"
                    catalog_path="src/scivision/catalog/data/models.json"
                    download_filename="one-model.json"
                />
                <div className="p-3"></div>
            </div>
        </>
    )
}
