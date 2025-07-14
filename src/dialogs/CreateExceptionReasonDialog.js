import React, { Component, Fragment } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import AddIcon from "@material-ui/icons/Add";
import {
  FormattedMessage,
  formatMessageWithValues,
  PublishedComponent,
  formatMessage,
  TextInput,
} from "@openimis/fe-core";
import { Fab, Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  createPolicyHolderInsuree,
  createPolicyHolderException,
} from "../actions";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PolicyHolderContributionPlanBundlePicker from "../pickers/PolicyHolderContributionPlanBundlePicker";
import {
  ZERO,
  MAX_CLIENTMUTATIONLABEL_LENGTH,
  POLICYHOLDERINSUREE_CALCULATION_CONTRIBUTION_KEY,
  POLICYHOLDERINSUREE_CLASSNAME,
  RIGHT_CALCULATION_WRITE,
} from "../constants";
import CommonSnackbar from "../components/CommonSnackbar";

const styles = (theme) => ({
  item: theme.paper.item,
});

class CreateExceptionReasonDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edited: {},
      jsonExtValid: true,
      success: false,
      successMessage: "",
      confirmDialog: false,
      statusCheck: null,
      snackbar: false,
      severity: null,
      snackbarMsg: null,
      camuCode: null,
    };
  }

  handleOpen = () => {
    this.setState((_, props) => ({
      open: true,
      policyHolderInsuree: {
        policyHolder: props.policyHolder,
        policy: {},
      },
      jsonExtValid: true,
      jsonData: {},
    }));
  };

  // handleClose = () => {
  //     this.setState({ open: false, policyHolderInsuree: {} });
  // };

  handleSave = async () => {
    const { intl, policyHolder, onSave, createPolicyHolderException } =
      this.props;
    const response = await createPolicyHolderException(
      this.props.modulesManager,
      this.state.jsonData
    );
    // console.log("response", response)
    if (!!response?.payload?.data?.createPolicyHolderException?.code) {
      this.setState({
        snackbar: true,
        camuCode: !!response?.payload?.data?.createPolicyHolderException
          ?.policyHolderExcption?.code
          ? response?.payload?.data?.createPolicyHolderException
              ?.policyHolderExcption?.code
          : "",

        // severity: paymentData.status == 5 ? "success" : "error",
        snackbarMsg: formatMessageWithValues(
          this.props.intl,
          "policyHolder",
          "snackbar.create",
          {}
        ),
      });
    } else {
      this.setState({
        snackbar: true,
        severity: "error",
        // camuCode: !!response?.payload?.data?.createInsureeException?.insureeException?.code ? response?.payload?.data?.createInsureeException?.insureeException?.code : "",
        snackbarMsg:
          response?.payload?.data?.createPolicyHolderException?.message,
        // formatMessageWithValues(
        //   this.props.intl,
        //   "policyHolder",
        //   "snackbar.create",
        //   {}
        // )
      });
    }
    onSave();
    this.props.handleClose();
    this.setState({ open: false, jsonData: {} });
  };
  closeSnakBar = () => {
    this.setState({ snackbar: false });
  };
  updateAttribute = (attribute, value) => {
    // debugger
    this.setState((state) => ({
      jsonData: {
        ...state.jsonData,
        [attribute]: value,
      },
    }));
  };

  canSave = () => {
    const { policyHolderInsuree, jsonExtValid, jsonData } = this.state;
    // console.log("jsonData", jsonData);
    return !!jsonData?.policyHolder;
    // &&
    // !!policyHolderInsuree.insuree &&
    // !!policyHolderInsuree.contributionPlanBundle &&
    // !!policyHolderInsuree.dateValidFrom &&
    // !!jsonExtValid
  };

  setJsonExtValid = (valid) => this.setState({ jsonExtValid: !!valid });

  render() {
    const { intl, classes, open, edited, handleClose } = this.props;

    return (
      <Fragment>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            <FormattedMessage
              module="policyHolder"
              id="exception.addException"
            />
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" className={classes.item}>
              <Grid item className={classes.item}>
                <TextInput
                  module="policyHolder"
                  label="Raison"
                  required
                  value={edited?.reason}
                  onChange={(v) => this.updateAttribute("reason", v)}
                />
              </Grid>
              <Grid item className={classes.item}>
                <PublishedComponent
                  pubRef="policyHolder.ExceptionScopePicker"
                  module="policyHolder"
                  label="Scope"
                  nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
                  value={edited?.scope}
                  onChange={(v) => this.updateAttribute("scope", v)}
                />
              </Grid>
              <Grid item className={classes.item}>
                <TextInput
                  module="policyHolder"
                  label="Période"
                  required
                  type="number"
                  value={edited?.period}
                  onChange={(v) => this.updateAttribute("period", v)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="outlined">
              <FormattedMessage module="policyHolder" id="dialog.cancel" />
            </Button>
            <Button
              onClick={this.handleSave}
              disabled={!this.canSave()}
              variant="contained"
              color="primary"
              autoFocus
            >
              <FormattedMessage module="policyHolder" id="dialog.replace" />
            </Button>
          </DialogActions>
        </Dialog>
        {this.state.camuCode ? (
          <CommonSnackbar
            open={this.state.snackbar}
            onClose={this.closeSnakBar}
            message={this.state.snackbarMsg}
            severity="success"
            intl={intl}
            copyText={!!this.state.camuCode ? this.state.camuCode : ""}
            backgroundColor="#00913E"
          />
        ) : (
          <CommonSnackbar
            open={this.state.snackbar}
            onClose={this.closeSnakBar}
            message={formatMessageWithValues(
              intl,
              "policyHolder",
              `CreatePolicyHolder.${this.state.snackbarMsg}`,
              {}
            )}
            intl={intl}
            severity="error"
            backgroundColor="red"
          />
        )}
      </Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { createPolicyHolderInsuree, createPolicyHolderException },
    dispatch
  );
};

export default injectIntl(
  withTheme(
    withStyles(styles)(
      connect(null, mapDispatchToProps)(CreateExceptionReasonDialog)
    )
  )
);
