import React, { Component } from "react";
import { PublishedComponent, decodeId } from "@openimis/fe-core";
import { RIGHT_PAYMENT_SEARCH, RIGHT_PORTALPAYMENT_SEARCH } from "../constants"

class PolicyHolderPenaltyandSactionTabLabel extends Component {
    render() {
        return (
            [RIGHT_PAYMENT_SEARCH, RIGHT_PORTALPAYMENT_SEARCH].some((right) => this.props.rights.includes(right)) && (
                <PublishedComponent
                    pubRef="payment.PenaltyTab.label"
                    {...this.props}
                />
            )
        );
    }
}

class PolicyHolderPenaltyandSactionTabPanel extends Component {
    additionalFilter = () => {
        const filter = {
            policyHolder: decodeId(this.props.policyHolder.id)
        };
        return JSON.stringify(filter);
    }

    render() {
        return (
            [RIGHT_PAYMENT_SEARCH, RIGHT_PORTALPAYMENT_SEARCH].some((right) => this.props.rights.includes(right)) &&
            !!this.props.policyHolder.id && (
                <PublishedComponent
                    pubRef="payment.PenaltyTab.panel"
                    additionalFilter={this.additionalFilter()}
                    policyHolder={this.props.policyHolder.id}
                    {...this.props}
                />
            )
        );
    }
}

export {
    PolicyHolderPenaltyandSactionTabLabel,
    PolicyHolderPenaltyandSactionTabPanel
}
