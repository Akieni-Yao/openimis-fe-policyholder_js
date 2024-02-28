import React, { Component, Fragment } from "react";
import { Tab, Grid, Typography, Input, Button } from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import GetAppIcon from "@material-ui/icons/GetApp";
import {
  formatMessage,
  PublishedComponent,
  FormattedMessage,
  baseApiUrl,
  apiHeaders,
} from "@openimis/fe-core";
import {
  RIGHT_POLICYHOLDERINSUREE_CREATE,
  RIGHT_POLICYHOLDERINSUREE_SEARCH,
  RIGHT_PORTALPOLICYHOLDERINSUREE_CREATE,
  RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH,
} from "../constants";
import PolicyHolderInsureeSearcher from "../components/PolicyHolderInsureeSearcher";
import { POLICYHOLDERINSUREE_TAB_VALUE } from "../constants";
import * as XLSX from "xlsx";
import ExceptionInsureeSearcher from "../components/ExceptionInsureeSearcher";

class ExceptionInsureeTabLabel extends Component {
  render() {
    const { intl, rights, onChange, disabled, tabStyle, isSelected } =
      this.props;
    return (
      (rights.includes(RIGHT_POLICYHOLDERINSUREE_SEARCH) ||
        rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH)) && (
        <Tab
          onChange={onChange}
          disabled={disabled}
          className={tabStyle(POLICYHOLDERINSUREE_TAB_VALUE)}
          selected={isSelected(POLICYHOLDERINSUREE_TAB_VALUE)}
          value={POLICYHOLDERINSUREE_TAB_VALUE}
          label={formatMessage(intl, "exception", "exceptionInsuree.label")}
        />
      )
    );
  }
}

class ExceptionInsureeTabPanel extends Component {
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
          index={POLICYHOLDERINSUREE_TAB_VALUE}
          value={value}
        >
          <Fragment>
            <ExceptionInsureeSearcher
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

export { ExceptionInsureeTabLabel, ExceptionInsureeTabPanel };
