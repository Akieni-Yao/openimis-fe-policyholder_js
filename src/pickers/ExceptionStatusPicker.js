import { ConstantBasedPicker } from "@openimis/fe-core";
import React, { Component } from "react";
import { EXCEPTION_STATUS } from "../constants";

class ExceptionStatusPicker extends Component {
  render() {
    return (
      <ConstantBasedPicker
        module="policyHolder"
        label="exception.exceptionStatus"
        constants={EXCEPTION_STATUS}
        {...this.props}
      />
    );
  }
}

export default ExceptionStatusPicker;
