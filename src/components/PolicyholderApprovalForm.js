import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import _ from "lodash";

import { withTheme, withStyles } from "@material-ui/core/styles";

import {
    Form,
    withModulesManager,
    withHistory,
    formatMessage,
    formatMessageWithValues,
    journalize,
    Helmet,
    FormattedMessage,
    decodeId,
    CommonSnackbar
} from "@openimis/fe-core";
import {
    fetchPolicyholderRequestById,
    clearPolicyHolder,
    havingPAymentApprove,
    updateExternalDocuments,
    PolicyholderReworkAction,
    PolicyholderApproval
} from "../actions";
// import CommonSnackbar from "./CommonSnackbar";
import PolicyHolderApprovalMasterPanel from "./PolicyHolderApprovalMasterPanel";
import PolicyholderPortalApproveReject from "./PolicyholderPortalApproveReject";
import PolicyholderRework from "./PolicyholderRework";
const styles = (theme) => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    item: theme.paper.item,
    dialogBg: {
        backgroundColor: "#FFFFFF",
        width: 300,
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 10,
        paddingBootom: 10,
    },
    dialogText: {
        color: "#000000",
        fontWeight: "Bold",
    },
    primaryHeading: {
        font: "normal normal medium 20px/22px Roboto",
        color: "#333333",
    },
    primaryButton: {
        backgroundColor: "#FFFFFF 0% 0% no-repeat padding-box",
        border: "1px solid #999999",
        color: "#999999",
        borderRadius: "4px",
        // fontWeight: "bold",
        "&:hover": {
            backgroundColor: "#FF0000",
            border: "1px solid #FF0000",
            color: "#FFFFFF",
        },
    }, //theme.dialog.primaryButton,
    secondaryButton: {
        backgroundColor: "#FFFFFF 0% 0% no-repeat padding-box",
        border: "1px solid #999999",
        color: "#999999",
        borderRadius: "4px",
        // fontWeight: "bold",
        "&:hover": {
            backgroundColor: "#FF0000",
            border: "1px solid #FF0000",
            color: "#FFFFFF",
        },
    },
});
class PolicyHolderApprovalForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            policyHolder: {},
            isFormValid: true,
            success: false,
            successMessage: "",
            consirmedAction: null,
            confirmDialog: false,
            statusCheck: null,
            snackbar: false,
            severity: null,
            snackbarMsg: null,
            reworkconfirmDialog: false,

        };
    }
    componentDidMount() {
        // Extract policyHolderId from base64 encoded ID in URL pathname
        const encodedId = window.location.pathname.split('/').pop();
        const policyHolderId = encodedId;
        if (policyHolderId) {
            this.setState({ policyHolderId }, () => {
                this.props.fetchPolicyholderRequestById(
                    this.props.modulesManager,
                    policyHolderId
                );
            });
        }
        const userid = localStorage.getItem("userId");
        this.props.havingPAymentApprove(userid?.trim());
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            prevProps.fetchedPolicyHolder !== this.props.fetchedPolicyHolder &&
            !!this.props.fetchedPolicyHolder
        ) {
            this.setState((_, props) => ({
                policyHolder: props.policyHolder,
                policyHolderId: props.policyHolderId,
            }));
        }
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
        }
    }

    componentWillUnmount() {
        this.props.clearPolicyHolder();
    }
    cancel = () => {
        this.setState({
            success: false,
        });
    };
    doesPolicyHolderChange = () => {
        const { policyHolder } = this.props;
        if (_.isEqual(policyHolder, this.state.policyHolder)) {
            return false;
        }
        return true;
    };
    reload = () => {
        const encodedId = window.location.pathname.split('/').pop();
        const policyHolderId = encodedId;
        this.props.fetchPolicyholderRequestById(
            this.props.modulesManager,
            policyHolderId
        );
    };
    _approveorreject = async (paymentData) => {
        const response = await this.props.PolicyholderApproval("mm", paymentData);
        this.handleDialogClose();
        if (!!response?.payload?.data?.policyholderApproval?.success) {
            if (paymentData.status == -1) {
                this.props.updateExternalDocuments(
                    this.props.modulesManager,
                    this.props.documentDetails,
                    paymentData?.requestNumber,
                    false
                );
            }
            this.setState({
                snackbar: true,
                severity: paymentData.status == 5 ? "success" : "error",
                snackbarMsg:
                    paymentData.status == 5
                        ? formatMessageWithValues(
                            this.props.intl,
                            "policyHolder",
                            "snackbar.Portalreject",
                            {}
                        )
                        : formatMessageWithValues(
                            this.props.intl,
                            "policyHolder",
                            "snackbar.Portalreject",
                            {}
                        ),
            });
            setTimeout(() => {
                this.reload();
            }, 3000);
        }
    };
    _rework = async (paymentData) => {
        const response = await this.props.PolicyholderReworkAction("mm", paymentData);
        this.handleReworkDialogClose();
        if (!!response?.payload?.data?.policyholderApproval?.success) {
            if (paymentData.status == 5) {
                this.props.updateExternalDocuments(
                    this.props.modulesManager,
                    this.props.documentDetails,
                    paymentData?.requestNumber,
                    false
                );
            }
            this.setState({
                snackbar: true,
                severity: paymentData.status == 5 ? "success" : "error",
                snackbarMsg:
                    paymentData.status == 5
                        ? formatMessageWithValues(
                            this.props.intl,
                            "policyHolder",
                            "snackbar.ReworkPortalapprove",
                            {}
                        )
                        : formatMessageWithValues(
                            this.props.intl,
                            "policyHolder",
                            "snackbar.ReworkPortalreject",
                            {}
                        ),
            });
            setTimeout(() => {
                this.reload();
            }, 3000);
        }
    };
    handleDialogOpen = (insureeData) => {
        this.setState({ confirmDialog: true });
        this.setState({ statusCheck: insureeData.status });
        this.setState({ payload: insureeData });
    };
    handleReworkDialogOpen = (insureeData) => {
        this.setState({ reworkconfirmDialog: true });
        this.setState({ statusCheck: insureeData.status });
        this.setState({ payload: insureeData });
    };
    handleDialogClose = () => {
        this.setState({ confirmDialog: false });
    };
    handleReworkDialogClose = () => {
        this.setState({ reworkconfirmDialog: false });
    };
    handleSnackbarClose = () => {
        this.setState({ snackbar: false });
    };
    // titleParams = () =>
    //     this.state.policyHolder && this.props.titleParams(this.state.policyHolder);
    render() {
        const { intl, rights, back, save, policyHolderId, classes, policyHolder, approverData } = this.props;
        const { payment, newPayment, reset, payload, statusCheck, } = this.state;
        const exceptionApprove = !!approverData && policyHolder?.status === "Pending"
        return (
            <Fragment>
                <Helmet
                    title={formatMessageWithValues(
                        this.props.intl,
                        "policyHolder",
                        "policyHolder.page.title",
                        // this.titleParams()
                    )}
                />
                <Form
                    module="policyHolder"
                    // title="policyHolder.page.title"
                    // titleParams={this.titleParams()}
                    edited={this.state.policyHolder}
                    back={back}
                    onEditedChanged={this.onEditedChanged}
                    HeadPanel={PolicyHolderApprovalMasterPanel}
                    printButton={this.printReport}
                    success={this.state.success}
                    paymentApprove={exceptionApprove}
                    approveorreject={this.handleDialogOpen}
                    rework={this.handleReworkDialogOpen}
                    actionRework={"rework"}
                />
                <CommonSnackbar
                    open={this.props.snackbar}
                    onClose={this.props.handleClose}
                    message={formatMessageWithValues(
                        intl,
                        "policyHolder",
                        "policyHolder.CreatePolicyHolder.snackbar",
                        {}
                    )}
                    severity="success"
                    copyText={this.props.resCode && this.props.resCode}
                    backgroundColor="#00913E"
                />
                <PolicyholderPortalApproveReject
                    isOpen={this.state.confirmDialog}
                    onClose={this.handleDialogClose}
                    payload={payload}
                    approveorreject={this._approveorreject}
                    statusCheck={statusCheck}
                    classes={classes}
                />
                <PolicyholderRework
                    isOpen={this.state.reworkconfirmDialog}
                    onClose={this.handleReworkDialogClose}
                    payload={payload}
                    reworkRequest={this._rework}
                    statusCheck={statusCheck}
                    classes={classes}
                />
                <CommonSnackbar
                    open={this.state.snackbar}
                    onClose={this.handleSnackbarClose}
                    message={this.state.snackbarMsg}
                    severity={this.state.severity}
                // copyText={this.props.resCode && this.props.resCode}
                />
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    fetchingPolicyHolder: state.policyHolder.fetchingRequestPolicyholderById,
    errorPolicyHolder: state.policyHolder.errorRequestPolicyholderById,
    fetchedPolicyHolder: state.policyHolder.fetchedRequestPolicyholderById,
    policyHolder: state.policyHolder?.RequestPolicyholderById?.[0],
    submittingMutation: state.policyHolder.submittingMutation,
    mutation: state.policyHolder.mutation,
    approverData: state.payment.approverData,
    documentDetails: state.policyHolder.documentsData,
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        {
            fetchPolicyholderRequestById,
            clearPolicyHolder,
            journalize,
            havingPAymentApprove,
            updateExternalDocuments,
            PolicyholderApproval,
            PolicyholderReworkAction
        },
        dispatch
    );
};

export default withHistory(
    withModulesManager(
        injectIntl(
            withTheme(
                withStyles(styles)(
                    connect(mapStateToProps, mapDispatchToProps)(PolicyHolderApprovalForm)
                )
            )
        )
    )
);
