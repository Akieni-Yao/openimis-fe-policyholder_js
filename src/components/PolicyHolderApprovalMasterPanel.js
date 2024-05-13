import React, { Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid, FormControlLabel, Checkbox, Typography, Divider, Tooltip, IconButton } from "@material-ui/core";
import { People as PeopleIcon } from "@material-ui/icons";
import {
    historyPush,
    withHistory,
    withModulesManager,
    TextInput,
    formatMessage,
    PublishedComponent,
    FormattedMessage,
    FormPanel,
    Contributions,
    ConstantBasedPicker,
} from "@openimis/fe-core";
import PolicyholderDetailPageForm from "./PolicyholderDetailPageForm";
const APPROVAL_DOCUMENTS_CONTRIBUTION_KEY = "insuree.Documents.Panels";
const POLICYHOLDER_DOCUMENTS_KEY = "policyholder.policyholder.documents"

const styles = (theme) => ({
    tableTitle: theme.table.title,
    item: theme.paper.item,
    fullHeight: {
        height: "100%",
    },
    documentMargin: {
        marginTop: "1.3rem",
    },
});

class PolicyHolderApprovalMasterPanel extends FormPanel {
    // The one from FormPanel does not allow jsonExt patching
    updateExts = (updates) => {
        let data = { ...this.state.data };
        if (data["jsonExt"] === undefined) {
            data["jsonExt"] = updates;
        } else {
            data["jsonExt"] = { ...updates };
        }
        this.props.onEditedChanged(data);
    };

    updateContribution = (contributionKey, contributionValue) => {
        let contributionAttribute = this.getAttribute("contribution");

        if (!contributionAttribute) {
            contributionAttribute = {};
        }
        contributionAttribute[contributionKey] = contributionValue;
        this.updateAttribute("contribution", contributionAttribute);
    };

    render() {
        const { intl, classes, edited, openFamilyButton = false, readOnly, overview } = this.props;
        return (
            <Fragment>
                <Grid container className={classes.tableTitle}>
                    <Grid item>
                        <Grid container align="center" justify="center" direction="column" className={classes.fullHeight}></Grid>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container className={classes.item} >
                    <Grid item xs={12}>
                        <PolicyholderDetailPageForm edited={edited} />
                    </Grid>
                    <Divider />
                    <Grid item xs={6}>
                        <Grid container alignItems="center" direction="row" className={`${classes.paperHeader} ${classes.documentMargin}`}>
                            <Grid item xs={12}>
                                <Typography className={classes.tableTitle}>
                                    <FormattedMessage module="insuree" id="Insuree.documentTitle" />
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                        </Grid>
                        <Contributions
                            {...this.props}
                            edited={edited}
                            updateAttribute={this.updateAttribute}
                            contributionKey={POLICYHOLDER_DOCUMENTS_KEY}
                        />

                        {/* <div>PolicyHolderGeneralInfoPanel</div> */}
                    </Grid>
                </Grid>
            </Fragment>
        );
    }
}

export default withModulesManager(withHistory(injectIntl(withTheme(withStyles(styles)(PolicyHolderApprovalMasterPanel)))));
