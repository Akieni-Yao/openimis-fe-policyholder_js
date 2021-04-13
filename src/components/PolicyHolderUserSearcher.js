import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import {
    withModulesManager,
    formatMessageWithValues,
    Searcher,
    formatDateFromISO,
    decodeId,
    journalize,
    withTooltip,
    coreConfirm,
    formatMessage
} from "@openimis/fe-core";
import { IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchPolicyHolderUsers, deletePolicyHolderUser } from "../actions"
import {
    DEFAULT_PAGE_SIZE,
    RIGHT_POLICYHOLDERUSER_DELETE,
    RIGHT_POLICYHOLDERUSER_REPLACE,
    RIGHT_POLICYHOLDERUSER_UPDATE,
    RIGHT_PORTALPOLICYHOLDERUSER_DELETE,
    RIGHT_PORTALPOLICYHOLDERUSER_REPLACE,
    RIGHT_PORTALPOLICYHOLDERUSER_UPDATE,
    ROWS_PER_PAGE_OPTIONS,
    ZERO,
    MAX_CLIENTMUTATIONLABEL_LENGTH
} from "../constants";
import PolicyHolderUserFilter from "./PolicyHolderUserFilter";
import UpdatePolicyHolderUserDialog from "../dialogs/UpdatePolicyHolderUserDialog";

const DEFAULT_ORDER_BY = "id";

