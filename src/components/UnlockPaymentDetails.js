import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Typography,
  Box,
  Button,
  Divider,
  Paper,
  Grid,
} from "@material-ui/core";

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
  render() {
    const { classes, policyHoldersUnpaid } = this.props;

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

    return (
      <Box className={classes.container}>
        <Paper className={classes.paper}>
          <Box
            alignItems="center"
            direction="row"
            className={classes.headerDetails}
          >
            <Typography variant="h6">Payment Details</Typography>
          </Box>
          <Divider />
          <Grid item xs={12} className={classes.container}>
            <Box className={classes.amountContainer}>
              <Typography>Declaration Amount:</Typography>
              <Typography>XAF {declarationAmount}</Typography>
            </Box>
            <Box className={classes.amountContainer}>
              <Typography>Penalty Amount:</Typography>
              <Typography>XAF {penaltyAmount}</Typography>
            </Box>
            <Box className={classes.amountContainer}>
              <Typography>Sanction Amount:</Typography>
              <Typography>XAF {sanctionAmount}</Typography>
            </Box>
            <Divider />
            <Box className={classes.amountContainer}>
              <Typography>Total Amount to be Paid:</Typography>
              <Typography className={classes.totalAmount}>
                XAF {declarationAmount + penaltyAmount + sanctionAmount}
              </Typography>
            </Box>
            <Box className={classes.buttonContainer}>
              <Button
                variant="contained"
                color="primary"
                disabled={
                  policyHoldersUnpaid?.status == 5 &&
                  policyHoldersUnpaid?.paymentsPenalty?.status == 7
                    ? false
                    : true
                }
                onClick={this.handleUnlockPolicyholder}
              >
                Unlock Policy Holder
              </Button>
            </Box>
          </Grid>
        </Paper>
      </Box>
    );
  }
}

export default withStyles(styles)(UnlockPaymentDetails);
