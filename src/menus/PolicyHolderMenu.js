import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { AssignmentInd, GroupAdd, People, Person } from "@material-ui/icons";
import { formatMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";

const INSUREE_MAIN_MENU_CONTRIBUTION_KEY = "insuree.MainMenu";

class PolicyHolderMenu extends Component {
  render() {
    const { modulesManager, rights } = this.props;
    let entries = [];
    entries.push(
      ...modulesManager
        .getContribs(INSUREE_MAIN_MENU_CONTRIBUTION_KEY)
        .filter((c) => !c.filter || c.filter(rights)),
    );

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
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(injectIntl(connect(mapStateToProps)(PolicyHolderMenu)));
