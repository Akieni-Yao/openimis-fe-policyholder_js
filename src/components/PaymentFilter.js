import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid, Checkbox, FormControlLabel } from "@material-ui/core";
import {
  withModulesManager,
  AmountInput,
  PublishedComponent,
  ControlledField,
  TextInput,
  formatMessage,
} from "@openimis/fe-core";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: 0,
    width: "100%",
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
});

const PAYMENT_FILTER_CONTRIBUTION_KEY = "payment.Filter";

class PaymentFilter extends Component {
  state = {
    showHistory: false,
    showReconciled: false,
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.filters["showHistory"] !== this.props.filters["showHistory"] &&
      !!this.props.filters["showHistory"] &&
      this.state.showHistory !== this.props.filters["showHistory"]["value"]
    ) {
      this.setState((state, props) => ({
        showHistory: props.filters["showHistory"]["value"],
      }));
    }
  }

  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-payment", "debounceTime", 800)
  );

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _onChangeShowHistory = () => {
    let filters = [
      {
        id: "showHistory",
        value: !this.state.showHistory,
        filter: `showHistory: ${!this.state.showHistory}`,
      },
    ];
    this.props.onChangeFilters(filters);
    this.setState((state) => ({
      showHistory: !state.showHistory,
    }));
  };

  _onChangeShowReconciled = () => {
    let filters = [
      {
        id: "showReconciled",
        value: !this.state.showReconciled,
        filter: `showReconciled: ${!this.state.showReconciled}`,
      },
    ];
    this.props.onChangeFilters(filters);
    this.setState((state) => ({
      showReconciled: !state.showReconciled,
    }));
  };

  render() {
    const { classes, filters, onChangeFilters, intl } = this.props;
    return (
      <section className={classes.form}>
        <Grid container>
         
          <ControlledField
            module="contribution"
            id="payment_code"
            field={
              <Grid item xs={3} className={classes.item}>
                <TextInput
                  module="payment"
                  label="Payment Code"
                  name="payment_code"
                  value={this._filterValue("payment_code")}
                  onChange={(v) =>
                    this.debouncedOnChangeFilter([
                      {
                        id: "payment_code",
                        value: v,
                        filter: `paymentCode_Icontains: "${v}"`,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
         </Grid>
      </section>
    );
  }
}

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(PaymentFilter)))
);
