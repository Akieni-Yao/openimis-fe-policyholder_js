import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { REQUEST_STATUS } from "../constants";

class RequestStatusPicker extends Component {
  render() {
    return (
      <ConstantBasedPicker
        module="policyHolder"
        label="Request Status"
        constants={REQUEST_STATUS}
        {...this.props}
      />
    );
  }
}

export default RequestStatusPicker;
