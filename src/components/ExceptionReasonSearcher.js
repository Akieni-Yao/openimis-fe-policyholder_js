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
import AlertSimpleDialogDelete from "./AlertSimpleDialogDelete";
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
      openDeleteDialog: false,
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

  onConfirmDelete = async (data) => {
    await this.props.deleteExceptionReason(data, this.props.modulesManager);
    this.fetch({
      first: 10,
      orderBy: "-createdAt",
    });

    this.setState({ openDeleteDialog: false });
  };

  handleCloseDialog = () => {
    this.setState({ openDeleteDialog: false });
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
      (data) => `${data.period} mois`,
      (data) => `${data.scope == "INSUREE" ? "Assuré" : "Souscripteur"}`,
      (data) => `${formatDateFromISO(modulesManager, intl, data.createdAt)}`,
      (data) => (
        <Tooltip
          title={formatMessage(intl, "policyHolder", "editButton.tooltip")}
        >
          <IconButton onClick={(e) => onDoubleClick(data)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      ),
      (data) => (
        <Tooltip
          title={formatMessage(intl, "policyHolder", "deleteButton.tooltip")}
        >
          <IconButton onClick={() => {
            console.log("....Delete clicked", data);
            this.setState({ toDelete: data, openDeleteDialog: true });
          }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    ];

    return result;
  };

  isDeletedFilterEnabled = (policyHolder) => policyHolder.isDeleted;

  isRowDisabled = (_, policyHolder) =>
    this.state.deleted.includes(policyHolder.id) &&
    !this.isDeletedFilterEnabled(policyHolder);

  isOnDoubleClickEnabled = (policyHolder) =>
    !this.state.deleted.includes(policyHolder.id) &&
    !this.isDeletedFilterEnabled(policyHolder);

  sorts = () => {
    return [];
  };

  defaultFilters = () => {
    return {};
  };

  render() {
    const {
      intl,

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
        <AlertSimpleDialogDelete
          title="Supprimer cet item de la liste"
          open={this.state.openDeleteDialog}
          handleClose={this.handleCloseDialog}
          onConfirm={this.onConfirmDelete}
          toDelete={this.state.toDelete}
          message={
            "La suppression des données ne signifie pas leur effacement de la base de données openIMIS. La donnée sera seulement désactivée de la liste consultée."
          }
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
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
