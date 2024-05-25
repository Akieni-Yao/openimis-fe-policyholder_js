import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { AssignmentInd, GroupAdd, People, Person } from "@material-ui/icons";
import {
  formatMessage,
  MainMenuContribution,
  withModulesManager,
  FormattedMessage,
} from "@openimis/fe-core";
import ReceiptIcon from "@material-ui/icons/Receipt";
import { RIGHT_POLICYHOLDERCONTRACT_SEARCH } from "../constants";
import { ListAlt } from "@material-ui/icons";
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
const INSUREE_MAIN_MENU_CONTRIBUTION_KEY = "insuree.MainMenu";
const ROUTE_CONTRACTS = "contracts";
const ROUTE_DECLARATION = "declaration";
const ROUTE_POLICYHOLDER_REQUEST = "policyholderRequest";
const ROUTE_CONTRACT = "contracts/contract";
const ROUTE_PAYMENT_FOR_APPROVAL = "paymentApproval";
class PolicyHolderMenu extends Component {
  render() {
    const { modulesManager, rights } = this.props;
    let entries = [];

    entries.push(
      ...modulesManager
        .getContribs(INSUREE_MAIN_MENU_CONTRIBUTION_KEY)
        .filter((c) => !c.filter || c.filter(rights))
    );
    entries.push({
      text: (
        <FormattedMessage module="policyHolder" id="menu.paymentForApproval" />
      ),
      icon: <PlaylistAddCheckIcon />,
      route: "/" + ROUTE_PAYMENT_FOR_APPROVAL,
    });
    if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_SEARCH)) {
      entries.push({
        text: <FormattedMessage module="contract" id="menu.contracts" />,
        icon: <ReceiptIcon />,
        route: "/" + ROUTE_CONTRACTS,
      });
    }
    if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_SEARCH)) {
      entries.push({
        text: <FormattedMessage module="policyHolder" id="menu.declaration" />,
        icon: <ListAlt />,
        route: "/" + ROUTE_DECLARATION,
      });
    }
    if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_SEARCH)) {
      entries.push({
        text: <FormattedMessage module="policyHolder" id="menu.newPolicyHolder" />,
        icon: <AssignmentIndIcon />,
        route: "/" + ROUTE_POLICYHOLDER_REQUEST,
      });
    }
    if (!entries.length) return null;
    return (
      <MainMenuContribution
        {...this.props}
        header={formatMessage(this.props.intl, "policyHolder", "mainmenu")}
        icon={<AssignmentInd />}
        entries={entries}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
});

export default withModulesManager(
  injectIntl(connect(mapStateToProps)(PolicyHolderMenu))
);
