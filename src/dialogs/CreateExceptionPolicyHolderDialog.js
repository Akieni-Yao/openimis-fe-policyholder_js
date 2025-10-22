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

class CreateExceptionPolicyHolderDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      policyHolderInsuree: {},
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
    const ph_code =
      response?.payload?.data?.createPolicyHolderException?.policyHolderExcption
        ?.code;
    if (ph_code) {
      this.setState({
        snackbar: true,
        severity: "success",
        camuCode: ph_code,

        snackbarMsg: formatMessageWithValues(
          this.props.intl,
          "policyHolder",
          "snackbar.create.label",
          { label: ph_code }
        ),
      });
    } else {
      this.setState({
        snackbar: true,
        severity: "error",
        snackbarMsg:
          response?.payload?.data?.createPolicyHolderException?.message,
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
    return !!jsonData?.policyHolder;
  };

  setJsonExtValid = (valid) => this.setState({ jsonExtValid: !!valid });

  render() {
    const { intl, classes, open, policyHolderInsuree, handleClose } =
      this.props;

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
                <PublishedComponent
                  pubRef="policyHolder.camuCodePicker"
                  required
                  value={
                    !!this?.state?.jsonData?.policyHolder &&
                    this?.state?.jsonData?.policyHolder
                  }
                  onChange={(v) => this.updateAttribute("policyHolder", v)}
                />
              </Grid>
              <Grid item className={classes.item}>
                <PublishedComponent
                  pubRef="policyHolder.ExceptionReasonPicker"
                  module="policyHolder"
                  label="exceptionReason"
                  nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
                  value={this?.state?.jsonData?.reason_id}
                  onChange={(v) => this.updateAttribute("reason_id", v)}
                />
              </Grid>

              <Grid item className={classes.item}>
                <PublishedComponent
                  pubRef="core.DatePicker"
                  module="policyHolder"
                  label="exception.date"
                  required
                  onChange={(v) => this.updateAttribute("started_at", v)}
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
      connect(null, mapDispatchToProps)(CreateExceptionPolicyHolderDialog)
    )
  )
);
