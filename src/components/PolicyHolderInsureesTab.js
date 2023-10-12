import React, { Component, Fragment } from "react";
import { Tab, Grid, Typography, Input, Button } from "@material-ui/core";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { formatMessage, PublishedComponent, FormattedMessage, baseApiUrl, apiHeaders } from "@openimis/fe-core";
import {
    RIGHT_POLICYHOLDERINSUREE_CREATE,
    RIGHT_POLICYHOLDERINSUREE_SEARCH,
    RIGHT_PORTALPOLICYHOLDERINSUREE_CREATE,
    RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH
} from "../constants";
import PolicyHolderInsureeSearcher from "./PolicyHolderInsureeSearcher";
import { POLICYHOLDERINSUREE_TAB_VALUE } from "../constants"
import CreatePolicyHolderInsureeDialog from "../dialogs/CreatePolicyHolderInsureeDialog";

class PolicyHolderInsureesTabLabel extends Component {
    render() {
        const { intl, rights, onChange, disabled, tabStyle, isSelected } = this.props;
        return (
            (rights.includes(RIGHT_POLICYHOLDERINSUREE_SEARCH) ||
                rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH)) && (
                <Tab
                    onChange={onChange}
                    disabled={disabled}
                    className={tabStyle(POLICYHOLDERINSUREE_TAB_VALUE)}
                    selected={isSelected(POLICYHOLDERINSUREE_TAB_VALUE)}
                    value={POLICYHOLDERINSUREE_TAB_VALUE}
                    label={formatMessage(intl, "policyHolder", "policyHolderInsuree.label")}
                />
            )
        )
    }
}

class PolicyHolderInsureesTabPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reset: 0
        }
    }

    onSave = () => {
        this.setState(state => ({
            reset: state.reset + 1
        }));
    }

    onUpload = async (event) => {
        const { policyHolder } = this.props;
        const file = event.target.files[0];
        let formData = new FormData();
        formData.append("file", file);

        let encodedCode = encodeURIComponent(policyHolder.code);
        let url_import = `${baseApiUrl}/policyholder/imports/${encodedCode}/policyholderinsurees`;

        try {
          const response = await fetch(url_import, {
            headers: apiHeaders,
            body: formData,
            method: "POST",
            credentials: "same-origin",
          });

          const payload = await response.text();

          if (response.status >= 400) {
            // alert(`Error ${response.status}: ${payload.error}`);
            alert(`Error ${response.status}: ${payload}`);
            return;
          }
          alert(`Success: ${payload}`);
        } catch (error) {
            alert(
              error?.message ??
              formatMessage(
                `An error occurred. Please contact your administrator. ${error?.message}`
              )
            );
        }
    };

    render() {
        const { rights, value, isTabsEnabled, policyHolder, intl } = this.props;
        return (
            (rights.includes(RIGHT_POLICYHOLDERINSUREE_SEARCH) ||
                rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH)) && (
                <PublishedComponent
                    pubRef="policyHolder.TabPanel"
                    module="policyHolder"
                    index={POLICYHOLDERINSUREE_TAB_VALUE}
                    value={value}
                >
                    {isTabsEnabled ? (
                        <Fragment>
                            {(rights.includes(RIGHT_POLICYHOLDERINSUREE_CREATE) ||
                                rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_CREATE)) && (
                                <Grid
                                    container
                                    justifyContent="flex-start"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <Input
                                        required
                                        id="import-button"
                                        style={{ display: 'none' }}
                                        inputProps={{
                                          accept:
                                            ".xls, application/vnd.ms-excel, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                        }}
                                        type="file"
                                        onChange={this.onUpload}
                                    />
                                    <label htmlFor="import-button">
                                        <Button
                                            variant="contained"
                                            component="span"
                                            color="primary"
                                            startIcon={<CloudUploadIcon />}
                                        >
                                            <FormattedMessage
                                                module="policyHolder"
                                                id="policyHolderInsuree.import"
                                            />
                                        </Button>
                                    </label>
                                    <Grid item>
                                        <Typography>
                                            <FormattedMessage
                                                module="policyHolder"
                                                id="policyHolderInsuree.createPolicyHolderInsuree"
                                            />
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <CreatePolicyHolderInsureeDialog
                                            policyHolder={policyHolder}
                                            onSave={this.onSave}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                            <PolicyHolderInsureeSearcher
                                policyHolder={policyHolder}
                                rights={rights}
                                reset={this.state.reset}
                                onSave={this.onSave}
                            />
                        </Fragment>
                    ) : (
                        <FormattedMessage
                            module="policyHolder"
                            id="policyHolderInsuree.tabDisabledError"
                        />
                    )}
                </PublishedComponent>
            )
        );
    }
}

export {
    PolicyHolderInsureesTabLabel,
    PolicyHolderInsureesTabPanel
}
