import React, { Component } from "react"
import { injectIntl } from 'react-intl';
import {
    formatMessage,
    PublishedComponent,
    decodeId,
} from "@openimis/fe-core";
import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    GREATER_OR_EQUAL_LOOKUP,
    LESS_OR_EQUAL_LOOKUP,
    DATE_TO_DATETIME_SUFFIX
} from "../constants";
import PolicyHolderPicker from "../pickers/PolicyHolderPicker";

const styles = theme => ({
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    }
});

class PolicyHolderUserFilter extends Component {
    componentDidMount() {
        /**
         * @see FilterExt prop can pass @see PolicyHolder entity id
         * to disable filtering by @see PolicyHolder if only @see PolicyHolderUser entities
         * with a specific @see PolicyHolder assigned are to be displayed
         */
        this.isFilteredByDefaultPolicyHolder = !!this.props.FilterExt;
    }

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

    _onChangeStringFilter = (k, v) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: `${k}: "${v}"`
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
        const { intl, classes, onChangeFilters } = this.props;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubRef="admin.UserPicker"
                        module="policyHolder"
                        value={this._filterValue("user_Id")}
                        onChange={v => onChangeFilters([{
                            id: "user_Id",
                            value: v,
                            filter: `user_Id: "${!!v && decodeId(v.id)}"`
                        }])}
                        check={"check"}
                    />
                </Grid>
                {!this.isFilteredByDefaultPolicyHolder && (
                    <Grid item xs={3} className={classes.item}>
                        <PolicyHolderPicker
                            withNull
                            nullLabel={formatMessage(intl, "policyHolder", "any")}
                            value={this._filterValue("policyHolder_Id")}
                            onChange={v => onChangeFilters([{
                                id: "policyHolder_Id",
                                value: v,
                                filter: `policyHolder_Id: "${!!v && v.id}"`
                            }])}
                        />
                    </Grid>
                )}
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        module="policyHolder"
                        label="policyHolderUser.dateValidFrom"
                        value={this._filterValue("dateValidFrom")}
                        onChange={v => this._onChangeDateFilter("dateValidFrom", v, GREATER_OR_EQUAL_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        module="policyHolder"
                        label="policyHolderUser.dateValidTo"
                        value={this._filterValue("dateValidTo")}
                        onChange={v => this._onChangeDateFilter("dateValidTo", v, LESS_OR_EQUAL_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <FormControlLabel
                        control={<Checkbox 
                            checked={!!this._filterValue("isDeleted")}
                            color="primary"
                            onChange={event => this._onChangeFilter("isDeleted", event.target.checked)}
                            name="isDeleted" 
                        />}
                        label={formatMessage(intl, "policyHolder", "policyHolderUser.isDeleted")}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default injectIntl(withTheme(withStyles(styles)(PolicyHolderUserFilter)));
