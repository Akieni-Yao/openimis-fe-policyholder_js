import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { EXCEPTION_STATUS } from "../constants";

class ExceptionStatusPicker extends Component {
  render() {
    return (
      <ConstantBasedPicker
        module="policyHolder"
        label="Exception Status"
        constants={EXCEPTION_STATUS}
        {...this.props}
      />
    );
  }
}

export default ExceptionStatusPicker;
