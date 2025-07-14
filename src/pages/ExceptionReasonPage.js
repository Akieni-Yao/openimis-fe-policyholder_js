import React, { Component } from "react";
import { bindActionCreators } from "redux";
import PolicyHolderSearcher from "../components/PolicyHolderSearcher";
import CreateExceptionReasonDialog from "../dialogs/CreateExceptionReasonDialog";
import ExceptionReasonSearcher from "../components/ExceptionReasonSearcher";
import {
  withModulesManager,
  formatMessage,
  withTooltip,
  historyPush,
  Helmet,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import {
  RIGHT_POLICYHOLDER_SEARCH,
  RIGHT_POLICYHOLDER_CREATE,
  RIGHT_POLICYHOLDER_UPDATE,
  RIGHT_PORTALPOLICYHOLDER_SEARCH,
} from "../constants";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { decodeId } from "@openimis/fe-core";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class ExceptionReasonPage extends Component {
  state = {
    open: false,
  };
  // onAdd = () => {
  //   historyPush(
  //     this.props.modulesManager,
  //     this.props.history,
  //     "policyHolder.route.policyHolder"
  //   );
  // };

  // policyHolderPageLink = (policyHolder) => {
  //   return `${this.props.modulesManager.getRef(
  //     "policyHolder.route.policyHolder"
  //   )}${"/" + decodeId(policyHolder.id)}`;
  // };

  onDoubleClick = (policyHolder, newTab = false) => {
    const { rights, modulesManager, history } = this.props;
    // if (
    //   rights.includes(RIGHT_POLICYHOLDER_UPDATE) ||
    //   rights.includes(RIGHT_PORTALPOLICYHOLDER_SEARCH)
    // ) {
    //   historyPush(
    //     modulesManager,
    //     history,
    //     "policyHolder.route.policyHolder",
    //     [decodeId(policyHolder.id)],
    //     newTab
    //   );
    // }
  };

  onSave = (edited) => {};

  componentDidMount = () => {
    const moduleName = "policyHolder";
    const { module } = this.props;
    if (module !== moduleName) this.props.clearCurrentPaginationPage();
  };

  componentWillUnmount = () => {
    const { location, history } = this.props;
    const {
      location: { pathname },
    } = history;
    const urlPath = location.pathname;
    if (!pathname.includes(urlPath)) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { intl, classes, rights } = this.props;
    return (
      (rights.includes(RIGHT_POLICYHOLDER_SEARCH) ||
        rights.includes(RIGHT_PORTALPOLICYHOLDER_SEARCH)) && (
        <div className={classes.page}>
          <Helmet
            title={formatMessage(
              this.props.intl,
              "policyHolder",
              "policyHolders.page.title"
            )}
          />
          <ExceptionReasonSearcher
            onDoubleClick={this.onDoubleClick}
            policyHolderPageLink={"#"}
            rights={rights}
          />
          {rights.includes(RIGHT_POLICYHOLDER_CREATE) &&
            withTooltip(
              <div className={classes.fab}>
                <Fab
                  color="primary"
                  onClick={() => this.setState({ open: true })}
                >
                  <AddIcon />
                </Fab>
              </div>,
              formatMessage(intl, "policyHolder", "createButton.tooltip")
            )}

          <CreateExceptionReasonDialog
            edited={{}}
            onSave={this.onSave}
            open={this.state.open}
            handleClose={this.handleClose}
          />
        </div>
      )
    );
  }
}

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export default withModulesManager(
  injectIntl(
    withTheme(
      withStyles(styles)(
        connect(mapStateToProps, mapDispatchToProps)(ExceptionReasonPage)
      )
    )
  )
);
