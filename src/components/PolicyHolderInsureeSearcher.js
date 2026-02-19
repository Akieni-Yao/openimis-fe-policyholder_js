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
  Contributions,
  withHistory,
  historyPush,
} from "@openimis/fe-core";
import PolicyHolderInsureeFilter from "./PolicyHolderInsureeFilter";
import {
  fetchPolicyHolderInsurees,
  deletePolicyHolderInsuree,
  printReportInsuree,
} from "../actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import UpdatePolicyHolderInsureeDialog from "../dialogs/UpdatePolicyHolderInsureeDialog";
import {
  IconButton,
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
} from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import DeleteIcon from "@material-ui/icons/Delete";
import { FormattedMessage } from "@openimis/fe-core";
import {
  ZERO,
  MAX_CLIENTMUTATIONLABEL_LENGTH,
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  RIGHT_POLICYHOLDERINSUREE_UPDATE,
  RIGHT_POLICYHOLDERINSUREE_DELETE,
  RIGHT_POLICYHOLDERINSUREE_REPLACE,
  POLICYHOLDERINSUREE_CALCULATION_CONTRIBUTION_KEY,
  POLICYHOLDERINSUREE_CLASSNAME,
  RIGHT_PORTALPOLICYHOLDERINSUREE_REPLACE,
  RIGHT_PORTALPOLICYHOLDERINSUREE_UPDATE,
  RIGHT_PORTALPOLICYHOLDERINSUREE_DELETE,
  INSUREE_STATUS,
} from "../constants";
import PolicyHolderContributionPlanBundlePicker from "../pickers/PolicyHolderContributionPlanBundlePicker";
import PolicyHolderInsureePicker from "../pickers/PolicyHolderInsureePicker";
import PrintIcon from "@material-ui/icons/Print";

const DEFAULT_ORDER_BY = "insuree";

class PolicyHolderInsureeSearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toDelete: null,
      deleted: [],
      queryParams: null,
      snackbarOpen: false,
      snackbarMessage: "",
      receiptValidationError: null,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.insureeCheck &&
      prevProps.insureeCheck !== this.props.insureeCheck
    ) {
      this.props.fetchPolicyHolderInsurees(
        this.props.modulesManager,
        this.state.queryParams
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
      prevProps.reset !== this.props.reset ||
      prevProps.loading !== this.props.loading
    ) {
      this.refetch();
    }
  }
  fetch = (params) =>
    this.props.fetchPolicyHolderInsurees(this.props.modulesManager, params);

  refetch = () => this.fetch(this.state.queryParams);

  filtersToQueryParams = (state) => {
    let params = Object.keys(state.filters)
      .filter((f) => !!state.filters[f]["filter"])
      .map((f) => state.filters[f]["filter"]);
    if (!state.beforeCursor && !state.afterCursor) {
      params.push(`first: ${state.pageSize}`);
    }
    if (!state.filters.hasOwnProperty("isDeleted")) {
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
  };

  headers = () => {
    const { rights } = this.props;
    let result = [
      "policyHolder.name",
      "policyHolder.contributionPlanBundle",
      "policyHolder.calculation",
      "Insuree.employee_number",
      "policyHolder.dateValidFrom",
      "policyHolder.dateValidTo",
      "policyHolder.print",
    ];
    if (
      rights.includes(RIGHT_POLICYHOLDERINSUREE_REPLACE) ||
      rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_REPLACE)
    ) {
      result.push("policyHolder.replace");
    }
    if (
      rights.includes(RIGHT_POLICYHOLDERINSUREE_UPDATE) ||
      rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_UPDATE)
    ) {
      result.push("policyHolder.edit");
    }
    if (
      rights.includes(RIGHT_POLICYHOLDERINSUREE_DELETE) ||
      rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_DELETE)
    ) {
      result.push("policyHolder.delete");
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
  };

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false });
  };

  validateMandatoryFieldsForPreEnrollment = (insuree) => {
    const missingFields = [];
    const fm = (key, module = "insuree") =>
      formatMessage(this.props.intl, module, key);

    if (!insuree?.lastName) missingFields.push(fm("lastName"));
    if (!insuree?.otherNames) missingFields.push(fm("otherNames"));
    if (!insuree?.dob) missingFields.push(fm("Insuree.dob"));
    if (!insuree?.gender || !insuree?.gender.code)
      missingFields.push(fm("Insuree.gender"));
    if (!insuree?.marital) missingFields.push(fm("InsureeMaritalStatus"));
    if (!insuree?.phone) missingFields.push(fm("Insuree.phone"));

    const jsonExt = insuree?.jsonExt
      ? typeof insuree.jsonExt === "string"
        ? JSON.parse(insuree.jsonExt)
        : insuree.jsonExt
      : {};
    const location = jsonExt?.insureelocations;
    if (!location?.parent?.name) missingFields.push(fm("Department"));
    if (!location?.parent?.parent?.name)
      missingFields.push(
        formatMessage(this.props.intl, "location", "Location1Picker.label")
      );
    if (!location?.parent?.parent?.parent?.name)
      missingFields.push(
        formatMessage(this.props.intl, "location", "Location2Picker.label")
      );
    if (!location?.name)
      missingFields.push(
        formatMessage(this.props.intl, "location", "Location3Picker.label")
      );

    return missingFields;
  };

  cancel = () => {
    this.setState({
      receiptValidationError: null,
    });
  };

  printReport = async (edited) => {
    const insuree = edited?.insuree;

    if (!insuree?.camuNumber) {
      const missingFields =
        this.validateMandatoryFieldsForPreEnrollment(insuree);
      if (missingFields.length > 0) {
        const errorMessage = formatMessageWithValues(
          this.props.intl,
          "insuree",
          "receiptValidationError",
          {
            fields: missingFields.join(", "),
          }
        );
        this.setState({ receiptValidationError: errorMessage });
        return;
      }
    }

    const data = await this.props.printReportInsuree(
      this.props.modulesManager,
      edited
    );

    const response = data?.payload?.data?.sentNotification;

    if (response?.success) {
      const base64Data = response.data;
      const contentType = "pdf";
      if (base64Data) {
        this.displayPrintWindow(base64Data, contentType);
      }
    } else {
      this.setState({
        snackbarOpen: true,
        snackbarMessage: this.props.intl.formatMessage({
          id: "policyHolder.policyHolderInsuree.print.error",
        }),
      });
    }
  };
  itemFormatters = () => {
    const { intl, modulesManager, rights, policyHolder, onSave } = this.props;
    let result = [
      (policyHolderInsuree) =>
        !!policyHolderInsuree.insuree
          ? `${policyHolderInsuree.insuree.lastName}-${policyHolderInsuree.insuree.otherNames}`
          : // policyHolderInsuree.insuree.lastName + "-" + policyHolderInsuree.insuree.otherNames
            // Comment for perform issue
            // ? <PolicyHolderInsureePicker
            //     value={policyHolderInsuree.insuree}
            //     withLabel={false}
            //     policyHolderId={decodeId(policyHolder.id)}
            //     readOnly />
            "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree.contributionPlanBundle
          ? `${policyHolderInsuree.contributionPlanBundle?.code} - ${policyHolderInsuree.contributionPlanBundle?.name}`
          : // Comment for perform issue
            //  <PolicyHolderContributionPlanBundlePicker
            //     value={policyHolderInsuree.contributionPlanBundle}
            //     withLabel={false}
            //     policyHolderId={decodeId(policyHolder.id)}
            //     readOnly />
            "",
      (policyHolderInsuree) => {
        /**
         * Mapping @see lastPolicy property into @see policy property is required
         * because property names of @see PolicyHolderInsuree object on frontend
         * have to match property names of a corresponding object on backend
         */
        const { lastPolicy, ...others } = policyHolderInsuree;
        const policy = !!lastPolicy ? lastPolicy : {};
        const jsonData = JSON.parse(policyHolderInsuree.jsonExt);
        const income = jsonData?.calculation_rule?.income;
        return !!policyHolderInsuree.jsonExt
          ? income
          : // Comment for perform issue
            //  <Contributions
            //     contributionKey={POLICYHOLDERINSUREE_CALCULATION_CONTRIBUTION_KEY}
            //     intl={this.props.intl}
            //     className={POLICYHOLDERINSUREE_CLASSNAME}
            //     entity={{ policy, ...others }}
            //     value={policyHolderInsuree.jsonExt}
            //     readOnly />
            "";
      },
      (policyHolderInsuree) =>
        policyHolderInsuree?.employerNumber
          ? policyHolderInsuree?.employerNumber
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree.dateValidFrom
          ? formatDateFromISO(
              modulesManager,
              intl,
              policyHolderInsuree.dateValidFrom
            )
          : "",
      (policyHolderInsuree) =>
        !!policyHolderInsuree.dateValidTo
          ? formatDateFromISO(
              modulesManager,
              intl,
              policyHolderInsuree.dateValidTo
            )
          : "",
    ];
    result.push((policyHolderInsuree) =>
      !!policyHolderInsuree ? (
        <IconButton
          disabled={
            !this.props.isActionEnabled ||
            (policyHolderInsuree?.insuree?.status == INSUREE_STATUS
              ? false
              : true)
          }
          onClick={(e) => this.printReport(policyHolderInsuree)}
        >
          <PrintIcon />
        </IconButton>
      ) : (
        ""
      )
    );
    if (
      rights.includes(RIGHT_POLICYHOLDERINSUREE_REPLACE) ||
      rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_REPLACE)
    ) {
      result.push(
        (policyHolderInsuree) =>
          !this.isDeletedFilterEnabled(policyHolderInsuree) && (
            <UpdatePolicyHolderInsureeDialog
              policyHolder={policyHolder}
              policyHolderInsuree={policyHolderInsuree}
              onSave={onSave}
              disabled={
                !this.props.isActionEnabled ||
                this.state.deleted.includes(policyHolderInsuree.id) ||
                this.isReplaced(policyHolderInsuree)
              }
              isReplacing={true}
            />
          )
      );
    }
    if (
      rights.includes(RIGHT_POLICYHOLDERINSUREE_UPDATE) ||
      rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_UPDATE)
    ) {
      result.push(
        (policyHolderInsuree) =>
          !this.isDeletedFilterEnabled(policyHolderInsuree) && (
            <UpdatePolicyHolderInsureeDialog
              policyHolder={policyHolder}
              policyHolderInsuree={policyHolderInsuree}
              onSave={onSave}
              disabled={
                !this.props.isActionEnabled ||
                this.state.deleted.includes(policyHolderInsuree.id) ||
                this.isReplaced(policyHolderInsuree)
              }
            />
          )
      );
    }
    if (
      rights.includes(RIGHT_POLICYHOLDERINSUREE_DELETE) ||
      rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_DELETE)
    ) {
      result.push(
        (policyHolderInsuree) =>
          !this.isDeletedFilterEnabled(policyHolderInsuree) &&
          withTooltip(
            <div>
              <IconButton
                onClick={() => this.onDelete(policyHolderInsuree)}
                disabled={
                  !this.props.isActionEnabled ||
                  this.state.deleted.includes(policyHolderInsuree.id)
                }
              >
                <DeleteIcon />
              </IconButton>
            </div>,
            formatMessage(
              this.props.intl,
              "policyHolder",
              "deleteButton.tooltip"
            )
          )
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

  onDoubleClick = (policyHolderInsuree) => {
    const { modulesManager, history } = this.props;
    if (policyHolderInsuree?.insuree?.uuid) {
      historyPush(
        modulesManager,
        history,
        "insuree.route.insuree",
        [policyHolderInsuree.insuree.uuid]
      );
    }
  };

  sorts = () => {
    return [
      ["insuree", true],
      ["contributionPlanBundle", true],
      null,
      ["dateValidFrom", true],
      ["dateValidTo", true],
    ];
  };

  defaultFilters = () => {
    return {
      policyHolder_Id: {
        value: decodeId(this.props.policyHolder.id),
        filter: `policyHolder_Id: "${decodeId(this.props.policyHolder.id)}"`,
      },
    };
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
    } = this.props;
    return (
      <Fragment>
        <Searcher
          module="policyHolder"
          FilterPane={PolicyHolderInsureeFilter}
          fetch={this.fetch}
          items={policyHolderInsurees}
          itemsPageInfo={policyHolderInsureesPageInfo}
          fetchingItems={fetchingPolicyHolderInsurees}
          fetchedItems={fetchedPolicyHolderInsurees}
          errorItems={errorPolicyHolderInsurees}
          tableTitle={formatMessageWithValues(
            intl,
            "policyHolder",
            "policyHolderInsuree.searcher.title",
            { policyHolderInsureesTotalCount }
          )}
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          filtersToQueryParams={this.filtersToQueryParams}
          sorts={this.sorts}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          defaultPageSize={DEFAULT_PAGE_SIZE}
          defaultOrderBy={DEFAULT_ORDER_BY}
          rowLocked={this.isRowDisabled}
          rowDisabled={this.isRowDisabled}
          defaultFilters={this.defaultFilters()}
          onDoubleClick={(policyHolderInsuree) => this.onDoubleClick(policyHolderInsuree)}
        />
        <Snackbar
          open={this.state.snackbarOpen}
          autoHideDuration={6000}
          onClose={this.handleSnackbarClose}
        >
          <Alert onClose={this.handleSnackbarClose} severity="error">
            {this.state.snackbarMessage}
          </Alert>
        </Snackbar>
        {this.state.receiptValidationError && (
          <Dialog
            open={!!this.state.receiptValidationError}
            onClose={this.cancel}
            maxWidth="md"
          >
            <DialogContent
              style={{
                backgroundColor: "#FFFFFF",
                width: 600,
                padding: "20px",
              }}
            >
              <DialogContentText
                style={{
                  font: "normal normal medium 20px/22px Roboto",
                  color: "#d32f2f",
                  margin: 0,
                }}
              >
                {this.state.receiptValidationError}
              </DialogContentText>
            </DialogContent>
            <DialogActions
              style={{ backgroundColor: "#FFFFFF", padding: "10px 20px" }}
            >
              <Button
                onClick={this.cancel}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #999999",
                  color: "#999999",
                  borderRadius: "4px",
                }}
              >
                <FormattedMessage module="core" id="ok" />
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  fetchingPolicyHolderInsurees: state.policyHolder.fetchingPolicyHolderInsurees,
  fetchedPolicyHolderInsurees: state.policyHolder.fetchedPolicyHolderInsurees,
  errorPolicyHolderInsurees: state.policyHolder.errorPolicyHolderInsurees,
  policyHolderInsurees: state.policyHolder.policyHolderInsurees,
  policyHolderInsureesPageInfo: state.policyHolder.policyHolderInsureesPageInfo,
  policyHolderInsureesTotalCount:
    state.policyHolder.policyHolderInsureesTotalCount,
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchPolicyHolderInsurees,
      deletePolicyHolderInsuree,
      coreConfirm,
      printReportInsuree,
    },
    dispatch
  );
};

const ConnectedPolicyHolderInsureeSearcher = withHistory(
  withModulesManager(
    injectIntl(
      connect(mapStateToProps, mapDispatchToProps)(PolicyHolderInsureeSearcher)
    )
  )
);

ConnectedPolicyHolderInsureeSearcher.defaultProps = {
  isActionEnabled: true,
};

export default ConnectedPolicyHolderInsureeSearcher;
