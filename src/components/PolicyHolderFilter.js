import React, { Component } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessage, TextInput, PublishedComponent } from "@openimis/fe-core";
import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { GREATER_OR_EQUAL_LOOKUP, LESS_OR_EQUAL_LOOKUP, DATE_TO_DATETIME_SUFFIX, CONTAINS_LOOKUP } from "../constants"

const styles = theme => ({
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    }
});

class PolicyHolderFilter extends Component {
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

    _onChangeStringFilter = (k, v, lookup) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: `${k}_${lookup}: "${v}"`
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
        const { intl, classes, filters, onChangeFilters } = this.props;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={2} className={classes.item}>
                    <TextInput
                        module="policyHolder"
                        label="code"
                        value={this._filterValue('code')}
                        onChange={v => this._onChangeStringFilter('code', v, CONTAINS_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <TextInput
                        module="policyHolder"
                        label="tradeName"
                        value={this._filterValue('tradeName')}
                        onChange={v => this._onChangeStringFilter('tradeName', v, CONTAINS_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={8}>
                    <PublishedComponent
                        pubRef="location.DetailedLocationFilter"
                        withNull={true}
                        filters={filters}
                        onChangeFilters={onChangeFilters}
                        anchor="parentLocation"
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubRef="policyHolder.LegalFormPicker"
                        module="policyHolder"
                        label="legalForm"
                        withNull
                        nullLabel={formatMessage(intl, "policyHolder", "any")}
                        value={this._filterValue('legalForm')}
                        onChange={v => this._onChangeFilter('legalForm', v)}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubRef="policyHolder.ActivityCodePicker"
                        module="policyHolder"
                        label="activityCode"
                        withNull
                        nullLabel={formatMessage(intl, "policyHolder", "any")}
                        value={this._filterValue('activityCode')}
                        onChange={v => this._onChangeFilter('activityCode', v)}
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
                            color="primary"
                            checked={!!this._filterValue('isDeleted')}
                            onChange={event => this._onChangeFilter('isDeleted', event.target.checked)}
                            name="isDeleted"
                        />}
                        label={formatMessage(intl, "policyHolder", "isDeleted")}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(PolicyHolderFilter))));
