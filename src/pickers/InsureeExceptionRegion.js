import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { INSUREE_EXCEPTION_REASON } from "../constants";

class InsureeExceptionRegion extends Component {
    render() {
        return (
            <ConstantBasedPicker
                module="policyHolder"
                label="insureeexceptionReason"
                constants={INSUREE_EXCEPTION_REASON}
                {...this.props}
            />
        );
    }
}

export default InsureeExceptionRegion;
