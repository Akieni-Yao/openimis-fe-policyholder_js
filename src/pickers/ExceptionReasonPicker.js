import React, { Component } from "react";
import {
  withModulesManager,
  FormattedMessage,
  SelectInput,
  decodeId,
} from "@openimis/fe-core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _ from "lodash";
import {
  fetchPickerPolicyHolderContributionPlanBundles,
  fetchPolicyHolders,
} from "../actions";

class ExceptionReasonPicker extends Component {
  componentDidMount() {
    this.props.fetchExceptionReasons(this.props.modulesManager, [
      "orderBy: -createdAt",
      "first: 100",
    ]);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

  render() {
    const {
      value,
      onChange,
      required = false,
      withNull = false,
      nullLabel = null,
      withLabel = true,
      readOnly = false,
      scope,
    } = this.props;

    let options = this.props.exceptionReasons
      .filter((v) => v.scope === scope)
      .map((v) => ({
        value: decodeId(v.id),
        label: v.reason,
      }));
    if (withNull) {
      options.unshift({
        value: null,
        label: nullLabel || (
          <FormattedMessage module="policyHolder" id="emptyLabel" />
        ),
      });
    }
    return (
      <SelectInput
        module="policyHolder"
        label={withLabel ? "Motif exception" : null}
        required={required}
        options={options}
        value={!!value ? value : null}
        onChange={onChange}
        readOnly={readOnly}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  pickerPolicyHolderContributionPlanBundles:
    state.policyHolder.pickerPolicyHolderContributionPlanBundles,
  exceptionReasons: state.policyHolder.exceptionReasons,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { fetchPickerPolicyHolderContributionPlanBundles, fetchExceptionReasons },
    dispatch
  );
};

export default withModulesManager(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(PolicyHolderContributionPlanBundlePicker)
);
