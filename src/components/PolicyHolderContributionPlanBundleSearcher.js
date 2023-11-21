import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import {
    withModulesManager,
    formatMessageWithValues,
    formatDateFromISO,
    Searcher,
    decodeId,
    withTooltip,
    formatMessage,
    coreConfirm
} from "@openimis/fe-core";
import PolicyHolderContributionPlanBundleFilter from "./PolicyHolderContributionPlanBundleFilter";
import PolicyHolderContributionPlanBundlePicker from "../pickers/PolicyHolderContributionPlanBundlePicker";
import {
    fetchPolicyHolderContributionPlanBundles,
    fetchPickerPolicyHolderContributionPlanBundles,
    deletePolicyHolderContributionPlanBundle
} from "../actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import {
    ZERO,
    MAX_CLIENTMUTATIONLABEL_LENGTH,
    DEFAULT_PAGE_SIZE,
    ROWS_PER_PAGE_OPTIONS,
    RIGHT_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_REPLACE,
    RIGHT_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_UPDATE,
    RIGHT_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_DELETE
} from "../constants";
import UpdatePolicyHolderContributionPlanBundleDialog from "../dialogs/UpdatePolicyHolderContributionPlanBundleDialog";

const DEFAULT_ORDER_BY = "contributionPlanBundle";

