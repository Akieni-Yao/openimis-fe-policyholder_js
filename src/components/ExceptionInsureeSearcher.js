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
  deletePolicyHolderInsuree,
  printReportInsuree,
  fetchInsureeException
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
import { Box, Typography, Grid,IconButton, Tooltip } from "@material-ui/core";
import CreateExceptionDialog from "../dialogs/CreateExceptionDialog";
import HelpIcon from "@material-ui/icons/Help";
const DEFAULT_ORDER_BY = "insuree";

class ExceptionInsureeSearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toDelete: null,
      deleted: [],
      queryParams: null,
      open: false,
      policyHolderInsuree: {},
      jsonExtValid: true,
      jsonData:{}
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.insureeCheck &&
      prevProps.insureeCheck !== this.props.insureeCheck
    ) {
      this.props.fetchInsureeException(
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
    this.props.fetchInsureeException(this.props.modulesManager, params);

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
      "exception.camuNo",
      "exception.firstName",
      "exception.lastName",
      "exception.bithDate",
      "exception.phone",
      "exception.date",
      "exception.enddate",
      "exception.city",
      // "exception.exceptionStatus",
      //   "policyHolder.dateValidTo",
      //   "policyHolder.print",
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
    const {
      intl,
      modulesManager,
      rights,
      policyHolder,
      onSave,
      pendingApprovalUser,
    } = this.props;
    let result = [
      (policyHolderInsuree) =>
        !!policyHolderInsuree.insuree
          ? policyHolderInsuree.insuree.camuNumber
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree.insuree
          ? policyHolderInsuree.insuree.otherNames
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree.insuree
          ? policyHolderInsuree.insuree.lastName
          : "",
      (policyHolderInsuree) =>
        policyHolderInsuree?.insuree
          ? policyHolderInsuree?.insuree.dob
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree.insuree
          ? policyHolderInsuree.insuree.phone
          : "",
      // (policyHolderInsuree) =>
      //   policyHolderInsuree?.employerNumber
      //     ? policyHolderInsuree?.employerNumber
      //     : "",
      // (policyHolderInsuree) =>
      // !!policyHolderInsuree.status ? policyHolderInsuree.status : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree.startDate
          ? formatDateFromISO(
            modulesManager,
            intl,
            policyHolderInsuree.startDate
          )
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree.endDate
          ? formatDateFromISO(
            modulesManager,
            intl,
            policyHolderInsuree.endDate
          )
          : "",
    ];

    result.push((policyHolderInsuree) => {
      try {
        const insureeLocations = JSON.parse(policyHolderInsuree.insuree.jsonExt)
          .insureelocations;
        const parentData = insureeLocations.parent;
        return `${parentData.name}`;
      } catch (error) {
        console.error("Error parsing JSON or extracting parent data:", error);
        return "N/A";
      }
    });
    // if (!pendingApprovalUser) {
    //   result.push((policyHolderInsuree) =>
    //     !!policyHolderInsuree.status ? policyHolderInsuree.status : ""
    //   );
    // }
    if (!pendingApprovalUser) {
      result.push((policyHolderInsuree) => {
        let color = "inherit"; // Default color
        if (policyHolderInsuree.status === "APPROVED") {
          color = "green"; // Green color for APPROVED status
        } else if (policyHolderInsuree.status === "REJECTED") {
          color = "red"; // Red color for REJECTED status
        }else if (policyHolderInsuree.status === "PENDING") {
          color = "orange"; // Red color for REJECTED status
        }
        return (
          <Fragment>
          <span style={{ color, fontWeight: "bold" }}>
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
        // <span style={{ color: policyHolderInsuree.status === "APPROVED" ? "green" : policyHolderInsuree.status === "REJETCED" ? "red" : "black" }}>{!!policyHolderInsuree.status ? policyHolderInsuree.status : ""}</span>
        // !!policyHolderInsuree.status ? policyHolderInsuree.status : ""
      );
    }
    return result;
  };

  // onDelete = (policyHolderInsuree) => {
  //   const { intl, coreConfirm, deletePolicyHolderInsuree, policyHolder } =
  //     this.props;
  //   let confirm = () =>
  //     coreConfirm(
  //       formatMessageWithValues(
  //         intl,
  //         "policyHolder",
  //         "policyHolderInsuree.dialog.delete.title",
  //         {
  //           otherNames: policyHolderInsuree.insuree.otherNames,
  //           lastName: policyHolderInsuree.insuree.lastName,
  //         }
  //       ),
  //       formatMessage(intl, "policyHolder", "dialog.delete.message")
  //     );
  //   let confirmedAction = () => {
  //     deletePolicyHolderInsuree(
  //       policyHolderInsuree,
  //       formatMessageWithValues(
  //         intl,
  //         "policyHolder",
  //         "DeletePolicyHolderInsuree.mutationLabel",
  //         {
  //           code: policyHolder.code,
  //           tradeName: policyHolder.tradeName,
  //         }
  //       ).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
  //     );
  //     this.setState({ toDelete: policyHolderInsuree.id });
  //   };
  //   this.setState({ confirmedAction }, confirm);
  // };

  // isReplaced = (policyHolderInsuree) => !!policyHolderInsuree.replacementUuid;

  // isDeletedFilterEnabled = (policyHolderInsuree) =>
  //   policyHolderInsuree.isDeleted;

  // isRowDisabled = (_, policyHolderInsuree) =>
  //   this.state.deleted.includes(policyHolderInsuree.id) &&
  //   !this.isDeletedFilterEnabled(policyHolderInsuree);

  // sorts = () => {
  //   return [
  //     ["insuree", true],
  //     ["contributionPlanBundle", true],
  //     null,
  //     ["dateValidFrom", true],
  //     ["dateValidTo", true],
  //   ];
  // };

  // defaultFilters = () => {
  //   return {
  //     policyHolder_Id: {
  //       value: decodeId(this.props.policyHolder.id),
  //       filter: `policyHolder_Id: "${decodeId(this.props.policyHolder.id)}"`,
  //     },
  //   };
  // };

  isBulkActionOnSelectedEnabled = (selection) =>
    !!selection && selection.length === 0;

  createExceptionDialogOpen = () => {
    this.setState((_, props) => ({
      open: true,
      policyHolderInsuree: {
        policyHolder: props.policyHolder,
        policy: {},
      },
      jsonExtValid: true,
    }));
  };

  handleClose = () => {
    this.setState({ open: false, policyHolderInsuree: {} });
    this.setState({ open: false, jsonData: {} });
  
  };


  onDoubleClick = (policyHolder, newTab = false) => {
    // console.log("policyHolder",policyHolder)
    // debugger;
    const { rights, modulesManager, history } = this.props;
    historyPush(
      modulesManager,
      history,
      "policyHolder.route.exception",
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
      pendingApprovalUser,
    } = this.props;
    console.log("policyHolderInsurees", policyHolderInsurees)
    let actions = [];
    if (!pendingApprovalUser) {
      actions.push({
        label: "exception.addException",
        enabled: this.isBulkActionOnSelectedEnabled,
        action: this.createExceptionDialogOpen,
      });
    }
    return (
      <Fragment>
        <Searcher
          module="policyHolder"
          FilterPane={ExceptionInsureeFilter}
          fetch={this.fetch}
          items={policyHolderInsurees}
          itemsPageInfo={policyHolderInsureesPageInfo}
          fetchingItems={fetchingPolicyHolderInsurees}
          fetchedItems={fetchedPolicyHolderInsurees}
          errorItems={errorPolicyHolderInsurees}
          tableTitle={formatMessageWithValues(
            intl,
            "policyHolder",
            "exceptionInsuree.searcher.title",
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
          onDoubleClick={(insuree) =>
            pendingApprovalUser && this.onDoubleClick(insuree)
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
                id="exceptionInsuree.noData"
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
          <Grid item>
            <CreateExceptionDialog
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
  fetchingPolicyHolderInsurees: state.policyHolder.fetchingExceptionInsurees,
  fetchedPolicyHolderInsurees: state.policyHolder.fetchedExceptionInsurees,
  errorPolicyHolderInsurees: state.policyHolder.errorExceptionInsurees,
  policyHolderInsurees: state.policyHolder.ExceptionInsurees,
  policyHolderInsureesPageInfo: state.policyHolder.ExceptionInsureesPageInfo,
  policyHolderInsureesTotalCount: state.policyHolder.ExceptionInsureesTotalCount,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchPolicyHolderInsurees,
      deletePolicyHolderInsuree,
      coreConfirm,
      printReportInsuree,
      fetchInsureeException
    },
    dispatch
  );
};

export default withModulesManager(withHistory(
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(ExceptionInsureeSearcher)
  ))
);
