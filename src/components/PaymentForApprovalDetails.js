import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { IconButton, Tooltip, Grid } from "@material-ui/core";
import TabIcon from "@material-ui/icons/Tab";
import { Delete as DeleteIcon } from "@material-ui/icons";
import PaymentFilter from "./PaymentFilter";
import {
  withModulesManager,
  formatMessageWithValues,
  formatDateFromISO,
  formatMessage,
  Searcher,
  PublishedComponent,
  formatAmount,
  journalize,
  withHistory,
  historyPush,
} from "@openimis/fe-core";
import HelpIcon from "@material-ui/icons/Help";
import { fetchPayment } from "../actions";
import { RIGHT_PAYMENT_EDIT } from "../constants";
// import DeletePaymentDialog from "./DeletePaymentDialog";

const PAYMENT_SEARCHER_CONTRIBUTION_KEY = "payment.PaymentSearcher";

class PaymentForApproverDetails extends Component {
  state = {
    deletePayment: null,
    reset: 0,
  };

  constructor(props) {
    super(props);
    this.rowsPerPageOptions = [10, 20, 50, 100];
    this.defaultPageSize = 10;
    this.locationLevels = 4;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState({ reset: this.state.reset + 1 });
    }
  }

  fetch = (prms) => {
    this.props.fetchPayment(this.props.modulesManager, prms);
  };

  rowIdentifier = (r) => r.uuid;

  filtersToQueryParams = (state) => {
    let prms = Object.keys(state.filters)
      .filter((contrib) => !!state.filters[contrib]["filter"])
      .map((contrib) => state.filters[contrib]["filter"]);
    if (!state.beforeCursor && !state.afterCursor) {
      prms.push(`first: ${state.pageSize}`);
    }
    if (!!state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
      prms.push(`first: ${state.pageSize}`);
    }
    if (!!state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
      prms.push(`last: ${state.pageSize}`);
    }
    if (!!state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    return prms;
  };

  headers = (filters) => {
    var h = [
      "Code",
      "payment.payment.receivedDate",
      "payment.payment.requestDate",
      // "payment.payment.expectedAmount",
      // "payment.payment.previousDue",
      // "payment.payment.declarationPenaltyAmount",
      // "payment.payment.paymentPenaltyAmount",
      // "payment.payment.totalAmount",
      "payment.payment.receivedAmount",
      // "payment.payment.typeOfPayment",
      // "payment.payment.receiptNo",
      "payment.payment.status",
    ];
    return h;
  };

  sorts = (filters) => {
    var results = [
      ["paymentCode", true],
      ["receivedDate", true],
      ["requestDate", true],
      // ["expectedAmount", true],
      // ["parentPaymentPending", true],
      // ["contractPenaltyAmount", true],
      // ["parentPaymentPenalty", true],
      // ["totalAmount", true],
      ["receivedAmount", true],
      // ["typeOfPayment", true],
      // ["receiptNo", true],
      ["status", true],
      "contribution.openNewTabHead",
    ];
    return results;
  };

  deletePayment = () => {
    let payment = this.state.deletePayment;
    this.setState({ deletePayment: null }, (e) => {
      //   this.props.deletePayment(
      //     this.props.modulesManager,
      //     payment,
      //     formatMessageWithValues(
      //       this.props.intl,
      //       "payment",
      //       "deletePaymentDialog.title"
      //     )
      //   );
    });
  };

  confirmDelete = (deletePayment) => {
    this.setState({ deletePayment });
  };

  deletePaymentAction = (i) =>
    !!i.validityTo || !!i.clientMutationId ? null : (
      <Tooltip
        title={formatMessage(
          this.props.intl,
          "payment",
          "deletePayment.tooltip"
        )}
      >
        <IconButton onClick={() => this.confirmDelete(i)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    );

  itemFormatters = () => {
    const { intl, modulesManager, rights, readOnly = false } = this.props;
    const formatters = [
      (p) => p.paymentCode,
      (p) => formatDateFromISO(modulesManager, intl, p.receivedDate),
      (p) => formatDateFromISO(modulesManager, intl, p.requestDate),
      // (p) => formatAmount(intl, p.expectedAmount),
      // (p) => formatAmount(intl, p.parentPendingPayment),
      // (p) => p.contractPenaltyAmount,
      // (p) => p.parentPaymentPenalty,
      // (p) => formatAmount(intl, p.totalAmount),
      (p) => formatAmount(intl, p.receivedAmount),
      // (p) => (
      //   <PublishedComponent
      //     readOnly={true}
      //     pubRef="contribution.PremiumPaymentTypePicker"
      //     withLabel={false}
      //     value={p.typeOfPayment}
      //   />
      // ),
      // (p) => p.receiptNo,
      (p) => (
        <Grid style={{ display: "flex" }}>
          <PublishedComponent
            readOnly={true}
            pubRef="payment.PaymentStatusPicker"
            withLabel={false}
            value={p.status}
            nullLabel="payment.status.none"
          />
          {p.status == -1 ? (
            <Tooltip
              placement="right"
              arrow
              //   classes={{ tooltip: this.props.classes.tooltip }}
              title={formatMessage(
                this.props.intl,
                "payment",
                `payment.rejectComment.${p.rejectedReason}`
              )}
            >
              <IconButton>
                <HelpIcon />
              </IconButton>
            </Tooltip>
          ) : null}
        </Grid>
      ),
    ];
    // if (rights.includes(RIGHT_PAYMENT_EDIT)) {
    //   formatters.push((p) => (
    //     <Tooltip title={formatMessage(intl, "payment", "openNewTab")}>
    //       <IconButton onClick={() => this.onDoubleClick(p, true)}>
    //         <TabIcon />
    //       </IconButton>
    //     </Tooltip>
    //   ));
    // }
    // if (!readOnly && rights.includes(RIGHT_PAYMENT_DELETE)) {
    //   formatters.push(this.deletePaymentAction);
    // }
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;
  rowLocked = (selection, i) => !!i.clientMutationId;

  defaultFilters = () => {
    return {
      status: {
        value: 3,
        filter: `status: 3`,
      },
    };
  };

  onDoubleClick = (p, newTab = false) => {
    historyPush(
      this.props.modulesManager,
      this.props.history,
      "payment.paymentOverview",
      [p.uuid],
      newTab
    );
  };

  render() {
    const {
      intl,
      rights,
      payments,
      paymentsPageInfo,
      fetchingPayments,
      fetchedPayment,
      errorPayments,
      filterPaneContributionsKey,
      cacheFiltersKey,
    } = this.props;
    let count = paymentsPageInfo.totalCount;
    return (
      <Fragment>
        {/* <DeletePaymentDialog
          payment={this.state.deletePayment}
          onConfirm={this.deletePayment}
          onCancel={(e) => this.setState({ deletePayment: null })}
        /> */}
        <Searcher
          module="payment"
          // cacheFiltersKey={cacheFiltersKey}
          FilterPane={PaymentFilter}
          filterPaneContributionsKey={filterPaneContributionsKey}
          items={payments}
          itemsPageInfo={paymentsPageInfo}
          fetchingItems={fetchingPayments}
          fetchedItems={fetchedPayment}
          errorItems={errorPayments}
          contributionKey={PAYMENT_SEARCHER_CONTRIBUTION_KEY}
          tableTitle={formatMessageWithValues(
            intl,
            "payment",
            "paymentSummaries",
            { count }
          )}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="-id"
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
          onDoubleClick={(c) =>
            !c.clientMutationId &&
            rights.includes(RIGHT_PAYMENT_EDIT) &&
            this.onDoubleClick(c)
          }
          reset={this.state.reset}
          defaultFilters={this.defaultFilters()}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  submittingMutation: state.payment.submittingMutation,
  mutation: state.payment.mutation,
  fetchingPayments: state.policyHolder.fetchingPayments,
  fetchedPayment: state.policyHolder.fetchedPayment,
  errorPayments: state.policyHolder.errorPayments,
  payments: state.policyHolder.payment,
  paymentsPageInfo: state.policyHolder.paymentsPageInfo,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchPayment, journalize }, dispatch);
};

export default withModulesManager(
  withHistory(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(injectIntl(PaymentForApproverDetails))
  )
);
