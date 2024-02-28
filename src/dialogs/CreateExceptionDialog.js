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
  ConstantBasedPicker
} from "@openimis/fe-core";
import { Fab, Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { createPolicyHolderInsuree } from "../actions";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  ZERO,
  MAX_CLIENTMUTATIONLABEL_LENGTH,
  exception_month,
} from "../constants";

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


  handleSave = () => {
    const { intl, policyHolder, onSave, createPolicyHolderInsuree } =
      this.props;
    createPolicyHolderInsuree(
      this.state.policyHolderInsuree,
      formatMessageWithValues(
        intl,
        "policyHolder",
        "CreatePolicyHolderInsuree.mutationLabel",
        {
          code: policyHolder.code,
          tradeName: policyHolder.tradeName,
        }
      ).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
    );
    onSave();
    this.handleClose();
  };

  updateAttribute = (attribute, value) => {
    this.setState((state) => ({
      policyHolderInsuree: {
        ...state.policyHolderInsuree,
        [attribute]: value,
      },
    }));
  };

  canSave = () => {
    const { policyHolderInsuree, jsonExtValid } = this.state;
    return (
      !!policyHolderInsuree.policyHolder &&
      !!policyHolderInsuree.insuree &&
      !!policyHolderInsuree.contributionPlanBundle &&
      !!policyHolderInsuree.dateValidFrom &&
      !!jsonExtValid
    );
  };

  setJsonExtValid = (valid) => this.setState({ jsonExtValid: !!valid });

  render() {
    const { intl, classes, open, policyHolderInsuree, handleClose } =
      this.props;
    console.log("policyHolderInsuree", policyHolderInsuree);
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
                    !!policyHolderInsuree.insuree && policyHolderInsuree.insuree
                  }
                  onChange={(v) => this.updateAttribute("insuree", v)}
                />
              </Grid>
              <Grid item className={classes.item}>
                <PublishedComponent
                  pubRef="policyHolder.ExceptionStatusPicker"
                  module="policyHolder"
                  label="exceptionReason"
                  nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
                  value={!!policyHolderInsuree.insuree && policyHolderInsuree.insuree.exceptionReason}
                  onChange={(v) =>
                    this.updateAttribute({ exceptionReason: v })
                  }
                />
              </Grid>
              <Grid item className={classes.item}>
              <ConstantBasedPicker
                    module="policyHolder"
                    label="exception.exceptionMonth"
                    value={
                      !!policyHolderInsuree && policyHolderInsuree?.exceptionMonth
                        ? policyHolderInsuree?.exceptionMonth
                        : ""
                    }
                    onChange={(value) =>
                      this.updateAttribute("exceptionMonth", value)
                    }
                    constants={exception_month}
                    withNull
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
  return bindActionCreators({ createPolicyHolderInsuree }, dispatch);
};

export default injectIntl(
  withTheme(
    withStyles(styles)(connect(null, mapDispatchToProps)(CreateExceptionDialog))
  )
);
