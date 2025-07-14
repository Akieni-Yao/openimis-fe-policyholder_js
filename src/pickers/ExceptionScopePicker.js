import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { EXCEPTION_SCOPE } from "../constants";

class ExceptionScopePicker extends Component {
  render() {
    return (
      <ConstantBasedPicker
        module="policyHolder"
        label="exceptionScope"
        constants={EXCEPTION_SCOPE}
        {...this.props}
      />
    );
  }
}

export default ExceptionScopePicker;
