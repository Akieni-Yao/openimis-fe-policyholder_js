import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { EXCEPTION_REASON } from "../constants";

class ExceptionRegionPicker extends Component {
  render() {
    return (
      <ConstantBasedPicker
        module="policyHolder"
        label="exceptionReason"
        constants={EXCEPTION_REASON}
        {...this.props}
      />
    );
  }
}

export default ExceptionRegionPicker;
