import React, { Component, Fragment } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import EditIcon from "@material-ui/icons/Edit";
import NoteAddIcon from "@material-ui/icons/NoteAdd";
import {
    FormattedMessage,
    formatMessage,
    formatMessageWithValues,
    PublishedComponent,
    decodeId
} from "@openimis/fe-core";
import { IconButton, Grid, Tooltip } from "@material-ui/core";
import PolicyHolderPicker from "../pickers/PolicyHolderPicker";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { updatePolicyHolderUser, replacePolicyHolderUser } from "../actions";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    ZERO,
    MAX_CLIENTMUTATIONLABEL_LENGTH
} from "../constants";
import PolicyHolderPickerNew from "../pickers/PolicyHolderPickerNew";

const styles = theme => ({
    item: theme.paper.item,
    fab: theme.fab
});

class UpdatePolicyHolderUserDialog extends Component {
    state = {
        open: false,
        policyHolderUser: {},
        isDirty: false
    }

    handleOpen = () => this.setState((_, props) => ({ open: true, policyHolderUser: props.policyHolderUser }));

    handleClose = () => this.setState({ open: false, policyHolderUser: {} });

    handleSave = () => {
        const {
            intl,
            onSave,
            policyHolderUser,
            updatePolicyHolderUser,
            replacePolicyHolderUser,
            isReplacing = false
        } = this.props;
        if (isReplacing) {
            replacePolicyHolderUser(
                this.state.policyHolderUser,
                formatMessageWithValues(intl, "policyHolder", "ReplacePolicyHolderUser.mutationLabel", {
                    newUser: this.state.policyHolderUser.user.username,
                    oldUser: policyHolderUser.user.username,
                    policyHolder: this.policyHolderLabel(this.state.policyHolderUser.policyHolder)
                }).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
            );
        } else {
            updatePolicyHolderUser(
                this.state.policyHolderUser,
                formatMessageWithValues(intl, "policyHolder", "UpdatePolicyHolderUser.mutationLabel", {
                    user: this.state.policyHolderUser.user.username,
                    policyHolder: this.policyHolderLabel(this.state.policyHolderUser.policyHolder)
                }).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
            );
        }
        onSave();
        this.handleClose();
    };

    updateAttribute = (attribute, value) =>
        this.setState((state) => ({
            policyHolderUser: {
                ...state.policyHolderUser,
                [attribute]: value,
            },
            isDirty: true
        }));

    canSave = () => {
        const { policyHolderUser, isDirty } = this.state;
        return (
            (this.props.isReplacing ? !!policyHolderUser.user : !!isDirty) &&
            !!policyHolderUser.policyHolder &&
            !!policyHolderUser.dateValidFrom
        );
    };

    policyHolderLabel = (policyHolder) => `${policyHolder.code} - ${policyHolder.tradeName}`;

    render() {
        const { intl, classes, disabled, isReplacing = false, isPolicyHolderPredefined = false, policyHolders } = this.props;
        const { open, policyHolderUser } = this.state;
        return (
            <Fragment>
                {isReplacing ? (
                    <Tooltip title={formatMessage(intl, "policyHolder", "replaceButton.tooltip")}>
                        <div>
                            <IconButton onClick={this.handleOpen} disabled={disabled}>
                                <NoteAddIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                ) : (
                    <Tooltip title={formatMessage(intl, "policyHolder", "editButton.tooltip")}>
                        <div>
                            <IconButton onClick={this.handleOpen} disabled={disabled}>
                                <EditIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                )}
                <Dialog open={open} onClose={this.handleClose}>
                    <DialogTitle>
                        {isReplacing ? (
                            <FormattedMessage module="policyHolder" id="policyHolderUser.dialog.replace.title" />
                        ) : (
                            <FormattedMessage module="policyHolder" id="policyHolderUser.dialog.update.title" />
                        )}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container direction="column" className={classes.item}>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="admin.UserPicker"
                                    module="policyHolder"
                                    value={!!policyHolderUser.user && policyHolderUser.user}
                                    onChange={(v) => this.updateAttribute("user", v)}
                                    required
                                    check={"check"}
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PolicyHolderPickerNew
                                    module="policyHolder"
                                    withNull
                                    nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
                                    value={!!policyHolderUser.policyHolder && policyHolderUser.policyHolder}
                                    onChange={(v) => this.updateAttribute("policyHolder", v)}
                                    readOnly={!!isPolicyHolderPredefined}
                                    required
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="core.DatePicker"
                                    module="policyHolder"
                                    label="policyHolderUser.dateValidFrom"
                                    value={!!policyHolderUser.dateValidFrom && policyHolderUser.dateValidFrom}
                                    onChange={(v) => this.updateAttribute("dateValidFrom", v)}
                                    required
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="core.DatePicker"
                                    module="policyHolder"
                                    label="policyHolderUser.dateValidTo"
                                    value={!!policyHolderUser.dateValidTo && policyHolderUser.dateValidTo}
                                    onChange={(v) => this.updateAttribute("dateValidTo", v)}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} variant="outlined">
                            <FormattedMessage module="policyHolder" id="dialog.cancel" />
                        </Button>
                        <Button
                            onClick={this.handleSave}
                            disabled={!this.canSave()}
                            variant="contained"
                            color="primary"
                        >
                            {isReplacing ? (
                                <FormattedMessage module="policyHolder" id="dialog.replace" />
                            ) : (
                                <FormattedMessage module="policyHolder" id="dialog.update" />
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ updatePolicyHolderUser, replacePolicyHolderUser }, dispatch);
};

export default injectIntl(
    withTheme(withStyles(styles)(connect(null, mapDispatchToProps)(UpdatePolicyHolderUserDialog)))
);
