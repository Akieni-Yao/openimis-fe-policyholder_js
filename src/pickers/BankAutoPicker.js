import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import {
    useModulesManager,
    useTranslations,
    Autocomplete,
    useGraphqlQuery,
} from "@openimis/fe-core";


const BankPicker = (props) => {
    const {
        onChange,
        readOnly,
        required,
        withLabel = true,
        withPlaceholder,
        value,
        label,
        filterOptions,
        filterSelectedOptions,
        multiple,
       
    } = props;
    const userHealthFacilityId = useSelector((state) =>
        state?.loc?.userHealthFacilityFullPath?.uuid
    );
   
    const modulesManager = useModulesManager();
    const { formatMessage } = useTranslations("location", modulesManager);
    const [searchString, setSearchString] = useState("");
    const { isLoading, data, error } = useGraphqlQuery(
        `
      query Banks {
    banks(first: 10) {
        totalCount
        edgeCount
        edges {
            cursor
            node {
                id
                isDeleted
                jsonExt
                dateCreated
                dateUpdated
                version
                name
                altLangName
                code
                erpId
                journauxId
            }
        }
    }
}
        `,
        {
            search: searchString,
        },
    );

    
    return (
        <Autocomplete
            multiple={multiple}
            required={required}
            // placeholder={placeholder ?? formatMessage("CamuDoctorPicker.placeholder")}
            label={label ?? formatMessage("Bank")}
            error={error}
            withLabel={withLabel}
            withPlaceholder={withPlaceholder}
            readOnly={readOnly}
            options={data?.banks?.edges.map((edge) => edge.node) ?? []}
            isLoading={isLoading}
            value={value}
            getOptionLabel={(option) => `${option.name ? option.name : ""}`}
            onChange={(option) => onChange(option, option ? `${option.name ? option.name : ""}` : null)}
            filterOptions={filterOptions}
            filterSelectedOptions={filterSelectedOptions}
            onInputChange={setSearchString}
        />
    );
};

export default BankPicker;