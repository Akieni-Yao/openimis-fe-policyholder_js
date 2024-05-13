import React, { Component, Fragment } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import AddIcon from "@material-ui/icons/Add";
import {
    FormattedMessage,
    formatMessage,
    formatMessageWithValues,
    PublishedComponent,
    decodeId
} from "@openimis/fe-core";
import { Fab, Grid, Tooltip } from "@material-ui/core";
import PolicyHolderPicker from "../pickers/PolicyHolderPicker";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { createPolicyHolderUser } from "../actions";
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

class CreatePolicyHolderUserDialog extends Component {
    state = {
        open: false,
        policyHolderUser: {}
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.policyHolders !== this.props.policyHolders) {
            this.setState((state, props) => ({
                policyHolderUser: {
                    ...state.policyHolderUser,
                    // policyHolder: props.policyHolders.find(
                    //     policyHolder => policyHolder.id === props.predefinedPolicyHolderId
                    // )
                }
            }));
        }
    }

    handleOpen = () => this.setState({ open: true });

    handleClose = () => this.setState({ open: false, policyHolderUser: {} });

    handleSave = () => {
        const { intl, onSave, createPolicyHolderUser } = this.props;
        const { policyHolderUser } = this.state;
        createPolicyHolderUser(
            this.state.policyHolderUser,
            formatMessageWithValues(intl, "policyHolder", "CreatePolicyHolderUser.mutationLabel", {
                user: policyHolderUser.user.username,
                policyHolder: `${policyHolderUser.policyHolder.code} - ${policyHolderUser.policyHolder.tradeName}`,
            }).slice(ZERO, MAX_CLIENTMUTATIONLABEL_LENGTH)
        );
        onSave();
        this.handleClose();
    };

    updateAttribute = (attribute, value) =>
        this.setState((state) => ({
            policyHolderUser: {
                ...state.policyHolderUser,
                [attribute]: value,
            }
        }));

    canSave = () => {
        const { policyHolderUser } = this.state;
        return !!policyHolderUser.user && !!policyHolderUser.policyHolder && !!policyHolderUser.dateValidFrom;
    };

    render() {
        const { intl, classes, tabView = false, predefinedPolicyHolderId = null } = this.props;
        const { open, policyHolderUser } = this.state;
        console.log("policyHolderUser",policyHolderUser?.policyHolder)
        return (
            <Fragment>
                {tabView ? (
                    <Fab color="primary" onClick={this.handleOpen} size="small">
                        <AddIcon />
                    </Fab>
                ) : (
                    <div className={classes.fab}>
                        <Tooltip title={formatMessage(intl, "policyHolder", "policyHolderUser.createPolicyHolderUser")}>
                            <Fab color="primary" onClick={this.handleOpen}>
                                <AddIcon />
                            </Fab>
                        </Tooltip>
                    </div>
                )}
                <Dialog open={open} onClose={this.handleClose}>
                    <DialogTitle>
                        <FormattedMessage module="policyHolder" id="policyHolderUser.createPolicyHolderUser" />
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
                                    readOnly={!!predefinedPolicyHolderId}
                                    required
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="core.DatePicker"
                                    module="policyHolder"
                                    label="policyHolderUser.dateValidFrom"
                                    onChange={(v) => this.updateAttribute("dateValidFrom", v)}
                                    required
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="core.DatePicker"
                                    module="policyHolder"
                                    label="policyHolderUser.dateValidTo"
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
                            <FormattedMessage module="policyHolder" id="dialog.replace" />
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    policyHolders: state.policyHolder.policyHolders.map(({ id: encodedId, ...other }) => ({
        id: decodeId(encodedId),
        ...other,
    })),
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createPolicyHolderUser }, dispatch);
};

export default injectIntl(
    withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreatePolicyHolderUserDialog)))
);
