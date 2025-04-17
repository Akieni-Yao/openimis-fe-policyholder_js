import React, { useState, useEffect } from "react";
import { decodeId, FormattedMessage } from "@openimis/fe-core";
import { connect, useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchPickerPolicyHolders } from "../actions";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";

const PolicyHolderPickerNew = (props) => {
    const [searchString, setSearchString] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(props.value);
    const dispatch = useDispatch();
    const policyHolders = useSelector((state) =>
        state.policyHolder.policyHolders.map(({ id: encodedId, ...other }) => ({
            id: decodeId(encodedId),
            ...other,
        }))
    );

    useEffect(() => {
        if (open) {
            dispatch(fetchPickerPolicyHolders([`first: 10`]));
        }
    }, [open]);

    useEffect(() => {
        if (searchString?.length > 1) {
            dispatch(fetchPickerPolicyHolders([`tradeName_Icontains: "${searchString}"`]));
        }
    }, [searchString]);

    const handleChange = (event, selectedOption) => {
        setSelectedOption(selectedOption);
        props.onChange(selectedOption?.value);
        if (!props.multiple) setOpen(false);
    };

    let options = [
        ...policyHolders.map(v => ({
            value: v,
            label: `${v.code} - ${v.tradeName}`
        }))
    ];
    if (props.withNull) {
        options.push({
            value: null,
            label: props.nullLabel || <FormattedMessage module="policyHolder" id="policyHolder.emptyLabel" />
        });
    }
    return (
        <Autocomplete
            multiple={false}
            options={options}
            getOptionLabel={(option) => option ? `${option?.value?.code ? option?.value?.code : option?.code} - ${option?.value?.tradeName ? option?.value?.tradeName : option?.tradeName}` : ""}
            value={selectedOption} // Use selectedOption state here
            onChange={handleChange}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            renderInput={(params) => <TextField {...params} label="Policy Holder" />}
            onInputChange={(event, newInputValue) => setSearchString(newInputValue)}
        />
    );
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ fetchPickerPolicyHolders }, dispatch);
};

export default connect(null, mapDispatchToProps)(PolicyHolderPickerNew);