class PolicyHolderUserSearcher extends Component {
    state = {
        queryParams: null,
        toDelete: null,
        deleted: []
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
        } else if (prevState.toDelete !== this.state.toDelete && !!this.state.toDelete) {
            this.setState((state) => ({ deleted: state.deleted.concat(state.toDelete), toDelete: null }));
        } else if (prevState.deleted !== this.state.deleted || prevProps.reset !== this.props.reset) {
            this.refetch();
        }
    }

    fetch = params => this.props.fetchPolicyHolderUsers(params);

    refetch = () => this.fetch(this.state.queryParams);

    filtersToQueryParams = state => {
        let params = Object.keys(state.filters)
            .filter(f => !!state.filters[f]['filter'])
            .map(f => state.filters[f]['filter']);
        params.push(`first: ${state.pageSize}`);
        if (!!state.afterCursor) {
            params.push(`after: "${state.afterCursor}"`);
        }
        if (!!state.beforeCursor) {
            params.push(`before: "${state.beforeCursor}"`);
        }
        if (!!state.orderBy) {
            params.push(`orderBy: ["${state.orderBy}"]`);
        }
        this.setState({ queryParams: params });
        return params;
    }

    headers = () => {
        const result = [
            "policyHolder.policyHolderUser.userName",
            "policyHolder.policyHolderUser.dateValidFrom",
            "policyHolder.policyHolderUser.dateValidTo"
        ];
        if (
            [
                RIGHT_POLICYHOLDERUSER_REPLACE,
                RIGHT_PORTALPOLICYHOLDERUSER_REPLACE
            ].some(right => this.props.rights.includes(right))
        ) {
            result.push("policyHolder.emptyLabel");
        }
        if (
            [
                RIGHT_POLICYHOLDERUSER_UPDATE,
                RIGHT_PORTALPOLICYHOLDERUSER_UPDATE
            ].some(right => this.props.rights.includes(right))
        ) {
            result.push("policyHolder.emptyLabel");
        }
        if (
            [
                RIGHT_POLICYHOLDERUSER_DELETE,
                RIGHT_PORTALPOLICYHOLDERUSER_DELETE
            ].some(right => this.props.rights.includes(right))
        ) {
            result.push("policyHolder.emptyLabel");
        }
        return result;
    }

    itemFormatters = () => {
        const { intl, modulesManager, rights, onSave } = this.props;
        const result = [
            policyHolderUser => !!policyHolderUser.user
                ? decodeId(policyHolderUser.user.id)
                : "",
            policyHolderUser => !!policyHolderUser.dateValidFrom
                ? formatDateFromISO(modulesManager, intl, policyHolderUser.dateValidFrom)
                : "",
            policyHolderUser => !!policyHolderUser.dateValidTo
                ? formatDateFromISO(modulesManager, intl, policyHolderUser.dateValidTo)
                : ""
        ];
        if (
            [
                RIGHT_POLICYHOLDERUSER_REPLACE,
                RIGHT_PORTALPOLICYHOLDERUSER_REPLACE
            ].some(right => rights.includes(right))
        ) {
            result.push(
                policyHolderUser => !this.isDeletedFilterEnabled(policyHolderUser) && (
                    <UpdatePolicyHolderUserDialog
                        onSave={onSave}
                        policyHolderUser={policyHolderUser}
                        disabled={this.state.deleted.includes(policyHolderUser.id)}
                        isReplacing
                    />
                )
            );
        }
        if (
            [
                RIGHT_POLICYHOLDERUSER_UPDATE,
                RIGHT_PORTALPOLICYHOLDERUSER_UPDATE
            ].some(right => rights.includes(right))
        ) {
            result.push(
                policyHolderUser => !this.isDeletedFilterEnabled(policyHolderUser) && (
                    <UpdatePolicyHolderUserDialog
                        onSave={onSave}
                        policyHolderUser={policyHolderUser}
                        disabled={this.state.deleted.includes(policyHolderUser.id)}
                    />
                )
            );
        }
        if (
            [
                RIGHT_POLICYHOLDERUSER_DELETE,
                RIGHT_PORTALPOLICYHOLDERUSER_DELETE
            ].some(right => rights.includes(right))
        ) {
            result.push(
                policyHolderUser => !this.isDeletedFilterEnabled(policyHolderUser) && withTooltip(
                    <div>
                        <IconButton
                            onClick={() => this.onDelete(policyHolderUser)}
                            disabled={this.state.deleted.includes(policyHolderUser.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </div>,
                    formatMessage(intl, "policyHolder", "deleteButton.tooltip")
                )
            );
        }
        return result;
    }

    onDelete = policyHolderUser => {
        const { intl, coreConfirm, deletePolicyHolderUser } = this.props;
        let confirm = () =>
            coreConfirm(
                formatMessageWithValues(intl, "policyHolder", "policyHolderUser.dialog.delete.title", {
                    user: policyHolderUser.user
                }),
                formatMessage(intl, "policyHolder", "dialog.delete.message")
            );
        let confirmedAction = () => {
            deletePolicyHolderUser(
                policyHolderUser,
                formatMessageWithValues(intl, "policyHolder", "DeletePolicyHolderUser.mutationLabel", {
                    user: policyHolderUser.user,
                    policyHolder: `${policyHolderUser.policyHolder.code} - ${policyHolderUser.policyHolder.tradeName}`,
                }).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
            );
            this.setState({ toDelete: policyHolderUser.id });
        };
        this.setState(
            { confirmedAction },
            confirm
        );
    }

    sorts = () => [
        ['id', true],
        ['dateValidFrom', true],
        ['dateValidTo', true]
    ];

    defaultFilters = () => ({
        isDeleted: {
            value: false,
            filter: "isDeleted: false"
        }
    });

    isDeletedFilterEnabled = policyHolderUser => policyHolderUser.isDeleted;

    isRowDisabled = (_, policyHolderUser) => 
        this.state.deleted.includes(policyHolderUser.id) &&
        !this.isDeletedFilterEnabled(policyHolderUser);

    render() {
        const {
            intl,
            fetchingPolicyHolderUsers,
            fetchedPolicyHolderUsers,
            errorPolicyHolderUsers,
            policyHolderUsers,
            policyHolderUsersPageInfo,
            policyHolderUsersTotalCount
        } = this.props;
        return (
            <Searcher
                module="policyHolder"
                FilterPane={PolicyHolderUserFilter}
                fetch={this.fetch}
                items={policyHolderUsers}
                itemsPageInfo={policyHolderUsersPageInfo}
                fetchingItems={fetchingPolicyHolderUsers}
                fetchedItems={fetchedPolicyHolderUsers}
                errorItems={errorPolicyHolderUsers}
                tableTitle={formatMessageWithValues(
                    intl,
                    "policyHolder",
                    "policyHolderUser.searcher.results.title",
                    { policyHolderUsersTotalCount }
                )}
                filtersToQueryParams={this.filtersToQueryParams}
                headers={this.headers}
                itemFormatters={this.itemFormatters}
                sorts={this.sorts}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                defaultPageSize={DEFAULT_PAGE_SIZE}
                defaultOrderBy={DEFAULT_ORDER_BY}
                defaultFilters={this.defaultFilters()}
                rowLocked={this.isRowDisabled}
                rowDisabled={this.isRowDisabled}
            />
        );
    }
}

const mapStateToProps = state => ({
    fetchingPolicyHolderUsers: state.policyHolder.fetchingPolicyHolderUsers,
    fetchedPolicyHolderUsers: state.policyHolder.fetchedPolicyHolderUsers,
    errorPolicyHolderUsers: state.policyHolder.errorPolicyHolderUsers,
    policyHolderUsers: state.policyHolder.policyHolderUsers,
    policyHolderUsersPageInfo: state.policyHolder.policyHolderUsersPageInfo,
    policyHolderUsersTotalCount: state.policyHolder.policyHolderUsersTotalCount,
    submittingMutation: state.policyHolder.submittingMutation,
    mutation: state.policyHolder.mutation,
    confirmed: state.core.confirmed
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchPolicyHolderUsers, deletePolicyHolderUser, journalize, coreConfirm }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PolicyHolderUserSearcher)));
