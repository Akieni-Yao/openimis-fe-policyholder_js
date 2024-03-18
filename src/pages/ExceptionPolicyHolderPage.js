import React, { Component, Fragment } from "react";
import { Tab } from "@material-ui/core";

import { formatMessage, PublishedComponent } from "@openimis/fe-core";
import {
  RIGHT_POLICYHOLDERINSUREE_SEARCH,
  EXCEPTION_POLICYHOLDER_TAB_VALUE,
  RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH,
} from "../constants";

import ExceptionPolicyHolderSearcher from "../components/ExceptionPolicyHolderSearcher";

class ExceptionPolicyholderTabLabel extends Component {
  pendingApprovalUser = window.location.href.includes("pendingapproval");
  render() {
    const { intl, rights, onChange, disabled, tabStyle, isSelected } =
      this.props;
    return (
      (rights.includes(RIGHT_POLICYHOLDERINSUREE_SEARCH) ||
        rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH)) && (
        <Tab
          onChange={onChange}
          disabled={disabled}
          className={tabStyle(EXCEPTION_POLICYHOLDER_TAB_VALUE)}
          selected={isSelected(EXCEPTION_POLICYHOLDER_TAB_VALUE)}
          value={EXCEPTION_POLICYHOLDER_TAB_VALUE}
          label={!!this.pendingApprovalUser ? formatMessage(
            intl,
            "exception",
            "exceptionPolicyholderApproval.label"
          ) : formatMessage(
            intl,
            "exception",
            "exceptionPolicyholder.label"
          )}
        />
      )
    );
  }
}

class ExceptionPolicyholderTabPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reset: 0,
      insureeCheck: false,
      downloadError: null,
    };
  }
  userlang = localStorage.getItem("userLanguage");
  onSave = () => {
    this.setState((state) => ({
      reset: state.reset + 1,
    }));
  };

  pendingApprovalUser = window.location.href.includes("pendingapproval");

  render() {
    const { rights, value, isTabsEnabled, policyHolder, intl } = this.props;
    return (
      (rights.includes(RIGHT_POLICYHOLDERINSUREE_SEARCH) ||
        rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH)) && (
        <PublishedComponent
          pubRef="policyHolder.TabPanel"
          module="policyHolder"
          index={EXCEPTION_POLICYHOLDER_TAB_VALUE}
          value={value}
        >
          <Fragment>
            <ExceptionPolicyHolderSearcher
              policyHolder={policyHolder}
              rights={rights}
              reset={this.state.reset}
              onSave={this.onSave}
              insureeCheck={this.state.insureeCheck}
              pendingApprovalUser={this.pendingApprovalUser}
            />
          </Fragment>
        </PublishedComponent>
      )
    );
  }
}

export { ExceptionPolicyholderTabLabel, ExceptionPolicyholderTabPanel };
