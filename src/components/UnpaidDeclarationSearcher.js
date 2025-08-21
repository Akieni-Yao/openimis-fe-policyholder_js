import React, {Component} from "react";
import {injectIntl} from "react-intl";
import {
  coreConfirm,
  formatMessage,
  formatMessageWithValues,
  historyPush,
  journalize,
  Searcher,
  withHistory,
  withModulesManager,
} from "@openimis/fe-core";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {deletePolicyHolderUser, fetchUnpaidDeclaration} from "../actions";
import {DEFAULT_PAGE_SIZE, MAX_CLIENTMUTATIONLABEL_LENGTH, ROWS_PER_PAGE_OPTIONS, ZERO,} from "../constants";
import {Button, Grid, IconButton, Tooltip,} from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";
import AppliedPenaltiesSearcher from "./AppliedPenaltiesSearcher";
import SanctionOpenSearcher from "./SanctionOpenSearcher";
import UnlockPaymentDetails from "./UnlockPaymentDetails";
import moment from "moment";
import {withStyles, withTheme} from "@material-ui/core/styles";
import {formatNumber} from "../utils";

const DEFAULT_ORDER_BY = "id";
const styles = (theme) => ({item: theme.paper.item, marginLeft: 30});

class UnpaidDeclarationSearcher extends Component {
  state = {
    queryParams: null, toDelete: null, deleted: [],
  };

