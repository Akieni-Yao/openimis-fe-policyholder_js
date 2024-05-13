import React, { Component } from "react";
import { injectIntl } from "react-intl";
import {
    formatMessage,
    PublishedComponent,
    decodeId,
    TextInput,
    FormattedMessage,
} from "@openimis/fe-core";
import { Grid, FormControlLabel, Checkbox, Button } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    GREATER_OR_EQUAL_LOOKUP,
    LESS_OR_EQUAL_LOOKUP,
    DATE_TO_DATETIME_SUFFIX,
    STARTS_WITH_LOOKUP,
    CONTAINS_LOOKUP,
} from "../constants";
import PolicyHolderPicker from "../pickers/PolicyHolderPicker";

const styles = (theme) => ({
    form: {
        padding: 0,
    },
    item: {
        padding: theme.spacing(1),
    },
    primary: {
        background: "green",
        color: "#fff",
    },
});

class PolicyHolderRequestSearcherPane extends Component {
    state = {
        reset: 0,
        onSearch: false,
        filterState: {},
    };
    componentDidMount() {
        /**
         * @see FilterExt prop can pass @see PolicyHolder entity id
         * to disable filtering by @see PolicyHolder if only @see PolicyHolderUser entities
         * with a specific @see PolicyHolder assigned are to be displayed
         */
        this.isFilteredByDefaultPolicyHolder = !!this.props.FilterExt;
    }
    _regionFilter = (v) => {
        if (!!v) {
            return {
                id: "region",
                value: v,
                filter: `locations_Parent_Parent_Parent_Uuid: "${v.uuid}"`,
            };
        } else {
            return { id: "region", value: null, filter: null };
        }
    };
    _filterValue = (k) => {
        const { filters } = this.props;
        const { filterState } = this.state;
        return !!filterState[k]
            ? filterState[k].value
            : !!filters[k]
                ? filters[k].value
                : null;
        // return !!filters[k] ? filters[k].value : null;
    };

    _onChangeOtherFilter = (k, v, lookup) => {
        this.setState((prev) => ({
            ...prev,
            filterState: {
                ...prev.filterState,
                [k]: {
                    id: k,
                    value: v,
                    filter: `${k}: "${v}"`,
                },
            },
        }));
    };
    _onChangeStringFilter = (k, v, lookup) => {
        this.setState((prev) => ({
            ...prev,
            filterState: {
                ...prev.filterState,
                [k]: {
                    id: k,
                    value: v,
                    filter: `${k}_${lookup}: "${v}"`,
                },
            },
        }));
    };
    onClickSearch = () => {
        const filterStateValues = Object.values(this.state.filterState);
        this.props.onChangeFilters(filterStateValues);
        // this.props.onChangeFilters([this.state.filterState]);
    };
    onClickClear = () => {
        this.setState({
            filterState: {},
        });
        this.props.reset();
    };
    render() {
        const { intl, classes, onChangeFilters, filters } = this.props;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={3} className={classes.item}>
                    <TextInput
                        module="policyHolder"
                        label="Request No."
                        value={
                            !!this._filterValue("requestNumber") ? this._filterValue("requestNumber") : ""
                        }
                        onChange={(v) =>
                            this._onChangeStringFilter("requestNumber", v, STARTS_WITH_LOOKUP)
                        }
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <TextInput
                        module="policyHolder"
                        label="tradeName"
                        value={!!this._filterValue("tradeName") ? this._filterValue("tradeName") : ""}
                        onChange={(v) =>
                            this._onChangeStringFilter("tradeName", v, STARTS_WITH_LOOKUP)
                        }
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <TextInput
                        module="policyHolder"
                        label="contact Name"
                        value={!!this._filterValue("contactName") ? this._filterValue("contactName") : ""}
                        onChange={v => this._onChangeOtherFilter('contactName', v)}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <TextInput
                        module="policyHolder"
                        label="Short Name"
                        value={!!this._filterValue("shortName") ? this._filterValue("shortName") : ""}
                        onChange={v => this._onChangeOtherFilter('shortName', v)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="policyHolder.RequestStatusPicker"
                        module="policyHolder"
                        label="policyHolder.Request Status"
                        nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
                        // withNull={true}
                        value={!!this._filterValue("status") ? this._filterValue("status") : ""}
                        onChange={v => this._onChangeOtherFilter('status', v)}
                    />
                </Grid>
                <Grid item xs={1} className={classes.item}>
                    <Button
                        variant="contained"
                        className={classes.primary}
                        onClick={this.onClickSearch}
                    >
                        <FormattedMessage
                            module="policyHolder"
                            id="declarationFilter.search"
                        />
                    </Button>
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={this.onClickClear}
                    >
                        <FormattedMessage
                            module="policyHolder"
                            id="declarationFilter.clear"
                        />
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

export default injectIntl(
    withTheme(withStyles(styles)(PolicyHolderRequestSearcherPane))
);
