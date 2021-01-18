import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import { FormattedMessage, formatMessage, formatMessageWithValues, PublishedComponent } from "@openimis/fe-core";
import { Tooltip, Grid, IconButton } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { updatePolicyHolderInsuree, replacePolicyHolderInsuree } from "../actions";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const styles = theme => ({
    item: theme.paper.item
});

class UpdatePolicyHolderInsureeDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            policyHolderInsuree: props.policyHolderInsuree
        }
    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleSave = () => {
        const { intl, policyHolder, isReplacing = false,
            updatePolicyHolderInsuree, replacePolicyHolderInsuree } = this.props;
        if (isReplacing) {
            replacePolicyHolderInsuree(
                this.state.policyHolderInsuree,
                formatMessageWithValues(
                    intl,
                    "policyHolder",
                    "ReplacePolicyHolderInsuree.mutationLabel",
                    {
                        code: policyHolder.code,
                        tradeName: policyHolder.tradeName
                    }
                )
            );
        } else {
            updatePolicyHolderInsuree(
                this.state.policyHolderInsuree,
                formatMessageWithValues(
                    intl,
                    "policyHolder",
                    "UpdatePolicyHolderInsuree.mutationLabel",
                    {
                        code: policyHolder.code,
                        tradeName: policyHolder.tradeName
                    }
                )
            );
        }
        this.props.onSave();
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
        const { policyHolderInsuree } = this.state;
        return !!policyHolderInsuree.policyHolder
            && !!policyHolderInsuree.insuree
            && !!policyHolderInsuree.contributionPlanBundle
            && !!policyHolderInsuree.dateValidFrom;
    }

    render() {
        const { intl, classes, disabled, isReplacing = false } = this.props;
        const { open, policyHolderInsuree } = this.state;
        return (
            <Fragment>
                {isReplacing ? (
                    <Tooltip title={formatMessage(intl, "policyHolder", "replaceButton.tooltip")}>
                        <div>
                            <IconButton
                                onClick={this.handleOpen}
                                disabled={disabled}>
                                <NoteAddIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                ) : (
                    <Tooltip title={formatMessage(intl, "policyHolder", "editButton.tooltip")}>
                        <div>
                            <IconButton
                                onClick={this.handleOpen}
                                disabled={disabled}>
                                <EditIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                )}
                <Dialog open={open} onClose={this.handleClose}>
                    <DialogTitle>
                        {isReplacing ? (
                            <FormattedMessage module="policyHolder" id="policyHolderInsuree.replaceDialog.title" />
                        ) : (
                            <FormattedMessage module="policyHolder" id="policyHolderInsuree.editDialog.title" />
                        )}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container direction="column" className={classes.item}>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="insuree.InsureeChfIdPicker"
                                    value={!!policyHolderInsuree.insuree && policyHolderInsuree.insuree}
                                    readOnly
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="contributionPlan.ContributionPlanBundlePicker"
                                    required
                                    value={!!policyHolderInsuree.contributionPlanBundle && policyHolderInsuree.contributionPlanBundle}
                                    onChange={v => this.updateAttribute('contributionPlanBundle', v)}
                                    readOnly={!isReplacing}
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="core.DatePicker"
                                    module="policyHolder"
                                    label="dateValidFrom"
                                    required
                                    value={!!policyHolderInsuree.dateValidFrom && policyHolderInsuree.dateValidFrom}
                                    onChange={v => this.updateAttribute('dateValidFrom', v)}
                                    readOnly={!isReplacing}
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="core.DatePicker"
                                    module="policyHolder"
                                    label="dateValidTo"
                                    value={!!policyHolderInsuree.dateValidTo && policyHolderInsuree.dateValidTo}
                                    onChange={v => this.updateAttribute('dateValidTo', v)}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} variant="outlined">
                            <FormattedMessage module="policyHolder" id="policyHolderInsuree.dialog.cancel" />
                        </Button>
                        <Button onClick={this.handleSave} disabled={!this.canSave()} variant="contained" color="primary" autoFocus>
                            {isReplacing ? (
                                <FormattedMessage module="policyHolder" id="policyHolderInsuree.dialog.replace" />
                            ) : (
                                <FormattedMessage module="policyHolder" id="policyHolderInsuree.dialog.update" />
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ updatePolicyHolderInsuree, replacePolicyHolderInsuree }, dispatch);
};

export default injectIntl(withTheme(withStyles(styles)(connect(null, mapDispatchToProps)(UpdatePolicyHolderInsureeDialog))));