class PolicyHolderContributionPlanBundleSearcher extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toDelete: null,
            deleted: [],
            queryParams: null
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // setTimeout(() => {
        //     this.props.fetchPickerPolicyHolderContributionPlanBundles(this.props.modulesManager, [`policyHolder_Id: "${decodeId(this.props.policyHolder.id)}"`]);
        // }, 2000);
        if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        } else if (prevState.toDelete !== this.state.toDelete) {
            this.setState(state => ({ deleted: state.deleted.concat(state.toDelete) }));
        } else if (prevState.deleted !== this.state.deleted || prevProps.reset !== this.props.reset) {
            this.refetch();
            this.props.fetchPickerPolicyHolderContributionPlanBundles(this.props.modulesManager, [`policyHolder_Id: "${decodeId(this.props.policyHolder.id)}"`]);
        }
    }

    fetch = params => this.props.fetchPolicyHolderContributionPlanBundles(this.props.modulesManager, params);

    refetch = () => this.fetch(this.state.queryParams);

    filtersToQueryParams = state => {
        let params = Object.keys(state.filters)
            .filter(f => !!state.filters[f]['filter'])
            .map(f => state.filters[f]['filter']);
        if (!state.beforeCursor && !state.afterCursor) {
            params.push(`first: ${state.pageSize}`);
        }
        params.push(`policyHolder_Id: "${decodeId(this.props.policyHolder.id)}"`);
        if (!state.filters.hasOwnProperty('isDeleted')) {
            params.push("isDeleted: false");
        }
        if (!!state.afterCursor) {
            params.push(`after: "${state.afterCursor}"`);
            params.push(`first: ${state.pageSize}`);
        }
        if (!!state.beforeCursor) {
            params.push(`before: "${state.beforeCursor}"`);
            params.push(`last: ${state.pageSize}`);
        }
        if (!!state.orderBy) {
            params.push(`orderBy: ["${state.orderBy}"]`);
        }
        this.setState({ queryParams: params });
        return params;
    }

    headers = () => {
        const { rights } = this.props;
        let result = [
            "policyHolder.contributionPlanBundle",
            "policyHolder.calculation",
            "policyHolder.dateValidFrom",
            "policyHolder.dateValidTo"
        ];
        if (rights.includes(RIGHT_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_REPLACE)) {
            result.push("policyHolder.emptyLabel");
        }
        if (rights.includes(RIGHT_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_UPDATE)) {
            result.push("policyHolder.emptyLabel");
        }
        if (rights.includes(RIGHT_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_DELETE)) {
            result.push("policyHolder.emptyLabel");
        }
        return result;
    }

    itemFormatters = () => {
        const { intl, modulesManager, rights, policyHolder, onSave } = this.props;
        let result = [
            policyHolderContributionPlanBundle => !!policyHolderContributionPlanBundle.contributionPlanBundle
                ? <PolicyHolderContributionPlanBundlePicker
                    value={policyHolderContributionPlanBundle.contributionPlanBundle}
                    withLabel={false}
                    policyHolderId={decodeId(policyHolder.id)}
                    readOnly />
                : "",
            policyHolderContributionPlanBundle => !!policyHolderContributionPlanBundle.jsonExt ? policyHolderContributionPlanBundle.jsonExt : "",
            policyHolderContributionPlanBundle => !!policyHolderContributionPlanBundle.dateValidFrom
                ? formatDateFromISO(modulesManager, intl, policyHolderContributionPlanBundle.dateValidFrom)
                : "",
            policyHolderContributionPlanBundle => !!policyHolderContributionPlanBundle.dateValidTo
                ? formatDateFromISO(modulesManager, intl, policyHolderContributionPlanBundle.dateValidTo)
                : ""
        ];
        if (rights.includes(RIGHT_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_REPLACE)) {
            result.push(
                policyHolderContributionPlanBundle => !this.isDeletedFilterEnabled(policyHolderContributionPlanBundle) && (
                    <UpdatePolicyHolderContributionPlanBundleDialog
                        policyHolder={policyHolder}
                        policyHolderContributionPlanBundle={policyHolderContributionPlanBundle}
                        onSave={onSave}
                        disabled={this.state.deleted.includes(policyHolderContributionPlanBundle.id) || this.isReplaced(policyHolderContributionPlanBundle)}
                        isReplacing={true}
                    />
                )
            );
        }
        if (rights.includes(RIGHT_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_UPDATE)) {
            result.push(
                policyHolderContributionPlanBundle => !this.isDeletedFilterEnabled(policyHolderContributionPlanBundle) && (
                    <UpdatePolicyHolderContributionPlanBundleDialog
                        policyHolder={policyHolder}
                        policyHolderContributionPlanBundle={policyHolderContributionPlanBundle}
                        onSave={onSave}
                        disabled={this.state.deleted.includes(policyHolderContributionPlanBundle.id) || this.isReplaced(policyHolderContributionPlanBundle)}
                    />
                )
            );
        }
        if (rights.includes(RIGHT_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_DELETE)) {
            result.push(
                policyHolderContributionPlanBundle => !this.isDeletedFilterEnabled(policyHolderContributionPlanBundle) && withTooltip(
                    <div>
                        <IconButton
                            onClick={() => this.onDelete(policyHolderContributionPlanBundle)}
                            disabled={this.state.deleted.includes(policyHolderContributionPlanBundle.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </div>,
                    formatMessage(this.props.intl, "policyHolder", "deleteButton.tooltip")
                )
            );
        }
        return result;
    }

    onDelete = policyHolderContributionPlanBundle => {
        const { intl, coreConfirm, deletePolicyHolderContributionPlanBundle, policyHolder } = this.props;
        let confirm = () =>
            coreConfirm(
                formatMessageWithValues(
                    intl,
                    "policyHolder",
                    "policyHolderContributionPlanBundle.dialog.delete.title",
                    {
                        code: policyHolderContributionPlanBundle.contributionPlanBundle.code,
                        name: policyHolderContributionPlanBundle.contributionPlanBundle.name
                    }
                ),
                formatMessage(intl, "policyHolder", "dialog.delete.message")
            );
        let confirmedAction = () => {
            deletePolicyHolderContributionPlanBundle(
                policyHolderContributionPlanBundle,
                formatMessageWithValues(
                    intl,
                    "policyHolder",
                    "DeletePolicyHolderContributionPlanBundle.mutationLabel",
                    {
                        code: policyHolder.code,
                        tradeName: policyHolder.tradeName
                    }
                ).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
            );
            this.setState({ toDelete: policyHolderContributionPlanBundle.id });
        }
        this.setState(
            { confirmedAction },
            confirm
        )
    }

    isReplaced = policyHolderContributionPlanBundle => !!policyHolderContributionPlanBundle.replacementUuid;

    isDeletedFilterEnabled = policyHolderContributionPlanBundle => policyHolderContributionPlanBundle.isDeleted;

    isRowDisabled = (_, policyHolderContributionPlanBundle) => this.state.deleted.includes(policyHolderContributionPlanBundle.id)
        && !this.isDeletedFilterEnabled(policyHolderContributionPlanBundle);

    sorts = () => {
        return [
            ['contributionPlanBundle', true],
            null,
            ['dateValidFrom', true],
            ['dateValidTo', true]
        ]
    }

    render() {
        const { intl, fetchingPolicyHolderContributionPlanBundles, fetchedPolicyHolderContributionPlanBundles, errorPolicyHolderContributionPlanBundles, 
            policyHolderContributionPlanBundles, policyHolderContributionPlanBundlesPageInfo, policyHolderContributionPlanBundlesTotalCount } = this.props;
        return (
            <Fragment>
                <Searcher
                    module="policyHolder"
                    FilterPane={PolicyHolderContributionPlanBundleFilter}
                    fetch={this.fetch}
                    items={policyHolderContributionPlanBundles}
                    itemsPageInfo={policyHolderContributionPlanBundlesPageInfo}
                    fetchingItems={fetchingPolicyHolderContributionPlanBundles}
                    fetchedItems={fetchedPolicyHolderContributionPlanBundles}
                    errorItems={errorPolicyHolderContributionPlanBundles}
                    tableTitle={formatMessageWithValues(intl, "policyHolder", "policyHolderContributionPlanBundle.searcher.title", { policyHolderContributionPlanBundlesTotalCount })}
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    filtersToQueryParams={this.filtersToQueryParams}
                    sorts={this.sorts}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    defaultPageSize={DEFAULT_PAGE_SIZE}
                    defaultOrderBy={DEFAULT_ORDER_BY}
                    rowLocked={this.isRowDisabled}
                    rowDisabled={this.isRowDisabled}
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    fetchingPolicyHolderContributionPlanBundles: state.policyHolder.fetchingPolicyHolderContributionPlanBundles,
    fetchedPolicyHolderContributionPlanBundles: state.policyHolder.fetchedPolicyHolderContributionPlanBundles,
    errorPolicyHolderContributionPlanBundles: state.policyHolder.errorPolicyHolderContributionPlanBundles,
    policyHolderContributionPlanBundles: state.policyHolder.policyHolderContributionPlanBundles,
    policyHolderContributionPlanBundlesPageInfo: state.policyHolder.policyHolderContributionPlanBundlesPageInfo,
    policyHolderContributionPlanBundlesTotalCount: state.policyHolder.policyHolderContributionPlanBundlesTotalCount,
    confirmed: state.core.confirmed
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchPolicyHolderContributionPlanBundles, fetchPickerPolicyHolderContributionPlanBundles,
        deletePolicyHolderContributionPlanBundle, coreConfirm }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PolicyHolderContributionPlanBundleSearcher)));
