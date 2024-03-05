import React, { Component } from "react";
import PolicyHolderTabPanel from "./PolicyHolderTabPanel";
import {
  withModulesManager,
  formatMessageWithValues,
  withHistory,
  journalize,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import ExceptionTabPanelsList from "./ExceptionTabPanelsList";
import {
    fetchPolicyHolder,
    clearPolicyHolder,
   
  } from "../actions";

class ExceptionTabPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      policyHolder: {},
      isFormValid: true,
      success: false,
      successMessage: "",
    };
  }
  componentDidMount() {
    if (!!this.props.policyHolderId) {
      this.setState(
        (_, props) => ({ policyHolderId: props.policyHolderId }),
        () =>
          this.props.fetchPolicyHolder(
            this.props.modulesManager,
            this.props.policyHolderId
          )
      );
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.fetchedPolicyHolder !== this.props.fetchedPolicyHolder &&
      !!this.props.fetchedPolicyHolder
    ) {
      this.unwrapJSONFields(this.props.policyHolder);
      this.setState((_, props) => ({
        policyHolder: props.policyHolder,
        policyHolderId: props.policyHolderId,
      }));
    }
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
    }
  }

  componentWillUnmount() {
    this.props.clearPolicyHolder();
  }
  onEditedChanged() {
    console.log("hi");
  }
  render() {
    const { rights, policyHolderId } = this.props;
    return (
      <div>
        <ExceptionTabPanelsList
          edited={this.state.policyHolder}
          edited_id={policyHolderId}
          rights={rights}
          //   {...others}
          onEditedChanged={this.onEditedChanged}
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
      {
        fetchPolicyHolder,
        clearPolicyHolder,
        journalize,
       
      },
      dispatch
    );
  };

const mapStateToProps = (state, props) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  policyHolderId: props.match.params.policyholder_id,
});

export default withHistory(
  withModulesManager(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(ExceptionTabPanel))
  )
);
