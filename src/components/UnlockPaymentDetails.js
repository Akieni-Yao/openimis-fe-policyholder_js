import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Box,
  Button,
  Divider,
  Paper,
  Grid,
} from "@material-ui/core";
import {
  formatMessage,
  journalize,
  coreConfirm,
  historyPush,
  withModulesManager,
  withHistory,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { unlockPolicyholder, resetPolicyholderUnlock } from "../actions";
import { formatNumber } from "../utils";
import CommonSnackbar from "./CommonSnackbar";

const styles = (theme) => ({
  paper: theme.paper.paper,
  headerDetails: { ...theme.paper.header, padding: theme.spacing(2) },
  container: {
    // border: "1px solid #b2dfdb",
    borderRadius: theme.shape.borderRadius,
    // backgroundColor: "#e0f2f1",
    maxWidth: "auto",
    // margin: "auto",
  },
  amountContainer: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1, 2),
  },
  totalAmount: {
    color: "red",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    textAlign: "right",
  },
});

class UnlockPaymentDetails extends Component {
  handleUnlockPolicyholder = () => {
    this.props.unlockPolicyholder(this.props.policyHolderId);
  };

  handleCheckUnlockPolicyholder = () => {
    this.props.unlockPolicyholder(this.props.policyHolderId, true);
  };

  componentDidMount() {
    this.handleCheckUnlockPolicyholder();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { unlockState: prevUnlockState } = prevProps;

    console.log('.....................', this.props.checkUnlockStatus);

    if (prevUnlockState.loading === true && this.props.unlockState.success) {
      this.props.resetPolicyholderUnlock();
      historyPush(
        this.props.modulesManager,
        this.props.history,
        "policyHolder.route.policyHolder",
        [this.props.policyHolderId]
      );
    }
  }

  handleSnackbarClose = () => {
    this.props.resetPolicyholderUnlock();
  };

  render() {
    const { classes, policyHoldersUnpaid, intl, unlockState } = this.props;

    // Calculate declarationAmount (sum of amountDue from contract)
    const declarationAmount = policyHoldersUnpaid.reduce((total, payment) => {
      return total + payment.contract.amountDue;
    }, 0);

    // Calculate penaltyAmount (sum of penalties where penaltyType is "Penalty")
    const penaltyAmount = policyHoldersUnpaid.reduce((total, payment) => {
      const penaltySum = payment.paymentsPenalty.edges.reduce(
        (penaltyTotal, edge) => {
          if (edge.node.penaltyType === "Penalty") {
            return penaltyTotal + parseInt(edge.node.amount);
          }
          return penaltyTotal;
        },
        0
      );
      return total + penaltySum;
    }, 0);
    const sanctionAmount = policyHoldersUnpaid.reduce((total, payment) => {
      const sanctionSum = payment.paymentsPenalty.edges.reduce(
        (sanctionTotal, edge) => {
          if (edge.node.penaltyType === "Penalty") {
            return sanctionTotal + parseInt(edge.node.amount);
          }
          return sanctionTotal;
        },
        0
      );
      return total + sanctionSum;
    }, 0);

    const allContractsStatusFive = policyHoldersUnpaid.every(
      (item) => item.status === 5
    );

    const allPenaltiesStatusValid = policyHoldersUnpaid.every((item) =>
      item.paymentsPenalty.edges.every(
        (edge) => edge.node.status === 7 || edge.node.status === 11
      )
    );

    const items = policyHoldersUnpaid
      .map((item) => item.paymentsPenalty.edges)
      .flat();

    return (
      <Fragment>
        <Box className={classes.container}>
          <Paper className={classes.paper}>
            <Box
              alignItems="center"
              direction="row"
              className={classes.headerDetails}
            >
              <Typography variant="h6">
                {formatMessage(intl, "payment", `PaymentOverview.title`)}
              </Typography>
            </Box>
            <Divider />
            <Grid item xs={12} className={classes.container}>
              <Box className={classes.amountContainer}>
                <Typography>
                  {/* Declaration Amount: */}
                  {formatMessage(intl, "payment", `payment.DeclarationAmount`)}:
                </Typography>
                <Typography>XAF {formatNumber(declarationAmount)}</Typography>
              </Box>
              <Box className={classes.amountContainer}>
                <Typography>
                  {formatMessage(intl, "payment", `penaltyAmount`)}:
                </Typography>
                <Typography>XAF {formatNumber(penaltyAmount)}</Typography>
              </Box>
              <Box className={classes.amountContainer}>
                <Typography>
                  {formatMessage(intl, "payment", `SanctionAmount`)}:
                </Typography>
                <Typography>XAF {formatNumber(sanctionAmount)}</Typography>
              </Box>
              <Divider />
              <Box className={classes.amountContainer}>
                <Typography>
                  {formatMessage(intl, "payment", `TotalAmt`)}:
                </Typography>
                <Typography className={classes.totalAmount}>
                  XAF{" "}
                  {formatNumber(
                    declarationAmount + penaltyAmount + sanctionAmount
                  )}
                </Typography>
              </Box>
              <Box className={classes.buttonContainer}>
                <Button
                  variant="contained"
                  color="primary"
                  // disabled={
                  //   !(allContractsStatusFive && allPenaltiesStatusValid) || unlockState.loading
                  // }
                  disabled={
                    !this.props.checkUnlockStatus || unlockState.loading
                  }
                  onClick={this.handleUnlockPolicyholder}
                >
                  {formatMessage(
                    intl,
                    "policyHolder",
                    `policyHolder.unlockPolicyholder`
                  )}
                </Button>
              </Box>
            </Grid>
          </Paper>
        </Box>

        <CommonSnackbar
          open={unlockState.error || unlockState.success}
          onClose={this.handleSnackbarClose}
          intl={intl}
          message={unlockState.message}
          severity={unlockState.success ? "success" : "error"}
          backgroundColor="#00913E"
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state, props) => ({
  fetchingPolicyHoldersUnpaid: state.policyHolder.fetchingPolicyHoldersUnpaid,
  unlockState: state.policyHolder.unlockState,
  checkUnlockStatus: state.policyHolder.checkUnlockStatus,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      unlockPolicyholder,
      resetPolicyholderUnlock,
      journalize,
      coreConfirm,
    },
    dispatch
  );
};

export default withHistory(
  withModulesManager(
    injectIntl(
      withStyles(styles)(
        connect(mapStateToProps, mapDispatchToProps)(UnlockPaymentDetails)
      )
    )
  )
);