  constructor(props) {
    super(props);
    this.locationLevels = this.props.modulesManager.getConf("fe-location", "location.Location.MaxLevels", 4);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
    } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
      this.state.confirmedAction();
    } else if (prevState.toDelete !== this.state.toDelete && !!this.state.toDelete) {
      this.setState((state) => ({
        deleted: state.deleted.concat(state.toDelete), toDelete: null,
      }));
    } else if (prevState.deleted !== this.state.deleted || prevProps.reset !== this.props.reset) {
      this.refetch();
    }
  }

  fetch = (params) => {
    this.props.fetchUnpaidDeclaration(this.props.modulesManager, params);
  };
  refetch = () => this.fetch(this.state.queryParams);

  filtersToQueryParams = (state) => {
    let params = Object.keys(state.filters)
      .filter((f) => !!state.filters[f]["filter"])
      .map((f) => state.filters[f]["filter"]);
    if (!!state.orderBy) {
      params.push(`orderBy: ["${state.orderBy}"]`);
    }
    this.setState({queryParams: params});
    return params;
  };

  headers = () => {
    const {rights, predefinedPolicyHolderId = null} = this.props;
    return ["contract.declarationId", "contract.declarationPeriod", "contract.amount", "policyholder.action",];
  };
  rejectedCommentsTooltip = (rejectComment) => {
    return formatMessage(this.props.intl, "policyHolder", `policyHolder.rejectComment.${rejectComment}`);
  };

  defaultFilters = () => {
    const {policyHolderId} = this.props;
    return {
      policyHolderId: {
        value: true, filter: `policyHolderId: "${policyHolderId}"`,
      },
    };
  };

  sorts = () => {
    return [["code", true], ["tradeName", true], null, null];
  };

  onDoubleClick = (contract, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, "payment.paymentOverview", [contract.uuid], newTab);
  };

  formatDateRange = (dateFrom, dateTo) => {
    const startDate = moment(dateFrom);
    const endDate = moment(dateTo);

    const startMonthYear = startDate.format("MMM YYYY");
    const endMonthYear = endDate ? endDate.format("MMM YYYY") : null;
    if (dateFrom) {
      if (!endDate || (startDate.isSame(endDate, "month") && startDate.isSame(endDate, "year"))) {

        return startMonthYear;
      } else {

        return `${startMonthYear} - ${endMonthYear}`;
      }
    } else {
      return null;
    }
  };

  getPaymentStatusDetails = (intl, state) => {
    let color;

    switch (state) {
      case 1:
        color = "orange";

        break;
      case 2:
        color = "blue";

        break;
      case 3:
        color = "orange";

        break;
      case 4:
        color = "purple";
        break;
      case 5:
        color = "green";
        break;
      case -1:
        color = "red";
        break;
      case -2:
        color = "red";
        break;
      default:
        color = "red";
        break;
    }

    return {color};
  };

  itemFormatters = () => {
    return [
      (policyholder) => !!policyholder.contract.code && policyholder.contract.code,
      (policyholder) => !!policyholder.contract && !!policyholder.contract?.dateValidFrom && this.formatDateRange(policyholder.contract?.dateValidFrom, policyholder.contract?.dateValidTo),

      (policyholder) => !!policyholder.contract.amountDue && formatNumber(policyholder.contract.amountDue),
      (policyholder) => {
        const {color} = this.getPaymentStatusDetails(this.props.intl, policyholder.status);
        if (policyholder.status == 1) {
          return (<Button
            variant="contained"
            color="primary"
            onClick={(e) => this.onDoubleClick(policyholder)}
          >
            {formatMessage(this.props.intl, "policyholder", "openSanction.btn")}
          </Button>);
        } else {
          return (
            <Grid style={{display: "flex"}}>
              <span style={{color, fontWeight: "bold"}}>
                {policyholder.status !== null && formatMessage(this.props.intl, "payment", `payment.status.${policyholder.status}`)}

                {policyholder.status == -1 ? (
                  <Tooltip
                    placement="right"
                    arrow
                    //   classes={{ tooltip: this.props.classes.tooltip }}
                    title={formatMessage(this.props.intl, "payment", `payment.rejectComment.${policyholder.rejectedReason}`)}
                  >
                    <IconButton>
                      <HelpIcon/>
                    </IconButton>
                  </Tooltip>
                ) : null}
              </span>
            </Grid>
          );
        }
      },];
  };

  onDelete = (policyHolderUser) => {
    const {intl, coreConfirm, deletePolicyHolderUser} = this.props;
    let confirm = () => coreConfirm(formatMessageWithValues(intl, "policyHolder", "policyHolderUser.dialog.delete.title", {
      user: policyHolderUser.user.username,
    }), formatMessage(intl, "policyHolder", "dialog.delete.message"));
    let confirmedAction = () => {
      deletePolicyHolderUser(policyHolderUser, formatMessageWithValues(intl, "policyHolder", "DeletePolicyHolderUser.mutationLabel", {
        user: policyHolderUser.user.username,
        policyHolder: `${policyHolderUser.policyHolder.code} - ${policyHolderUser.policyHolder.tradeName}`,
      }).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH));
      this.setState({toDelete: policyHolderUser.id});
    };
    this.setState({confirmedAction}, confirm);
  };

  isDeletedFilterEnabled = (policyHolderUser) => policyHolderUser.isDeleted;

  render() {
    const {
      intl,
      fetchingPolicyHoldersUnpaid,
      fetchedPolicyHoldersUnpaid,
      errorPolicyHoldersUnpaid,
      predefinedPolicyHolderId,
      policyHoldersUnpaid,
      classes,
    } = this.props;

    return (
      <Grid container>
        <Grid item xs={12} className={classes.item}>
          <Searcher
            module="policyHolder"
            fetch={this.fetch}
            items={policyHoldersUnpaid}
            itemsPageInfo={0}
            fetchingItems={fetchingPolicyHoldersUnpaid}
            fetchedItems={fetchedPolicyHoldersUnpaid}
            errorItems={errorPolicyHoldersUnpaid}
            tableTitle={formatMessage(intl, "policyHolder", "policyholder.unpdaidDeclaration.title")}
            filtersToQueryParams={this.filtersToQueryParams}
            headers={this.headers}
            itemFormatters={this.itemFormatters}
            sorts={this.sorts}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            defaultPageSize={DEFAULT_PAGE_SIZE}
            defaultFilters={this.defaultFilters()}
            FilterExt={predefinedPolicyHolderId}
            onDoubleClick={(policyHolder) => this.onDoubleClick(policyHolder)}
          />
          <AppliedPenaltiesSearcher policyHoldersUnpaid={policyHoldersUnpaid}/>
          <SanctionOpenSearcher policyHoldersUnpaid={policyHoldersUnpaid}/>
        </Grid>
        <Grid item xs={12}>
          <UnlockPaymentDetails
            policyHoldersUnpaid={policyHoldersUnpaid}
            policyHolderId={this.props.policyHolderId}
          />
        </Grid>
      </Grid>);
  }
}

const mapStateToProps = (state, props) => ({
  fetchingPolicyHoldersUnpaid: state.policyHolder.fetchingPolicyHoldersUnpaid,
  fetchedPolicyHoldersUnpaid: state.policyHolder.fetchedPolicyHoldersUnpaid,
  errorPolicyHoldersUnpaid: state.policyHolder.errorPolicyHoldersUnpaid,
  submittingMutation: state.policyHolder.submittingMutation,
  mutation: state.policyHolder.mutation,
  confirmed: state.core.confirmed,
  policyHoldersUnpaid: state.policyHolder.policyHoldersUnpaid,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchUnpaidDeclaration, deletePolicyHolderUser, journalize, coreConfirm,
  }, dispatch);
};

export default withModulesManager(withHistory(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(UnpaidDeclarationSearcher))))));
