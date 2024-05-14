import React, { Component } from "react";
import { injectIntl } from "react-intl";
import {
    withModulesManager,
    formatMessageWithValues,
    Searcher,
    journalize,
    coreConfirm,
    formatMessage,
    decodeId,
    historyPush
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchPolicyholderRequest, deletePolicyHolderUser } from "../actions";
import {
    DEFAULT_PAGE_SIZE,
    ROWS_PER_PAGE_OPTIONS,
    ZERO,
    MAX_CLIENTMUTATIONLABEL_LENGTH,
} from "../constants";
import PolicyHolderRequestSearcherPane from "./PolicyHolderRequestSearcherPane";
import { Grid, IconButton, Tooltip } from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";

const DEFAULT_ORDER_BY = "id";

class PolicyHolderRequestSeacrher extends Component {
    state = {
        queryParams: null,
        toDelete: null,
        deleted: [],
    };
    constructor(props) {
        super(props);
        this.locationLevels = this.props.modulesManager.getConf(
            "fe-location",
            "location.Location.MaxLevels",
            4
        );
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
        } else if (
            prevProps.confirmed !== this.props.confirmed &&
            !!this.props.confirmed &&
            !!this.state.confirmedAction
        ) {
            this.state.confirmedAction();
        } else if (
            prevState.toDelete !== this.state.toDelete &&
            !!this.state.toDelete
        ) {
            this.setState((state) => ({
                deleted: state.deleted.concat(state.toDelete),
                toDelete: null,
            }));
        } else if (
            prevState.deleted !== this.state.deleted ||
            prevProps.reset !== this.props.reset
        ) {
            this.refetch();
        }
    }

    fetch = (params) => {
        this.props.fetchPolicyholderRequest(this.props.modulesManager, params);
        // this.props.handleFilters(params);
    };
    refetch = () => this.fetch(this.state.queryParams);

    filtersToQueryParams = (state) => {
        let params = Object.keys(state.filters)
            .filter((f) => !!state.filters[f]["filter"])
            .map((f) => state.filters[f]["filter"]);
        if (!state.beforeCursor && !state.afterCursor) {
            params.push(`first: ${state.pageSize}`);
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
            params.push(`isDeleted: false, formPhPortal: true`);
        }
        this.setState({ queryParams: params });

        return params;
    };

    headers = () => {
        const { rights, predefinedPolicyHolderId = null } = this.props;
        let result = [
            "policyHolder.Request No.",
            "policyHolder.tradeName",
            "policyHolder.shortName",
            "policyHolder.contactName",
            "policyHolder.phone",
            "policyHolder.address",
            "policyholder.status"
        ];
        return result;
    };
    rejectedCommentsTooltip = (rejectComment) => {
        return (
            formatMessage(this.props.intl, "policyHolder", `policyHolder.rejectComment.${rejectComment}`)
        );
    };
    itemFormatters = () => {
        const {
            intl,
            modulesManager,
            rights,
            onSave,
            predefinedPolicyHolderId = null,
        } = this.props;
        const getStatusStyle = (status) => {
            switch (status) {
                case "Approved":
                    return { color: 'green', fontWeight: 'bold' };
                case "Rejected":
                    return { color: 'red', fontWeight: 'bold' };
                case "Rework":
                    return { color: 'orange', fontWeight: 'bold' };
                default:
                    return { fontWeight: 'bold' };
            }
        };
        const result = [
            (policyHolderUser) =>
                !!policyHolderUser.requestNumber ? policyHolderUser.requestNumber : "",
            (policyHolderUser) =>
                !!policyHolderUser.tradeName ? policyHolderUser.tradeName : "",
            (policyHolderUser) =>
                !!policyHolderUser.shortName ? policyHolderUser.shortName : "",
            (policyHolderUser) =>
                !!policyHolderUser.contactName
                    ? JSON.parse(policyHolderUser.contactName).contactName
                    : "",
            (policyHolderUser) =>
                !!policyHolderUser.phone ? policyHolderUser.phone : "",
            (policyHolderUser) =>
                !!policyHolderUser.email ? policyHolderUser.email : "",
            (policyHolderUser) => {
                if (policyHolderUser.status === "Rejected" || policyHolderUser.status === "Rework") {
                    return (
                        <Grid item>
                            {policyHolderUser.status}
                            <Tooltip
                                // placement="left"
                                arrow
                                // classes={{
                                //   tooltip: this.props.classes.tooltip,
                                //   arrow: this.props.classes.customArrow
                                // }}
                                title={this.rejectedCommentsTooltip(policyHolderUser?.rejectedReason)}
                            >
                                <IconButton>
                                    <HelpIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    );
                } else {
                    return (
                        <span style={getStatusStyle(policyHolderUser.status)}>
                            {policyHolderUser.status}
                        </span>
                    );
                }
            },
        ];
        return result;
    };

    onDelete = (policyHolderUser) => {
        const { intl, coreConfirm, deletePolicyHolderUser } = this.props;
        let confirm = () =>
            coreConfirm(
                formatMessageWithValues(
                    intl,
                    "policyHolder",
                    "policyHolderUser.dialog.delete.title",
                    {
                        user: policyHolderUser.user.username,
                    }
                ),
                formatMessage(intl, "policyHolder", "dialog.delete.message")
            );
        let confirmedAction = () => {
            deletePolicyHolderUser(
                policyHolderUser,
                formatMessageWithValues(
                    intl,
                    "policyHolder",
                    "DeletePolicyHolderUser.mutationLabel",
                    {
                        user: policyHolderUser.user.username,
                        policyHolder: `${policyHolderUser.policyHolder.code} - ${policyHolderUser.policyHolder.tradeName}`,
                    }
                ).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
            );
            this.setState({ toDelete: policyHolderUser.id });
        };
        this.setState({ confirmedAction }, confirm);
    };

    defaultFilters = () => {
        const filters = {};
        return filters;
    };

    isDeletedFilterEnabled = (policyHolderUser) => policyHolderUser.isDeleted;

    //   isRowDisabled = (_, policyHolderUser) =>
    //     this.state.deleted.includes(policyHolderUser.id) &&
    //     !this.isDeletedFilterEnabled(policyHolderUser);
    onDoubleClick = (policyHolder, newTab = false) => {
        const { rights, modulesManager, history } = this.props;
        historyPush(
            modulesManager,
            history,
            "policyHolder.route.policyholder.approval",
            [decodeId(policyHolder.id)],
            newTab
        );
    };
    render() {
        const {
            intl,
            fetchingPolicyHolderUsers,
            fetchedPolicyHolderUsers,
            errorPolicyHolderUsers,
            policyHolderUsers,
            policyHolderUsersPageInfo,
            policyHoldersTotalCount,
            predefinedPolicyHolderId,
            declaration,
        } = this.props;
        return (
            <Searcher
                module="policyHolder"
                FilterPane={PolicyHolderRequestSearcherPane}
                fetch={this.fetch}
                items={declaration}
                itemsPageInfo={policyHolderUsersPageInfo}
                fetchingItems={fetchingPolicyHolderUsers}
                fetchedItems={fetchedPolicyHolderUsers}
                errorItems={errorPolicyHolderUsers}
                tableTitle={formatMessageWithValues(
                    intl,
                    "policyHolder",
                    "policyHolders.searcher.results.title",
                    { policyHoldersTotalCount }
                )}
                filtersToQueryParams={this.filtersToQueryParams}
                headers={this.headers}
                itemFormatters={this.itemFormatters}
                // sorts={this.sorts}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                defaultPageSize={DEFAULT_PAGE_SIZE}
                defaultOrderBy={DEFAULT_ORDER_BY}
                defaultFilters={this.defaultFilters()}
                // rowLocked={this.isRowDisabled}
                // rowDisabled={this.isRowDisabled}
                FilterExt={predefinedPolicyHolderId}
                onDoubleClick={(policyHolder) =>
                    this.onDoubleClick(policyHolder)
                }
            />
        );
    }
}

const mapStateToProps = (state) => ({
    fetchingPolicyHolderUsers: state.policyHolder.fetchingRequestPolicyholder,
    fetchedPolicyHolderUsers: state.policyHolder.fetchedRequestPolicyholder,
    errorPolicyHolderUsers: state.policyHolder.errorRequestPolicyholder,
    policyHolderUsersPageInfo: state.policyHolder.RequestPolicyholderPageInfo,
    policyHoldersTotalCount: state.policyHolder.RequestPolicyholderTotalCount,
    submittingMutation: state.policyHolder.submittingMutation,
    mutation: state.policyHolder.mutation,
    confirmed: state.core.confirmed,
    declaration: state.policyHolder.RequestPolicyholder,
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        { fetchPolicyholderRequest, deletePolicyHolderUser, journalize, coreConfirm },
        dispatch
    );
};

export default withModulesManager(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(PolicyHolderRequestSeacrher))
);
