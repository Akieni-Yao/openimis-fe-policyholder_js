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
import { createPolicyHolderInsuree ,createPolicyHolderException} from "../actions";
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
      jsonData:{}
    }));
  };

  // handleClose = () => {
  //     this.setState({ open: false, policyHolderInsuree: {} });
  // };

  handleSave = () => {
    const { intl, policyHolder, onSave, createPolicyHolderException } =
      this.props;
      createPolicyHolderException("",
      this.state.jsonData,
      // formatMessageWithValues(
      //   intl,
      //   "policyHolder",
      //   "CreatePolicyHolderInsuree.mutationLabel",
      //   {
      //     code: policyHolder.code,
      //     tradeName: policyHolder.tradeName,
      //   }
      // ).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
    );
    onSave();
    this.props.handleClose();
    this.setState({ open: false, jsonData: {} });
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
    const { policyHolderInsuree, jsonExtValid,jsonData } = this.state;
    console.log("jsonData",jsonData);
    return (
      !!jsonData?.policyHolder
      // &&
      // !!policyHolderInsuree.insuree &&
      // !!policyHolderInsuree.contributionPlanBundle &&
      // !!policyHolderInsuree.dateValidFrom &&
      // !!jsonExtValid
    );
  };

  setJsonExtValid = (valid) => this.setState({ jsonExtValid: !!valid });

  render() {
    const { intl, classes, open, policyHolderInsuree, handleClose } =
      this.props;
    // const { open, policyHolderInsuree } = this.state;
    console.log("policyHolderInsuree", policyHolderInsuree);
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
                    // !!this.state.jsonData && policyHolderInsuree.insuree
                    !!this?.state?.jsonData?.policyHolder && this?.state?.jsonData?.policyHolder

                  }
                  onChange={(v) => this.updateAttribute("policyHolder", v)}
                />
              </Grid>
              <Grid item className={classes.item}>
                <PublishedComponent
                  pubRef="policyHolder.ExceptionRegionPicker"
                  module="policyHolder"
                  label="exceptionReason"
                  nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
                  value={
                    // !!policyHolderInsuree.insuree &&
                    // policyHolderInsuree.insuree.exceptionReason
                    !!this?.state?.jsonData?.exceptionReason && this?.state?.jsonData?.exceptionReason
                  }
                  onChange={(v) => this.updateAttribute( "exceptionReason", v )}
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
      </Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ createPolicyHolderInsuree,createPolicyHolderException}, dispatch);
};

export default injectIntl(
  withTheme(
    withStyles(styles)(
      connect(null, mapDispatchToProps)(CreateExceptionPolicyHolderDialog)
    )
  )
);
