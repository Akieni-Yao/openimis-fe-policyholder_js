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
  createExceptionReason,
  updateExceptionReason,
  fetchExceptionReasons,
} from "../actions";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import CommonSnackbar from "../components/CommonSnackbar";

const styles = (theme) => ({
  item: theme.paper.item,
});

class CreateExceptionReasonDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // open: false,
      edited: {},
      success: false,
      successMessage: "",
      confirmDialog: false,
      statusCheck: null,
      snackbar: false,
      severity: null,
      snackbarMsg: null,
    };
  }

  componentDidMount() {
    this.setState({
      // open: this.props.open,
      edited: this.props.edited || {},
    });
  }

  handleSave = async () => {
    try {
      const response = this.state.edited?.id
        ? await this.props.updateExceptionReason(
            this.state.edited,
            this.props.modulesManager
          )
        : await this.props.createExceptionReason(
            this.state.edited,
            this.props.modulesManager
          );

      console.log("response", response);

      const payload = response?.payload?.data;

      if (
        payload?.createExceptionReason?.success ||
        payload?.updateExceptionReason?.success
      ) {
        this.setState({
          snackbar: true,
          severity: "success",
          snackbarMsg: formatMessageWithValues(
            this.props.intl,
            "policyHolder",
            "snackbar.create",
            {}
          ),
        });
        this.props.handleClose();
        this.props.fetchExceptionReasons(this.props.modulesManager, {
          first: 10,
          orderBy: "-createdAt",
        });
      } else {
        this.setState({
          snackbar: true,
          severity: "error",
          snackbarMsg:
            payload?.createExceptionReason?.message ||
            payload?.updateExceptionReason?.message,
        });
      }
    } catch (error) {
      this.setState({
        snackbar: true,
        severity: "error",
        snackbarMsg: error.message || "An error occurred while saving",
      });
    }
  };
  closeSnakBar = () => {
    this.setState({ snackbar: false });
  };

  canSave = () => {
    return (
      this.state.edited?.reason &&
      this.state.edited?.scope &&
      this.state.edited?.period
    );
  };

  updateAttribute = (attribute, value) => {
    this.setState((state) => ({
      edited: {
        ...state.edited,
        [attribute]: value,
      },
    }));
  };

  render() {
    const { intl, classes, open, edited, handleClose } = this.props;

    return (
      <Fragment>
        <Dialog open={open} onClose={handleClose} style={{ minWidth: "500px" }}>
          <DialogTitle>
            <FormattedMessage
              module="policyHolder"
              id={
                edited.id
                  ? "exception.addExceptionReason"
                  : "exception.editExceptionReason"
              }
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
    {
      createPolicyHolderInsuree,
      createPolicyHolderException,
      createExceptionReason,
      updateExceptionReason,
      fetchExceptionReasons,
    },
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
