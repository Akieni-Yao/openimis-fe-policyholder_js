import React, { Component } from "react";
import {
  withModulesManager,
  formatMessageWithValues,
  withHistory,
  historyPush,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import PolicyHolderForm from "../components/PolicyHolderForm";
import { createPolicyHolder, updatePolicyHolder } from "../actions";
import {
  ZERO,
  MAX_CLIENTMUTATIONLABEL_LENGTH,
  RIGHT_POLICYHOLDER_CREATE,
  RIGHT_POLICYHOLDER_UPDATE,
  RIGHT_PORTALPOLICYHOLDER_SEARCH,
} from "../constants";
import ExceptionForm from "../components/ExceptionForm";

const styles = (theme) => ({
  page: theme.page,
});

class ExceptionInsureesFormPage extends Component {
  constructor(props) {
    super(props);
    this.state = { snackbar: false, resCode: "" };
  }
  back = () => {
    historyPush(
      this.props.modulesManager,
      this.props.history,
      "policyHolder.route.exception"
    );
  };

  save = async (policyHolder) => {
    const { intl, createPolicyHolder, updatePolicyHolder } = this.props;
    try {
      if (!!policyHolder.id) {
        const response = await updatePolicyHolder(
          policyHolder,
          formatMessageWithValues(
            intl,
            "policyHolder",
            "UpdatePolicyHolder.mutationLabel",
            this.titleParams(policyHolder)
          ).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
        );
        if (!response.error) {
        
          this.setState({ snackbar: true });
          this.setState({
            resCode: response?.policyHolder[0]?.policyholder?.code,
          });
          setTimeout(() => {
            historyPush(
              this.props.modulesManager,
              this.props.history,
              "policyHolder.route.policyHolders"
            );
          }, 5000);
        }
      } else {
        const response = await createPolicyHolder(
          policyHolder,
          formatMessageWithValues(
            intl,
            "policyHolder",
            "CreatePolicyHolder.mutationLabel",
            this.titleParams(policyHolder)
          ).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
        );
        if (!response.error) {
         
          this.setState({ snackbar: true });
          this.setState({
            resCode: response?.policyHolder[0]?.policyholder?.code,
          });
          setTimeout(() => {
            historyPush(
              this.props.modulesManager,
              this.props.history,
              "policyHolder.route.policyHolders"
            );
          }, 5000);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  handleClose = () => {
    this.setState({ snackbar: false });
  };
  titleParams = (policyHolder) => {
    var params = { label: null };
    if (!!policyHolder.code && !!policyHolder.tradeName) {
      params.label = `${policyHolder.code} - ${policyHolder.tradeName}`;
    } else {
      if (!!policyHolder.code) {
        params.label = `${policyHolder.code}`;
      } else if (!!policyHolder.tradeName) {
        params.label = `${policyHolder.tradeName}`;
      }
    }
    return params;
  };

  render() {
    const { classes, rights, policyHolderId } = this.props;
    return (
      (rights.includes(
        !!policyHolderId ? RIGHT_POLICYHOLDER_UPDATE : RIGHT_POLICYHOLDER_CREATE
      ) ||
        rights.includes(RIGHT_PORTALPOLICYHOLDER_SEARCH)) && (
        <div className={classes.page}>
          <ExceptionForm
            policyHolderId={policyHolderId}
            back={this.back}
            save={this.save}
            titleParams={this.titleParams}
            rights={rights}
            snackbar={this.state.snackbar}
            resCode={this.state.resCode}
            handleClose={this.handleClose}
          />
        </div>
      )
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  policyHolderId: props.match.params.policyholder_id,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { createPolicyHolder, updatePolicyHolder },
    dispatch
  );
};

export default withHistory(
  withModulesManager(
    injectIntl(
      withTheme(
        withStyles(styles)(
          connect(
            mapStateToProps,
            mapDispatchToProps
          )(ExceptionInsureesFormPage)
        )
      )
    )
  )
);
