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

class DeclarationSearcherFilter extends Component {
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

  _filterValueDeclared = (k) => {
    const { filters } = this.props;
    return !!filters[k] ? filters[k].value : null;
    // return !!filters[k] ? filters[k].value : null;
  };

  // _onChangeRegion = (v, s) => {
  //   this.setState((prev) => ({
  //     ...prev,
  //     filterState: [this._regionFilter(v)],
  //   }));
  //   this.setState((state) => ({
  //     reset: state.reset + 1,
  //   }));
  // };

  _onChangeRegion = (v, s) => {
    const regionFilter = this._regionFilter(v);

    this.setState((prev) => ({
      ...prev,
      filterState: {
        ...prev.filterState,
        [regionFilter.id]: regionFilter,
      },
      reset: prev.reset + 1,
    }));
  };

  _onChangeFilter = (k, v) => {
    const updatedFilters = [
      {
        id: "declared",
        value: k === "declared" ? v : !v,
        filter: `declared: ${k === "declared" ? v : !v}`,
      },
    ];
    // this.setState({
    //   filterState: {
    //     id: "declared",
    //     value: k === "declared" ? v : !v,
    //     filter: `declared: ${k === "declared" ? v : !v}`,
    //   },
    // });
    this.props.onChangeFilters(updatedFilters);
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

  _onChangeDateFilter = (k, v, lookup) => {
    // this.props.onChangeFilters([
    //   {
    //     id: k,
    //     value: v,
    //     filter: `${k}_${lookup}: "${v}${DATE_TO_DATETIME_SUFFIX}"`,
    //   },
    // ]);
    this.setState((prev) => ({
      filterState: {
        ...prev.filterState,
        [k]: {
          id: k,
          value: v,
          filter: `${k}_${lookup}: "${v}${DATE_TO_DATETIME_SUFFIX}"`,
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
          <PublishedComponent
            pubRef="core.DatePicker"
            module="policyHolder"
            label="declarationFilter.fromMonth"
            value={
              !!this._filterValue("dateContractFrom") &&
              this._filterValue("dateContractFrom")
            }
            format={"MMMM-YYYY"}
            monthtrue
            onChange={(v) => {
              const parsedStartDate = new Date(v);

              parsedStartDate.setDate(1);

              const formattedStartDate = parsedStartDate
                .toISOString()
                .split("T")[0];
              this._onChangeDateFilter(
                "dateContractFrom",
                formattedStartDate,
                GREATER_OR_EQUAL_LOOKUP
              );
            }}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <PublishedComponent
            pubRef="core.DatePicker"
            module="policyHolder"
            label="declarationFilter.toMonth"
            value={this._filterValue("dateContractTo")}
            format={"MMMM-YYYY"}
            monthtrue
            onChange={(v) =>{
              const parsedStartDate = new Date(v);

              // Set the date to the last day of the month
              parsedStartDate.setMonth(parsedStartDate.getMonth() + 1);
              parsedStartDate.setDate(0);

              const formattedEndDate = parsedStartDate
                .toISOString()
                .split("T")[0];
              this._onChangeDateFilter(
                "dateContractTo",
                formattedEndDate,
                LESS_OR_EQUAL_LOOKUP
              )}
            }
          />
        </Grid>
        {!this.isFilteredByDefaultPolicyHolder && (
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="declarationFilter.camuCode"
              value={
                !!this._filterValue("code") ? this._filterValue("code") : ""
              }
              onChange={(v) =>
                this._onChangeStringFilter("code", v, STARTS_WITH_LOOKUP)
              }
            />
          </Grid>
        )}
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="policyHolder"
            label="tradeName"
            value={this._filterValue("tradeName")}
            onChange={(v) =>
              this._onChangeStringFilter("tradeName", v, STARTS_WITH_LOOKUP)
            }
          />
        </Grid>
        <Grid item xs={3}>
          <PublishedComponent
            pubRef="location.RegionPicker"
            value={this._filterValue("region")}
            withNull={true}
            onChange={this._onChangeRegion}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!this._filterValueDeclared("declared")}
                color="primary"
                onChange={(event) =>
                  this._onChangeFilter("declared", event.target.checked)
                }
                name="declared"
              />
            }
            label={formatMessage(
              intl,
              "policyHolder",
              "declarationFilter.declared"
            )}
          />
        </Grid>
        <Grid item xs={2} className={classes.item}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!this._filterValueDeclared("declared")}
                color="primary"
                onChange={(event) =>
                  this._onChangeFilter("isNotDeclared", event.target.checked)
                }
                name="isNotDeclared"
              />
            }
            label={formatMessage(
              intl,
              "policyHolder",
              "declarationFilter.notDeclared"
            )}
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
  withTheme(withStyles(styles)(DeclarationSearcherFilter))
);
