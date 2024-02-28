import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Grid } from "@material-ui/core";
import {
  withModulesManager,
  TextInput,
  ProgressOrError,
} from "@openimis/fe-core";

import { fetchPolicyHolderCode } from "../actions";
import _debounce from "lodash/debounce";

const INIT_STATE = {
  search: null,
  selected: null,
};

class CamuCodePicker extends Component {
  state = INIT_STATE;

  constructor(props) {
    super(props);
    this.chfIdMaxLength = props.modulesManager.getConf(
      "fe-insuree",
      "insureeForm.chfIdMaxLength",
      12
    );
  }

  componentDidMount() {
    if (this.props.value) {
      this.setState((state, props) => ({
        // search: !!props.value ? props.value.chfId : null,
        search: !!props.value ? props.value.code : null,
        selected: props.value,
      }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.reset !== this.props.reset) {
      this.setState((state, props) => ({
        ...INIT_STATE,
        // search: !!props.value ? props.value.chfId : null,
        search: !!props.value ? props.value.code : null,
        selected: props.value,
      }));
    } else if (this.props?.policyholderData !== null) {
      if (
        !_.isEqual(
          prevProps?.policyholderData?.code,
          this.props?.policyholderData?.code
        )
      ) {
        this.props.onChange(
          this.props?.policyholderData?.code,
          this.formatInsuree(this.props.policyholderData)
        );
        this.setState((state, props) => ({
         
          selected: this.props.policyholderData,
        }));
      }
    } else if (!_.isEqual(prevProps.value, this.props.value)) {
      this.setState((state, props) => ({
        // search: !!props.value ? props.value.chfId : this.state.search,
        search: !!props.value ? props.value.code : this.state.search,
        selected: props.value,
      }));
    }
  }

  fetch = (camuCode) => {
    console.log("camuCode", camuCode);
    this.setState(
      {
        search: camuCode,
        selected: null,
      },
      (e) =>
        this.props.fetchPolicyHolderCode(this.props.modulesManager, camuCode)
    );
  };

  debouncedSearch = _debounce(
    this.fetch,
    this.props.modulesManager.getConf("fe-insuree", "debounceTime", 800)
  );

  formatInsuree(policyholder) {
    console.log("format350", policyholder);
    if (!policyholder) return null;
    return `${policyholder.tradeName}`;
  }

  render() {
    const { readOnly = false, required = false, policyholderData } = this.props;
    console.log(
      "this.state.selected",
      this.props,
      "chcek",
      this.state.selected
    );
    return (
      <Grid container>
        <Grid item xs={12}>
          <TextInput
            readOnly={readOnly}
            autoFocus={true}
            module="policyHolder"
            label="exception.camuCode"
            value={this.state.search}
            onChange={(v) => this.debouncedSearch(v)}
            // inputProps={{
            //   "maxLength": this.chfIdMaxLength,
            // }}
            required={required}
          />
        </Grid>
        <Grid item xs={12}>
          <ProgressOrError
            progress={this.props.fetchingPolicyHolder}
            error={this.props.errorPolicyHolder}
          />
          {!this.props.fetchingPolicyHolder && (
            <TextInput
              readOnly={true}
              module="policyHolder"
              label="policyHolder.tradeName"
              // value={policyholderData && policyholderData?.tradeName}
              value={this.formatInsuree(this.state.selected)}
            />
          )}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state, props) => ({
  fetchingPolicyHolder: state.policyHolder.fetchingPolicyHolder,
  errorPolicyHolder: state.policyHolder.errorPolicyHolder,
  fetchedPolicyHolder: state.policyHolder.fetchedPolicyHolder,
  policyholderData: state.policyHolder.policyHolder,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchPolicyHolderCode }, dispatch);
};

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(CamuCodePicker)
);
