import React, { Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid, Typography } from "@material-ui/core";
import {
  withHistory,
  withModulesManager,
  AmountInput,
  TextInput,
  NumberInput,
  PublishedComponent,
  FormPanel,
  Contributions,
  ConstantBasedPicker,
  formatMessage,
} from "@openimis/fe-core";
import { connect } from "react-redux";

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
  paddingContainer: {
    marginTop: "1rem",
    paddingTop: "1rem",
    backgroundColor: "#00913e0d",
  },
  headingAmount: {
    fontWeight: "bold",
  },
  textAmount: {
    fontWeight: "bold",
    color: "red",
  },
});
const EXCEPTION_DOCUMENTS_KEY = "policyHolder.policyHolder.documents";

const payment_rejection = ["not_clear_docs", "not_valid"];
class UnlockPolicyHolderMasterPanel extends FormPanel {
  render() {
    const { intl, classes, edited, readOnly, overview, userName, paymentData } =
      this.props;
    return (
      <Fragment>
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.camuCode"
              readOnly={true}
              value={!edited ? "" : edited?.code}
              // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="tradeName"
              value={!!edited && !!edited?.tradeName ? edited?.tradeName : ""}
              // onChange={(v) => this.updateAttribute("tradeName", v)}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.city"
              readOnly={true}
              value={
                !!edited && !!edited?.locations?.parent?.name
                  ? edited?.locations?.parent?.name
                  : ""
              }
              // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid>
          <Grid item className={classes.item}>
            <PublishedComponent
              pubRef="policyHolder.ExceptionRegionPicker"
              module="policyHolder"
              label="exceptionReason"
              nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
              value={
                !!edited && !!edited?.exceptionReason
                  ? edited?.exceptionReason
                  : ""
              }
              readOnly={true}
              // onChange={(v) =>
              //   // this.updateAttribute({ exceptionReason: v })
              //   this.updateAttribute("exceptionReason", v)
              // }
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.exceptionStatus"
              readOnly={true}
              value={!!edited && !!edited?.status ? edited?.status : ""}

              // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid>

          {/* <Grid container>
            <Grid item xs={6}>
              <Contributions
                {...this.props}
                edited={edited}
                updateAttribute={this.updateAttribute}
                contributionKey={EXCEPTION_DOCUMENTS_KEY}
              />
            </Grid>
          </Grid> */}
        </Grid>
      </Fragment>
    );
  }
}
const mapStateToProps = (state, props) => ({
  paymentData: state.payment.payment,
});
export default withModulesManager(
  connect(
    mapStateToProps,
    null
  )(
    withHistory(
      injectIntl(withTheme(withStyles(styles)(UnlockPolicyHolderMasterPanel)))
    )
  )
);
