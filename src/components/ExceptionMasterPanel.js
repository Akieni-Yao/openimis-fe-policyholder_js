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
class ExceptionMasterPanel extends FormPanel {
  render() {
    const { intl, classes, edited, readOnly, overview, userName, paymentData } =
      this.props;
    const jsonExtString = edited && edited[0]?.insuree?.jsonExt;
    const jsonExtObj = jsonExtString ? JSON.parse(jsonExtString) : {};
    const insureeLocation = jsonExtObj?.insureelocations?.parent?.name;
    return (
      <Fragment>
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.camuNo"
              readOnly={true}
              value={!edited ? "" : edited[0]?.insuree?.camuNumber}
            // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.firstName"
              readOnly={true}
              value={!edited ? "" : edited[0]?.insuree?.otherNames}
            // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.lastName"
              readOnly={true}
              value={!edited ? "" : edited[0]?.insuree?.lastName}
            // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid>
          <Grid item className={classes.item} xs={12}>
            <TextInput
              module="policyHolder"
              label="exceptionReason"
              nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
              value={edited[0]?.reason?.reason || ""}
              readOnly={true}
            />
          </Grid>
          <Grid item className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.month"
              nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
              value={`${edited[0]?.reason?.period} mois`}
              readOnly={true}
            />
          </Grid>
          {/* <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.city"
              readOnly={true}
              value={!!insureeLocation ? insureeLocation : ""}
            // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid> */}
          {/* <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.phone"
              readOnly={true}
              value={!edited ? "" : edited[0]?.insuree?.phone}
            // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid> */}
          {/* <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.bithDate"
              readOnly={true}
              value={!edited ? "" : edited[0]?.insuree?.dob}
            // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid> */}
          <Grid item className={classes.item}>
          {/* <PublishedComponent
                  pubRef="policyHolder.insureeexceptionReason"
                  module="policyHolder"
                  label="exceptionReason"
                  readOnly={true}
                  nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
                  value={!edited ? "" : edited[0]?.exceptionReason}
                  // onChange={(v) =>
                  //   // this.updateAttribute({ exceptionReason: v })
                  //   this.updateAttribute("exceptionReason", v)
                  // }
                /> */}
                   {/* <PublishedComponent
                  pubRef="policyHolder.InsureeExceptionRegion"
                  module="policyHolder"
                  label="policyHolder.insureeexceptionReason"
                  readOnly={true}
                  nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
                  value={!edited ? "" : edited[0]?.exceptionReason}
                /> */}
            {/* <TextInput
              module="policyHolder"
              label="exception.exceptionType"
              readOnly={true}
              value={!edited ? "" : edited[0]?.exceptionReason}
            // onChange={p => this.updateAttribute('receiptNo', p)}
            /> */}
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="exception.exceptionStatus"
              readOnly={true}
              value={!edited ? "" : edited[0]?.status}

            // value={!edited ? "" : edited.paymentCode}
            // onChange={p => this.updateAttribute('receiptNo', p)}
            />
          </Grid>

          <Grid container>
            <Grid item xs={6}>
              <Contributions
                {...this.props}
                edited={edited}
                updateAttribute={this.updateAttribute}
                contributionKey={EXCEPTION_DOCUMENTS_KEY}
              />
            </Grid>
          </Grid>
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
    withHistory(injectIntl(withTheme(withStyles(styles)(ExceptionMasterPanel))))
  )
);
