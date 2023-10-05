import React, { Component } from "react"
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { withModulesManager, formatMessage, TextInput, PublishedComponent, decodeId } from "@openimis/fe-core";
import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { GREATER_OR_EQUAL_LOOKUP, LESS_OR_EQUAL_LOOKUP, STARTS_WITH_LOOKUP, DATE_TO_DATETIME_SUFFIX } from "../constants"
import PolicyHolderContributionPlanBundlePicker from "../pickers/PolicyHolderContributionPlanBundlePicker";

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
        const { intl, classes, onChangeFilters, policyHolder } = this.props;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={3} className={classes.item}>
                    <TextInput
                        module="policyHolder" 
                        label="insureeCHFID"
                        value={this._filterValue('chfId')}
                        onChange={v => this._onChangeStringFilter('insuree_ChfId', v, STARTS_WITH_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PolicyHolderContributionPlanBundlePicker
                        withNull
                        nullLabel={formatMessage(intl, "policyHolder", "policyHolderContributionPlanBundle.any")}
                        policyHolderId={!!policyHolder && decodeId(policyHolder.id)}
                        value={this._filterValue('contributionPlanBundle_Id')}
                        onChange={v => onChangeFilters([{
                            id: 'contributionPlanBundle_Id',
                            value: v,
                            filter: `contributionPlanBundle_Id: "${!!v && decodeId(v.id)}"`
                        }])}
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
                            color="primary"
                            onChange={event => this._onChangeFilter('isDeleted', event.target.checked)}
                            name="isDeleted" 
                        />}
                        label={formatMessage(intl, "policyHolder", "policyHolderInsuree.isDeleted")}
                    />
                </Grid>
            </Grid>
        )
    }
}

const mapStateToProps = state => ({
    policyHolder: !!state.policyHolder.policyHolder ? state.policyHolder.policyHolder : null
});

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, null)(PolicyHolderInsureeFilter)))));
