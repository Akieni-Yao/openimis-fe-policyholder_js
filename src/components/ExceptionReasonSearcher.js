import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  formatDateFromISO,
  coreConfirm,
  journalize,
  Searcher,
  PublishedComponent,
} from "@openimis/fe-core";
import PolicyHolderFilter from "./PolicyHolderFilter";
import {
  fetchPolicyHolders,
  deletePolicyHolder,
  fetchExceptionReasons,
  createExceptionReason,
  updateExceptionReason,
  deleteExceptionReason,
} from "../actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton, Tooltip } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  ZERO,
  MAX_CLIENTMUTATIONLABEL_LENGTH,
  RIGHT_POLICYHOLDER_UPDATE,
  RIGHT_POLICYHOLDER_DELETE,
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  RIGHT_PORTALPOLICYHOLDER_SEARCH,
} from "../constants";

class ExceptionReasonSearcher extends Component {
  constructor(props) {
    super(props);
    this.rowsPerPageOptions = props.modulesManager.getConf(
      "fe-policyHolder",
      "policyHolderFilter.rowsPerPageOptions",
      ROWS_PER_PAGE_OPTIONS
    );
    this.defaultPageSize = props.modulesManager.getConf(
      "fe-policyHolder",
      "policyHolderFilter.defaultPageSize",
      DEFAULT_PAGE_SIZE
    );
    this.state = {
      toDelete: null,
      deleted: [],
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // if (prevProps.submittingMutation && !this.props.submittingMutation) {
    //   this.props.journalize(this.props.mutation);
    //   this.setState((state) => ({
    //     deleted: state.deleted.concat(state.toDelete),
    //   }));
    // } else if (
    //   prevProps.confirmed !== this.props.confirmed &&
    //   !!this.props.confirmed &&
    //   !!this.state.confirmedAction
    // ) {
    //   this.state.confirmedAction();
    // }
  }

  fetch = (params) => {
    this.props.fetchExceptionReasons(this.props.modulesManager, params);
  };

  headers = () => {
    const { rights } = this.props;
    let result = ["Raison", "Période", "Scope", "Date de création"];
    if (rights.includes(RIGHT_POLICYHOLDER_UPDATE)) {
      result.push("policyHolder.emptyLabel");
    }
    if (rights.includes(RIGHT_POLICYHOLDER_DELETE)) {
      result.push("policyHolder.emptyLabel");
    }
    return result;
  };

  itemFormatters = () => {
    const {
      intl,
      modulesManager,
      onDoubleClick,
      policyHolderPageLink,
      rights,
    } = this.props;
    let result = [
      (data) => `${data.reason}`,
      (data) => `${data.period}`,
      (data) => `${data.scope}`,
      (data) => `${formatDateFromISO(modulesManager, intl, date.createdAt)}`,
    ];
    // if (
    //   rights.includes(RIGHT_POLICYHOLDER_UPDATE) ||
    //   rights.includes(RIGHT_PORTALPOLICYHOLDER_SEARCH)
    // ) {
    //   result.push(
    //     (policyHolder) =>
    //       !this.isDeletedFilterEnabled(policyHolder) && (
    //         <Tooltip
    //           title={formatMessage(intl, "policyHolder", "editButton.tooltip")}
    //         >
    //           <IconButton
    //             href={policyHolderPageLink(policyHolder)}
    //             onClick={(e) =>
    //               e.stopPropagation() &&
    //               !policyHolder.clientMutationId &&
    //               onDoubleClick(policyHolder)
    //             }
    //             disabled={this.state.deleted.includes(policyHolder.id)}
    //           >
    //             <EditIcon />
    //           </IconButton>
    //         </Tooltip>
    //       )
    //   );
    // }
    if (rights.includes(RIGHT_POLICYHOLDER_DELETE)) {
      result.push(
        (policyHolder) =>
          !this.isDeletedFilterEnabled(policyHolder) && (
            <Tooltip
              title={formatMessage(
                intl,
                "policyHolder",
                "deleteButton.tooltip"
              )}
            >
              <IconButton
                onClick={() => this.onDelete(policyHolder)}
                disabled={this.state.deleted.includes(policyHolder.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )
      );
    }
    return result;
  };

  onDelete = (policyHolder) => {
    const { intl, coreConfirm, deletePolicyHolder } = this.props;
    let confirm = () =>
      coreConfirm(
        formatMessageWithValues(
          intl,
          "policyHolder",
          "deletePolicyHolder.confirm.title",
          {
            code: policyHolder.code,
            tradeName: policyHolder.tradeName,
          }
        ),
        formatMessage(intl, "policyHolder", "dialog.delete.message")
      );
    let confirmedAction = () => {
      deletePolicyHolder(
        policyHolder,
        formatMessageWithValues(
          intl,
          "policyHolder",
          "DeletePolicyHolder.mutationLabel",
          {
            code: policyHolder.code,
            tradeName: policyHolder.tradeName,
          }
        ).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
      );
      this.setState({ toDelete: policyHolder.id });
    };
    this.setState({ confirmedAction }, confirm);
  };

  isDeletedFilterEnabled = (policyHolder) => policyHolder.isDeleted;

  isRowDisabled = (_, policyHolder) =>
    this.state.deleted.includes(policyHolder.id) &&
    !this.isDeletedFilterEnabled(policyHolder);

  isOnDoubleClickEnabled = (policyHolder) =>
    !this.state.deleted.includes(policyHolder.id) &&
    !this.isDeletedFilterEnabled(policyHolder);

  sorts = () => {
    return [
      // ["code", true],
      // null,
      // ["legalForm", true],
      // ["activityCode", true],
      // ["dateValidFrom", true],
      // ["dateValidTo", true],
      // ["status", true],
    ];
  };

  defaultFilters = () => {
    return {};
    // return {
    //   isDeleted: {
    //     value: false,
    //     filter: "isDeleted: false",
    //   },
    //   applyDefaultValidityFilter: {
    //     value: true,
    //     filter: "applyDefaultValidityFilter: true,isApproved: true",
    //   },
    // };
  };

  render() {
    const {
      intl,
      // fetchingPolicyHolders,
      // fetchedPolicyHolders,
      // errorPolicyHolders,
      // policyHolders,
      // policyHoldersPageInfo,
      // policyHoldersTotalCount,
      onDoubleClick,
      fetchingExceptionReasons,
      fetchedExceptionReasons,
      exceptionReasons,
      exceptionReasonsPageInfo,
      exceptionReasonsTotalCount,
      errorExceptionReasons,
      exceptionReasonsMutation,
      exceptionReasonsMutationError,
      exceptionReasonsMutationSuccess,
    } = this.props;
    return (
      <Fragment>
        <Searcher
          module="policyHolder"
          FilterPane={null}
          fetch={this.fetch}
          items={exceptionReasons}
          itemsPageInfo={exceptionReasonsPageInfo}
          fetchingItems={fetchingExceptionReasons}
          fetchedItems={fetchedExceptionReasons}
          errorItems={errorExceptionReasons}
          tableTitle={formatMessageWithValues(
            intl,
            "policyHolder",
            "policyHolder.exceptionReasons.searcher.results.title",
            { exceptionReasonsTotalCount }
          )}
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          defaultOrderBy="-createdAt"
          onDoubleClick={(policyHolder) => {}}
          rowDisabled={this.isRowDisabled}
          rowLocked={this.isRowDisabled}
          defaultFilters={this.defaultFilters()}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  // fetchingPolicyHolders: state.policyHolder.fetchingPolicyHolders,
  // fetchedPolicyHolders: state.policyHolder.fetchedPolicyHolders,
  // errorPolicyHolders: state.policyHolder.errorPolicyHolders,
  // policyHolders: state.policyHolder.policyHolders,
  // policyHoldersPageInfo: state.policyHolder.policyHoldersPageInfo,
  // policyHoldersTotalCount: state.policyHolder.policyHoldersTotalCount,
  // confirmed: state.core.confirmed,
  // submittingMutation: state.policyHolder.submittingMutation,
  // mutation: state.policyHolder.mutation,

  fetchingExceptionReasons: state.policyHolder.fetchingExceptionReasons,
  fetchedExceptionReasons: state.policyHolder.fetchedExceptionReasons,
  exceptionReasons: state.policyHolder.exceptionReasons,
  exceptionReasonsPageInfo: state.policyHolder.exceptionReasonsPageInfo,
  exceptionReasonsTotalCount: state.policyHolder.exceptionReasonsTotalCount,
  errorExceptionReasons: state.policyHolder.errorExceptionReasons,

  exceptionReasonsMutation: state.policyHolder.exceptionReasonsMutation,
  exceptionReasonsMutationError:
    state.policyHolder.exceptionReasonsMutationError,
  exceptionReasonsMutationSuccess:
    state.policyHolder.exceptionReasonsMutationSuccess,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchPolicyHolders,
      coreConfirm,
      deletePolicyHolder,
      journalize,
      fetchExceptionReasons,
      createExceptionReason,
      updateExceptionReason,
      deleteExceptionReason,
    },
    dispatch
  );
};

export default withModulesManager(
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(ExceptionReasonSearcher)
  )
);
