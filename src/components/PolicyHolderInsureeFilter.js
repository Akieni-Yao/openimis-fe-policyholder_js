import React, { Component } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessage, TextInput, PublishedComponent } from "@openimis/fe-core";
import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { GREATER_OR_EQUAL_LOOKUP, LESS_OR_EQUAL_LOOKUP, STARTS_WITH_LOOKUP, DATE_TO_DATETIME_SUFFIX } from "../constants"

const styles = theme => ({
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    }
});

class PolicyHolderInsureeFilter extends Component {
    _filterValue = k => {
        const { filters } = this.props;
        return !!filters[k] ? filters[k].value : null
    }

    _onChangeFilter = (k, v) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: `${k}: ${v}`
            }
        ])
    }

    _onChangeStringFilter = (k, v, lookup = null) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: !!lookup
                    ? `${k}_${lookup}: "${v}"`
                    : `${k}: "${v}"`
            }
        ])
    }

    _onChangeDateFilter = (k, v, lookup) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: `${k}_${lookup}: "${v}${DATE_TO_DATETIME_SUFFIX}"`
            }
        ])
    }

    render() {
        const { intl, classes } = this.props;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={3} className={classes.item}>
                    <TextInput
                        module="claim" 
                        label="ClaimFilter.insureeCHFID"
                        value={this._filterValue('chfId')}
                        onChange={v => this._onChangeStringFilter('insuree_ChfId', v, STARTS_WITH_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubRef="contributionPlan.ContributionPlanBundlePicker"
                        withNull={true}
                        nullLabel={formatMessage(intl, "contributionPlan", "any")}
                        value={this._filterValue('contributionPlanBundle_Id')}
                        onChange={v => this._onChangeStringFilter('contributionPlanBundle_Id', v)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        module="policyHolder"
                        label="dateValidFrom"
                        value={this._filterValue('dateValidFrom')}
                        onChange={v => this._onChangeDateFilter('dateValidFrom', v, GREATER_OR_EQUAL_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        module="policyHolder"
                        label="dateValidTo"
                        value={this._filterValue('dateValidTo')}
                        onChange={v => this._onChangeDateFilter('dateValidTo', v, LESS_OR_EQUAL_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <FormControlLabel
                        control={<Checkbox 
                            checked={!!this._filterValue('isDeleted')}
                            onChange={event => this._onChangeFilter('isDeleted', event.target.checked)}
                            name="isDeleted" 
                        />}
                        label={formatMessage(intl, "policyHolder", "PolicyHolderInsurees.isDeleted")}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(PolicyHolderInsureeFilter))));
