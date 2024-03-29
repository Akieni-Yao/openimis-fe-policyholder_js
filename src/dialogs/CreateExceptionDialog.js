import React, { Component, Fragment } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  FormattedMessage,
  formatMessageWithValues,
  PublishedComponent,
  formatMessage,
  ConstantBasedPicker,
  TextInput
} from "@openimis/fe-core";
import { Fab, Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
// import { createPolicyHolderInsuree } from "../actions";
import { createException } from "../actions";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  ZERO,
  MAX_CLIENTMUTATIONLABEL_LENGTH,
  exception_month,
} from "../constants";
import CommonSnackbar from "../components/CommonSnackbar";

const styles = (theme) => ({
  item: theme.paper.item,
});

class CreateExceptionDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      policyHolderInsuree: {},
      jsonExtValid: true,
      jsonData: {},
      success: false,
      successMessage: "",
      confirmDialog: false,
      statusCheck: null,
      snackbar: false,
      severity: null,
      snackbarMsg: null,
      camuCode: null
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
    }));
  };


  handleSave = async () => {
    const { intl, policyHolder, onSave, createException } =
      this.props;
    const response = await createException(this.props.modulesManager,
      this.state.jsonData,
    );
    // console.log(response, "response")
    if (!!response?.payload?.data?.createInsureeException?.insureeException) {
      this.setState({
        snackbar: true,
        camuCode: !!response?.payload?.data?.createInsureeException?.insureeException?.code ? response?.payload?.data?.createInsureeException?.insureeException?.code : "",

        severity: "success",
        snackbarMsg: formatMessageWithValues(
          this.props.intl,
          "policyHolder",
          "snackbar.create",
          {}
        )
      });
    } else {
      this.setState({
        snackbar: true,
        severity: "error",
        // camuCode: !!response?.payload?.data?.createInsureeException?.insureeException?.code ? response?.payload?.data?.createInsureeException?.insureeException?.code : "",
        // snackbarMsg: response?.payload?.data?.createInsureeException?.message
        // formatMessageWithValues(
        //   this.props.intl,
        //   "policyHolder",
        //   "snackbar.create",
        //   {}
        // )
      })
    }
    onSave();
    this.props.handleClose();
    this.setState({ open: false, jsonData: {} });

  };
  closeSnakBar = () => {
    this.setState({ snackbar: false });
  }
  // updateAttribute = (attribute, value) => {
  //   // debugger
  //   this.setState((state) => ({
  //     jsonData: {
  //       ...state.jsonData,
  //       [attribute]: value,
  //     },
  //   }));
  // };
  updateAttribute = (attribute, value) => {
    // If the attribute is 'exceptionReason', update 'exceptionMonth' based on it
    if (attribute === 'exceptionReason') {
      const exceptionMonthOptions = this.getExceptionMonthOptions(value);
      const defaultValue = exceptionMonthOptions.length > 0 ? exceptionMonthOptions[0]?.value : '';
      this.setState((state) => ({
        jsonData: {
          ...state.jsonData,
          [attribute]: value,
          // Autofill 'exceptionMonth' with the first value if available
          exceptionMonth: defaultValue
        },
      }));
    } else {
      // Otherwise, update the attribute as usual
      this.setState((state) => ({
        jsonData: {
          ...state.jsonData,
          [attribute]: value,
        },
      }));
    }
  };
  canSave = () => {
    const { policyHolderInsuree, jsonExtValid, jsonData } = this.state;
    return (
      !!jsonData.insuree && jsonData.insuree &&
      !!jsonData.exceptionMonth && jsonData.exceptionMonth
      //  &&
      // !!policyHolderInsuree.insuree &&
      // !!policyHolderInsuree.contributionPlanBundle &&
      // !!policyHolderInsuree.dateValidFrom &&
      // !!jsonExtValid
    );
  };
  getExceptionMonthOptions = (exceptionReason) => {
    if (exceptionReason === "death_of_head_insuree") {
      return [{ label: "6", value: 6 }];
    } else if (exceptionReason === "Loss_of_Job") {
      return [{ label: "3", value: 3 }];
    }
    // Default options
    return exception_month;
  };
  setJsonExtValid = (valid) => this.setState({ jsonExtValid: !!valid });

  render() {
    const { intl, classes, open, policyHolderInsuree, handleClose } =
      this.props;
    const { exceptionReason } = this.state.jsonData;
    return (
      <Fragment>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            <FormattedMessage module="policyHolder" id="exception.addException" />
          </DialogTitle>
          <DialogContent>
            <Grid container direction="column" className={classes.item}>
              <Grid item className={classes.item}>
                <PublishedComponent
                  pubRef="insuree.InsureeChfIdPicker"
                  required
                  value={
                    !!this.state.jsonData.insuree && this.state.jsonData.insuree
                  }
                  onChange={(v) => this.updateAttribute("insuree", v)}
                />
              </Grid>
              <Grid item className={classes.item}>
                <PublishedComponent
                  pubRef="policyHolder.InsureeExceptionRegion"
                  module="policyHolder"
                  label="policyHolder.insureeexceptionReason"
                  nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
                  value={!!this.state.jsonData.exceptionReason && this.state.jsonData.exceptionReason}
                  onChange={(v) =>
                    // this.updateAttribute({ exceptionReason: v })
                    this.updateAttribute("exceptionReason", v)
                  }
                />
              </Grid>
              <Grid item className={classes.item}>
                <TextInput
                  module="policyHolder"
                  label="ExceptionMonth"
                  value={this.state.jsonData.exceptionMonth || ""}
                  readOnly={true}
                // onChange={(event) => this.updateAttribute("exceptionMonth", event.target.value)}
                />
              </Grid>
              {this.state.jsonData.exceptionMonth == 6 ? <Grid item className={classes.item}>
                <PublishedComponent
                  pubRef="insuree.RequestedByPicker"
                  value={!!this.state.jsonData.secondGuardian && this.state.jsonData.secondGuardian}
                  onChange={(v) => this.updateAttribute("secondGuardian", v)}
                  uuid={this.state.jsonData.insuree?.family?.uuid}
                />
              </Grid> : ""}

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
        {!!this.state.camuCode ? <CommonSnackbar
          open={this.state.snackbar}
          onClose={this.closeSnakBar}
          // message={formatMessageWithValues(
          //   intl,
          //   "policyHolder",
          //   "policyHolder.CreatePolicyHolder.snackbar",
          //   {}
          // )}
          message={this.state.snackbarMsg}
          // severity="success"
          severity={this.state.severity} // Use the severity from state
          copyText={!!this.state.camuCode ? this.state.camuCode : ""}
          backgroundColor="#00913E"
        /> : <CommonSnackbar
          open={this.state.snackbar}
          onClose={this.closeSnakBar}
          message={formatMessageWithValues(
            intl,
            "policyHolder",
            "InsureeExceptionError.Insuree is not in an active or approved.",
            {}
          )}
          // message={this.state.snackbarMsg}
          // severity="success"
          severity={this.state.severity} // Use the severity from state
          // copyText={!!this.state.camuCode ? this.state.camuCode : ""}
          backgroundColor="red" />}
      </Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ createException }, dispatch);
};

export default injectIntl(
  withTheme(
    withStyles(styles)(connect(null, mapDispatchToProps)(CreateExceptionDialog))
  )
);
