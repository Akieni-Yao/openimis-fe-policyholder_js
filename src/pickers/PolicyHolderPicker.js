import React, { Component } from "react";
import { FormattedMessage, SelectInput, decodeId } from "@openimis/fe-core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchPickerPolicyHolders } from "../actions";

class PolicyHolderPicker extends Component {
    componentDidMount() {
        const { withDeleted = false } = this.props;
        this.props.fetchPickerPolicyHolders(withDeleted ? [] : ["isDeleted: false"]);
    }

    render() {
        const { value, onChange, required = false, withNull = false, nullLabel = null,
            withLabel = true, readOnly = false, policyHolders } = this.props;
        let options = [
            ...policyHolders.map(v => ({
                value: v,
                label: `${v.code} - ${v.tradeName}`
            }))
        ];
        if (withNull) {
            options.unshift({
                value: null,
                label: nullLabel || <FormattedMessage module="policyHolder" id="policyHolder.emptyLabel" />
            })
        }
        return (
            <SelectInput
                module="policyHolder"
                label={withLabel ? "policyHolder" : null}
                required={required}
                options={options}
                value={!!value ? value : null}
                onChange={onChange}
                readOnly={readOnly}
            />
        )
    }
}

const mapStateToProps = (state) => ({
    policyHolders: state.policyHolder.policyHolders.map(({ id: encodedId, ...other }) => ({
        id: decodeId(encodedId),
        ...other,
    })),
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchPickerPolicyHolders }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(PolicyHolderPicker);
