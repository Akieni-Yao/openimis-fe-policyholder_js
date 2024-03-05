import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withModulesManager, TextInput, PublishedComponent, formatMessage } from "@openimis/fe-core";
import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { STARTS_WITH_LOOKUP, DATE_TO_DATETIME_SUFFIX, CONTAINS_LOOKUP } from "../constants";

const styles = (theme) => ({
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
});

class ExceptionInsureeFilter extends Component {
  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters[k] ? filters[k].value : null;
  };

  _onChangeFilter = (k, v) => {
    this.props.onChangeFilters([
      {
        id: k,
        value: v,
        filter: `${k}: ${v}`,
      },
    ]);
  };

  _onChangeStringFilter = (k, v, lookup) => {
    this.props.onChangeFilters([
      {
        id: k,
        value: v,
        filter: `${k}_${lookup}: "${v}"`,
      },
    ]);
  };

  _onChangeDateFilter = (k, v, lookup) => {
    this.props.onChangeFilters([
      {
        id: k,
        value: v,
        filter: `${k}_${lookup}: "${v}${DATE_TO_DATETIME_SUFFIX}"`,
      },
    ]);
  };
  pendingApprovalUser = window.location.href.includes("pendingapproval");
  render() {
    const { intl, classes, onChangeFilters, policyHolder } = this.props;
    return (
      <Grid container className={classes.form}>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="policyHolder"
            label="exception.camuNo"
            value={this._filterValue("chfId")}
            onChange={(v) =>
              this._onChangeStringFilter(" insuree_CamuNumber", v, CONTAINS_LOOKUP)
            }
          />
        </Grid>
        {/* {this.pendingApprovalUser ?
          <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="policyHolder.ExceptionRegionPicker"
              module="policyHolder"
              label="exceptionReason"
              nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
              value={this._filterValue("exceptionReason")}
              onChange={(v) =>
                this._onChangeStringFilter("exceptionReason", v, CONTAINS_LOOKUP)
              }
            />
          </Grid>
          : ""} */}
        {!this.pendingApprovalUser ? <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="policyHolder.ExceptionStatusPicker"
            module="policyHolder"
            label="Exception Status"
            nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
            value={this._filterValue("exceptionStatus")}
            onChange={(v) =>
              this._onChangeStringFilter("status", v, CONTAINS_LOOKUP)
            }
          />
        </Grid> : ""}
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  policyHolder: !!state.policyHolder.policyHolder
    ? state.policyHolder.policyHolder
    : null,
});

export default withModulesManager(
  injectIntl(
    withTheme(
      withStyles(styles)(connect(mapStateToProps, null)(ExceptionInsureeFilter))
    )
  )
);
