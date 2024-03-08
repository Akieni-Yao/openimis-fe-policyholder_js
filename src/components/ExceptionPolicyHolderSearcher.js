import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  formatDateFromISO,
  Searcher,
  withTooltip,
  coreConfirm,
  decodeId,
  FormattedMessage,
  historyPush,
  withHistory
} from "@openimis/fe-core";
import {
  fetchPolicyHolderInsurees,
  fetchPolicyHolderException,
  deletePolicyHolderInsuree,
  printReportInsuree,
} from "../actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  ZERO,
  MAX_CLIENTMUTATIONLABEL_LENGTH,
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
} from "../constants";
import ExceptionInsureeFilter from "./ExceptionInsureeFilter";
import { Box, Typography, Grid, IconButton, Tooltip } from "@material-ui/core";
import CreateExceptionDialog from "../dialogs/CreateExceptionDialog";
import ExceptionPolicyHolderFilter from "./ExceptionPolicyHolderFilter";
import CreateExceptionPolicyHolderDialog from "../dialogs/CreateExceptionPolicyHolderDialog";
import HelpIcon from "@material-ui/icons/Help";

const DEFAULT_ORDER_BY = "insuree";
const styles = (theme) => ({
  customArrow: {
    color: "#eeeaea",
  },
  tooltip: {
    maxWidth: 1000,
    width: "fit-content"
    // width: "auto",
    // color: "white",
    // backgroundColor: "#eeeaea",
  },
});
class ExceptionPolicyHolderSearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toDelete: null,
      deleted: [],
      queryParams: null,
      open: false,
      policyHolderInsuree: {},
      jsonExtValid: true,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.insureeCheck &&
      prevProps.insureeCheck !== this.props.insureeCheck
    ) {
      this.props.fetchPolicyHolderException(
        this.props.modulesManager,
        // this.state.queryParams
        null
      );
    }

    if (
      prevProps.confirmed !== this.props.confirmed &&
      !!this.props.confirmed &&
      !!this.state.confirmedAction
    ) {
      this.state.confirmedAction();
    } else if (prevState.toDelete !== this.state.toDelete) {
      this.setState((state) => ({
        deleted: state.deleted.concat(state.toDelete),
      }));
    } else if (
      prevState.deleted !== this.state.deleted ||
      prevProps.reset !== this.props.reset
    ) {
      this.refetch();
    }
  }
  fetch = (params) =>
    this.props.fetchPolicyHolderException(this.props.modulesManager, params);

  refetch = () => this.fetch(this.state.queryParams);

  filtersToQueryParams = (state) => {
    let params = Object.keys(state.filters)
      .filter((f) => !!state.filters[f]["filter"])
      .map((f) => state.filters[f]["filter"]);
    if (!state.beforeCursor && !state.afterCursor) {
      params.push(`first: ${state.pageSize}`);
    }
    // if (!state.filters.hasOwnProperty("isDeleted")) {
    //   params.push("isDeleted: false");
    // }
    if (this.props.pendingApprovalUser && !state.filters.hasOwnProperty("status")) {
      params.push("status: \"PENDING\"");
    }
    if (!!state.afterCursor) {
      params.push(`after: "${state.afterCursor}"`);
      params.push(`first: ${state.pageSize}`);
    }
    if (!!state.beforeCursor) {
      params.push(`before: "${state.beforeCursor}"`);
      params.push(`last: ${state.pageSize}`);
    }
    // if (!!state.orderBy) {
    //   params.push(`orderBy: ["${state.orderBy}"]`);
    // }
    this.setState({ queryParams: params });
    return params;
  };

  headers = () => {
    const { rights, pendingApprovalUser } = this.props;
    let result = [
      "exception.date",
      "policyHolder.exception.camuCode",
      "policyHolder.tradeName",
      "exception.city",
      "exception.exceptionType",
      "exception.month"
      // "exception.exceptionStatus",
    ];
    if (!pendingApprovalUser) {
      result.push("exception.exceptionStatus");
    }
    return result;
  };
  displayPrintWindow = (base64Data, contentType) => {
    const printWindow = window.open(
      "",
      "Print Window",
      "width=600, height=400"
    );
    printWindow.document.open();

    if (contentType === "pdf") {
      // printWindow.print(`<embed type="application/pdf" width="100%" height="100%" src="data:application/pdf;base64,${base64Data}" />`);
      printWindow.document.write(
        `<embed type="application/pdf" width="100%" height="100%" src="data:application/pdf;base64,${base64Data}" />`
      );
    } else {
      printWindow.document.write(
        `<img src="data:image/png;base64,${base64Data}" />`
      );
    }

    printWindow.document.close();
    // printWindow.print();
  };
  printReport = async (edited) => {
    const data = await this.props.printReportInsuree(
      this.props.modulesManager,
      edited
    );

    const base64Data = data?.payload?.data?.sentNotification?.data;
    const contentType = "pdf";
    if (base64Data) {
      this.displayPrintWindow(base64Data, contentType);
    }
  };
  rejectedCommentsTooltip = (rejectComment) => {
    return (
      formatMessage(this.props.intl, "policyHolder", `policyHolder.rejectComment.${rejectComment.rejectionReason}`)
    );
  };
  itemFormatters = () => {
    const { intl, modulesManager, rights, policyHolder, onSave, pendingApprovalUser } = this.props;
    let result = [
      (policyHolderInsuree) =>
        !!policyHolderInsuree.createdTime
          ? formatDateFromISO(
            modulesManager,
            intl,
            policyHolderInsuree.createdTime
          )
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree?.policyHolder?.code
          ? policyHolderInsuree?.policyHolder?.code
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree?.policyHolder?.tradeName
          ? policyHolderInsuree?.policyHolder?.tradeName
          : "",
      (policyHolderInsuree) =>
        policyHolderInsuree?.policyHolder?.locations?.parent?.name
          ? policyHolderInsuree?.policyHolder?.locations?.parent?.name
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree?.exceptionReason
          ? formatMessage(this.props.intl, "policyHolder.exceptionReason", policyHolderInsuree?.exceptionReason)
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree?.month
          ? formatMessage(this.props.intl, "policyHolder.exceptionReason", policyHolderInsuree?.month)
          : "",
      // (policyHolderInsuree) => {
      //   // !!policyHolderInsuree.status ? policyHolderInsuree.status : "",
      //   let color = "inherit";
      //   if (policyHolderInsuree.status === "APPROVED") {
      //     color = "green";
      //   } else if (policyHolderInsuree.status === "REJECTED") {
      //     color = "red"; 
      //   } else if (policyHolderInsuree.status === "PENDING") {
      //     color = "orange"; 
      //   }
      //   return (
      //     <span style={{ color, fontWeight: "bold" }}>
      //       {policyHolderInsuree.status}
      //     </span>
      //   );
      // }
    ];
    if (!pendingApprovalUser) {
      result.push((policyHolderInsuree) => {
        let color = "inherit"; // Default color
        if (policyHolderInsuree.status === "APPROVED") {
          color = "green"; // Green color for APPROVED status
        } else if (policyHolderInsuree.status === "REJECTED") {
          color = "red"; // Red color for REJECTED status
        } else if (policyHolderInsuree.status === "PENDING") {
          color = "orange"; // Red color for REJECTED status
        }
        return (
          <Fragment>
            <span style={{ color, fontWeight: "bold" }}>
              {/* {policyHolderInsuree.status} */}
              {formatMessage(this.props.intl, "policyHolder", `policyHolder.Exception Status.${policyHolderInsuree.status}`)}

            </span>
            {policyHolderInsuree.status === "REJECTED" && policyHolderInsuree.rejectionReason && (
              <Tooltip
                placement="right"
                arrow
                // classes={{
                //   tooltip: this.props.classes.tooltip,
                //   arrow: this.props.classes.customArrow
                // }}
                title={this.rejectedCommentsTooltip(policyHolderInsuree)}
              >
                <IconButton>
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            )}
          </Fragment>
          // <span style={{ color,fontWeight:"bold" }}>
          //   {policyHolderInsuree.status}
          // </span>

        );
      },
      );
    }
    return result;
  };

  onDelete = (policyHolderInsuree) => {
    const { intl, coreConfirm, deletePolicyHolderInsuree, policyHolder } =
      this.props;
    let confirm = () =>
      coreConfirm(
        formatMessageWithValues(
          intl,
          "policyHolder",
          "policyHolderInsuree.dialog.delete.title",
          {
            otherNames: policyHolderInsuree.insuree.otherNames,
            lastName: policyHolderInsuree.insuree.lastName,
          }
        ),
        formatMessage(intl, "policyHolder", "dialog.delete.message")
      );
    let confirmedAction = () => {
      deletePolicyHolderInsuree(
        policyHolderInsuree,
        formatMessageWithValues(
          intl,
          "policyHolder",
          "DeletePolicyHolderInsuree.mutationLabel",
          {
            code: policyHolder.code,
            tradeName: policyHolder.tradeName,
          }
        ).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
      );
      this.setState({ toDelete: policyHolderInsuree.id });
    };
    this.setState({ confirmedAction }, confirm);
  };

  isReplaced = (policyHolderInsuree) => !!policyHolderInsuree.replacementUuid;

  isDeletedFilterEnabled = (policyHolderInsuree) =>
    policyHolderInsuree.isDeleted;

  isRowDisabled = (_, policyHolderInsuree) =>
    this.state.deleted.includes(policyHolderInsuree.id) &&
    !this.isDeletedFilterEnabled(policyHolderInsuree);

  // sorts = () => {
  //   return [
  //     ["insuree", true],
  //     ["contributionPlanBundle", true],
  //     null,
  //     ["dateValidFrom", true],
  //     ["dateValidTo", true],
  //   ];
  // };

  defaultFilters = () => {
    return {
      policyHolder_Id: {
        value: decodeId(this.props.policyHolder.id),
        filter: `policyHolder_Id: "${decodeId(this.props.policyHolder.id)}"`,
      },
    };
  };

  isBulkActionOnSelectedEnabled = (selection) =>
    !!selection && selection.length === 0;

  CreateExceptionPolicyHolderDialog = () => {
    this.setState((_, props) => ({
      open: true,
      policyHolderInsuree: {
        policyHolder: props.policyHolder,
        policy: {},
      },
      jsonExtValid: true,
    }));
    // console.log("hello");
  };

  handleClose = () => {
    this.setState({ open: false, policyHolderInsuree: {} });
  };

  onDoubleClick = (policyHolder, newTab = false) => {
    const { rights, modulesManager, history } = this.props;
    historyPush(
      modulesManager,
      history,
      "policyHolder.route.exception.policyholder",
      [policyHolder.id],
      newTab
    );
  };

  render() {
    const {
      intl,
      fetchingPolicyHolderInsurees,
      fetchedPolicyHolderInsurees,
      errorPolicyHolderInsurees,
      policyHolderInsurees,
      policyHolderInsureesPageInfo,
      policyHolderInsureesTotalCount,
      policyHolder,
      rights,
      onSave,
      pendingApprovalUser
    } = this.props;
    // console.log("policyHolderInsurees", policyHolderInsurees)
    let actions = [];
    if (!pendingApprovalUser) {
      actions.push({
        label: "exception.addException",
        enabled: this.isBulkActionOnSelectedEnabled,
        action: this.CreateExceptionPolicyHolderDialog,
      });
    }
    return (
      <Fragment>
        <Searcher
          module="policyHolder"
          FilterPane={ExceptionPolicyHolderFilter}
          fetch={this.fetch}
          items={policyHolderInsurees}
          itemsPageInfo={policyHolderInsureesPageInfo}
          fetchingItems={fetchingPolicyHolderInsurees}
          fetchedItems={fetchedPolicyHolderInsurees}
          errorItems={errorPolicyHolderInsurees}
          tableTitle={formatMessageWithValues(
            intl,
            "policyHolder",
            "policyHolderException.searcher.title",
            { policyHolderInsureesTotalCount }
          )}
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          filtersToQueryParams={this.filtersToQueryParams}
          // sorts={this.sorts}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          defaultPageSize={DEFAULT_PAGE_SIZE}
          defaultOrderBy={DEFAULT_ORDER_BY}
          rowLocked={this.isRowDisabled}
          rowDisabled={this.isRowDisabled}
          //   defaultFilters={this.defaultFilters()}
          actions={actions}
          onDoubleClick={(policyHolder) =>
            pendingApprovalUser && this.onDoubleClick(policyHolder)
          }
        />
        {policyHolderInsurees.length == 0 && (
          <Box marginTop={2}>
            <Typography
              align="center"
              fontWeight={600}
              color="error"
              variant="h6"
            >
              <FormattedMessage
                module="policyHolder"
                id="exceptionPolicyHolder.noData"
              />
            </Typography>
          </Box>
        )}
        {/* {(rights.includes(RIGHT_POLICYHOLDERINSUREE_CREATE) ||
              rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_CREATE)) && ( */}
        <Grid
          container
          justifyContent="flex-end"
          alignItems="center"
          spacing={1}
        >
          {/* <Grid item>
            <Typography>
              <FormattedMessage
                module="policyHolder"
                id="policyHolderInsuree.createPolicyHolderInsuree"
              />
            </Typography>
          </Grid> */}
          <Grid item>
            <CreateExceptionPolicyHolderDialog
              policyHolder={policyHolder}
              onSave={onSave}
              open={this.state.open}
              policyHolderInsuree={this.state.policyHolderInsuree}
              handleClose={this.handleClose}
            />
          </Grid>
        </Grid>
        {/* )} */}
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  fetchingPolicyHolderInsurees: state.policyHolder.fetchingExceptionPolicyholder,
  fetchedPolicyHolderInsurees: state.policyHolder.fetchedExceptionPolicyholder,
  errorPolicyHolderInsurees: state.policyHolder.errorExceptionPolicyholder,
  policyHolderInsurees: state.policyHolder.ExceptionPolicyholder,
  policyHolderInsureesPageInfo: state.policyHolder.ExceptionPolicyholderPageInfo,
  policyHolderInsureesTotalCount: state.policyHolder.ExceptionPolicyholderTotalCount,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchPolicyHolderInsurees,
      deletePolicyHolderInsuree,
      coreConfirm,
      printReportInsuree,
      fetchPolicyHolderException
    },
    dispatch
  );
};

export default withModulesManager(withHistory(
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(ExceptionPolicyHolderSearcher))
)
);
