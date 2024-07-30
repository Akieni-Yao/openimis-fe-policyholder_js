import React, { Component } from "react";
import {
  withModulesManager,
  FormattedMessage,
  SelectInput,
} from "@openimis/fe-core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchPickerPolicyHolderInsurees } from "../actions";
import { decodeId } from "@openimis/fe-core";

class PolicyHolderInsureePicker extends Component {
  componentDidMount() {
    if (!!this.props.policyHolderId) {
      this.props.fetchPickerPolicyHolderInsurees(
        this.props.modulesManager,
        this.queryParams()
      );
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.policyHolderId &&
      this.props.contractId &&
      prevProps.policyHolderId !== this.props.policyHolderId
    ) {
      this.props.fetchPickerPolicyHolderInsurees(
        this.props.modulesManager,
        this.queryParams()
      );
    }
  }

  queryParams = () => {
    const { withDeleted = false } = this.props;
    let params = [
      `policyHolder_Id: "${this.props.policyHolderId}"`,
      `contractId: "${decodeId(this.props.contractId)}"`,
    ];
    if (!withDeleted) {
      params.push("isDeleted: false");
    }
    return params;
  };

  render() {
    const {
      value,
      onChange,
      required = false,
      withNull = false,
      nullLabel = null,
      withLabel = true,
      readOnly = false,
      policyHolderId,
      pickerPolicyHolderInsurees,
    } = this.props;

    let options = !!policyHolderId
      ? [
          ...pickerPolicyHolderInsurees.map((v) => ({
            value: v.insuree,
            label: `${v.insuree.lastName} ${v.insuree.otherNames}`,
          })),
        ]
      : [];
    if (withNull) {
      options.unshift({
        value: null,
        label: nullLabel || (
          <FormattedMessage module="contract" id="emptyLabel" />
        ),
      });
    }
    return (
      <SelectInput
        module="contract"
        label={withLabel ? "insuree" : null}
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
  pickerPolicyHolderInsurees: state.policyHolder.pickerPolicyHolderInsurees,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchPickerPolicyHolderInsurees }, dispatch);
};

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(PolicyHolderInsureePicker)
);
