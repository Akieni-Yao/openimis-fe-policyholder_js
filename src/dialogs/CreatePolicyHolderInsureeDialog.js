import React, { Component, Fragment } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import AddIcon from "@material-ui/icons/Add";
import {
    FormattedMessage,
    formatMessageWithValues,
    PublishedComponent,
    decodeId,
    Contributions,
    TextInput
} from "@openimis/fe-core";
import { Fab, Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { createPolicyHolderInsuree } from "../actions";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PolicyHolderContributionPlanBundlePicker from "../pickers/PolicyHolderContributionPlanBundlePicker";
import {
    ZERO,
    MAX_CLIENTMUTATIONLABEL_LENGTH,
    POLICYHOLDERINSUREE_CALCULATION_CONTRIBUTION_KEY,
    POLICYHOLDERINSUREE_CLASSNAME,
    RIGHT_CALCULATION_WRITE
} from "../constants";

const styles = theme => ({
    item: theme.paper.item
});

class CreatePolicyHolderInsureeDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            policyHolderInsuree: {},
            jsonExtValid: true
        }
    }

    handleOpen = () => {
        this.setState((_, props) => ({
            open: true,
            policyHolderInsuree: {
                policyHolder: props.policyHolder,
                policy: {}
            },
            jsonExtValid: true
        }));
    };

    handleClose = () => {
        this.setState({ open: false, policyHolderInsuree: {} });
    };

    handleSave = () => {
        const { intl, policyHolder, onSave, createPolicyHolderInsuree } = this.props;
        createPolicyHolderInsuree(
            this.state.policyHolderInsuree,
            formatMessageWithValues(intl, "policyHolder", "CreatePolicyHolderInsuree.mutationLabel", {
                code: policyHolder.code,
                tradeName: policyHolder.tradeName
            }).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
        );
        onSave();
        this.handleClose();
    };

    updateAttribute = (attribute, value) => {
        this.setState(state => ({
            policyHolderInsuree: {
                ...state.policyHolderInsuree,
                [attribute]: value
            }
        }));
    }

    canSave = () => {
        const { policyHolderInsuree, jsonExtValid } = this.state;
        return !!policyHolderInsuree.policyHolder &&
            !!policyHolderInsuree.insuree &&
            !!policyHolderInsuree.contributionPlanBundle &&
            !!policyHolderInsuree.dateValidFrom &&
            !!jsonExtValid;
    }

    setJsonExtValid = (valid) => this.setState({ jsonExtValid: !!valid });

    render() {
        const { intl, classes } = this.props;
        const { open, policyHolderInsuree } = this.state;
        return (
            <Fragment>
                <Fab
                    size="small"
                    color="primary"
                    onClick={this.handleOpen}>
                    <AddIcon />
                </Fab>
                <Dialog open={open} onClose={this.handleClose}>
                    <DialogTitle>
                        <FormattedMessage module="policyHolder" id="policyHolderInsuree.createPolicyHolderInsuree" />
                    </DialogTitle>
                    <DialogContent>
                        <Grid container direction="column" className={classes.item}>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="insuree.InsureeChfIdPicker"
                                    required
                                    value={!!policyHolderInsuree.insuree && policyHolderInsuree.insuree}
                                    onChange={v => this.updateAttribute('insuree', v)}
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PolicyHolderContributionPlanBundlePicker
                                    withNull={true}
                                    required
                                    policyHolderId={!!policyHolderInsuree.policyHolder && decodeId(policyHolderInsuree.policyHolder.id)}
                                    value={!!policyHolderInsuree.contributionPlanBundle && policyHolderInsuree.contributionPlanBundle}
                                    onChange={v => this.updateAttribute('contributionPlanBundle', v)}
                                />
                            </Grid>
                            <Contributions
                                contributionKey={POLICYHOLDERINSUREE_CALCULATION_CONTRIBUTION_KEY}
                                intl={intl}
                                className={POLICYHOLDERINSUREE_CLASSNAME}
                                entity={policyHolderInsuree}
                                requiredRights={[RIGHT_CALCULATION_WRITE]}
                                value={!!policyHolderInsuree.jsonExt && policyHolderInsuree.jsonExt}
                                onChange={this.updateAttribute}
                                gridItemStyle={classes.item}
                                setJsonExtValid={this.setJsonExtValid}
                            />
                            <Grid item className={classes.item}>
                                <TextInput
                                    module="insuree"
                                    label="Insuree.employee_number"
                                    required={false}
                                    // readOnly={readOnly}
                                    value={!!policyHolderInsuree && !!policyHolderInsuree?.employerNumber ? policyHolderInsuree?.employerNumber : ""}
                                    // // onChange={(v) => {
                                    //   this.updateExts("employee_number", v);
                                    // }}
                                    onChange={(v) => this.updateAttribute("employerNumber", v)}
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="core.DatePicker"
                                    module="policyHolder"
                                    label="dateValidFrom"
                                    required
                                    onChange={v => this.updateAttribute('dateValidFrom', v)}
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="core.DatePicker"
                                    module="policyHolder"
                                    label="dateValidTo"
                                    onChange={v => this.updateAttribute('dateValidTo', v)}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} variant="outlined">
                            <FormattedMessage module="policyHolder" id="dialog.cancel" />
                        </Button>
                        <Button onClick={this.handleSave} disabled={!this.canSave()} variant="contained" color="primary" autoFocus>
                            <FormattedMessage module="policyHolder" id="dialog.replace" />
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createPolicyHolderInsuree }, dispatch);
};

export default injectIntl(withTheme(withStyles(styles)(connect(null, mapDispatchToProps)(CreatePolicyHolderInsureeDialog))));
