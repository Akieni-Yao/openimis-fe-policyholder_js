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
} from "@openimis/fe-core";
import {
  fetchPolicyHolder,
  clearPolicyHolder,
  sendEmail,
  printReport,
  havingPAymentApprove,
  fetchPolicyHolderExceptionBYId,
  policyHolderExceptionApproval,
  updateExternalDocuments,
} from "../actions";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@material-ui/core";

import {
  RIGHT_PORTALPOLICYHOLDER_SEARCH,
  RIGHT_POLICYHOLDER_CREATE,
  RIGHT_POLICYHOLDER_UPDATE,
} from "../constants";
import PolicyHolderGeneralInfoPanel from "./PolicyHolderGeneralInfoPanel";
import PolicyHolderTabPanel from "./PolicyHolderTabPanel";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import CommonSnackbar from "./CommonSnackbar";
import ExceptionMasterPanel from "./ExceptionMasterPanel";
import ExceptionPolicyHolderMasterPanel from "./ExceptionPolicyHolderMasterPanel";
import ApproveRejectDialog from "./ApproveRejectDialog";
import ApproveRejectPolicyholderDialog from "./ApproveRejectPolicyholderDialog";

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

const jsonFields = ["address", "contactName", "bankAccount", "jsonExt"];

class ExceptionPolicyHolderForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      policyHolder: {},
      isFormValid: true,
      success: false,
      successMessage: "",
      confirmDialog: false,
      statusCheck: null,
      snackbar: false,
      severity: null,
      snackbarMsg: null,
      payload: null,
    };
  }
  // wrapJSONFields = (policyHolder) => {
  //   jsonFields.forEach((item) => {
  //     if (!!policyHolder[item]) {
  //       const key = `"${item}"`;
  //       const value = `${JSON.stringify(policyHolder[item]).replace(
  //         /\\n/g,
  //         "\\n"
  //       )}`;
  //       policyHolder[item] = `{${key}: ${value}}`;
  //     }
  //   });
  // };

  // unwrapJSONFields = (policyHolder) => {
  //   jsonFields.forEach((item) => {
  //     if (!!policyHolder[item]) {
  //       policyHolder[item] = JSON.parse(policyHolder[item])[item];
  //     }
  //   });
  // };

  componentDidMount() {
    if (!!this.props.policyHolderId) {
      this.setState(
        (_, props) => ({ policyHolderId: props.policyHolderId }),
        () =>
          this.props.fetchPolicyHolderExceptionBYId(
            this.props.modulesManager,
            this.props.policyHolderId
          )
      );
    }
    const userid = localStorage.getItem("userId");
    this.props.havingPAymentApprove(userid?.trim());
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.fetchedPolicyHolder !== this.props.fetchedPolicyHolder &&
      !!this.props.fetchedPolicyHolder
    ) {
      // this.unwrapJSONFields(this.props.policyHolder);
      this.setState((_, props) => ({
        policyHolder: props.policyHolder,
        policyHolderId: props.policyHolderId,
      }));
    }
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
    }
  }
  reload = () => {
    const { payment } = this.state;
    this.props.fetchPolicyHolderExceptionBYId(
      this.props.modulesManager,
      this.props.policyHolderId
    );
  };
  componentWillUnmount() {
    this.props.clearPolicyHolder();
  }

  emailButton = async (edited) => {
    const message = await this.props.sendEmail(
      this.props.modulesManager,
      edited
    );
    if (message?.payload?.data?.sentNotification?.message) {
      // If the email was sent successfully, update the success state and message
      this.setState({
        success: true,
        successMessage: "Email sent successfully",
      });
    } else {
      // If the email send was not successful, you can also set success to false here
      // and provide an appropriate error message.
      this.setState({
        success: false,
        successMessage: "Email sending failed",
      });
    }
  };
  displayPrintWindow = (base64Data, contentType) => {
    const printWindow = window.open(
      "",
      "Print Window",
      "width=600, height=400"
    );
    printWindow.document.open();

    if (contentType === "pdf") {
      // printWindow.print(`<embed type="application/pdf" width="100%" height="100%" src="data:application/pdf;base64,${base64Data}" />`);
      printWindow.document.write(
        `<embed type="application/pdf" width="100%" height="100%" src="data:application/pdf;base64,${base64Data}" />`
      );
    } else {
      printWindow.document.write(
        `<img src="data:image/png;base64,${base64Data}" />`
      );
    }

    printWindow.document.close();
    // printWindow.print();
  };
  printReport = async (edited) => {
    const data = await this.props.printReport(
      this.props.modulesManager,
      edited
    );

    const base64Data = data?.payload?.data?.sentNotification?.data;
    const contentType = "pdf";
    if (base64Data) {
      this.displayPrintWindow(base64Data, contentType);
    }
  };
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

  canSave = () =>
    // !this.isMandatoryFieldsEmpty() &&
    this.doesPolicyHolderChange() &&
    // this.props.isPolicyHolderCodeValid &&
    this.state.isFormValid;

  save = (policyHolder) => {
    // this.wrapJSONFields(policyHolder);
    this.props.save(policyHolder);
    // this.unwrapJSONFields(policyHolder);
  };

  onEditedChanged = (policyHolder) => this.setState({ policyHolder });

  titleParams = () =>
    this.state.policyHolder && this.props.titleParams(this.state.policyHolder);

  onValidation = (isFormValid) => {
    if (this.state.isFormValid !== isFormValid) {
      this.setState({ isFormValid });
    }
  };

  isPolicyHolderPortalUser = () =>
    this.props.rights.includes(RIGHT_PORTALPOLICYHOLDER_SEARCH) &&
    !this.props.rights.includes(RIGHT_POLICYHOLDER_CREATE) &&
    !this.props.rights.includes(RIGHT_POLICYHOLDER_UPDATE);
  _approveorreject = async (paymentData) => {
    // console.log("paymentData.status", paymentData[0]?.id)
    const response = await this.props.policyHolderExceptionApproval(
      "",
      paymentData
    );

    this.handleDialogClose();
    if (payload?.success) {
      if (paymentData.status == -1) {
        this.props.updateExternalDocuments(
          this.props.modulesManager,
          this.props.documentDetails,
          paymentData[0]?.code,
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
                "snackbar.approve",
                {}
              )
            : formatMessageWithValues(
                this.props.intl,
                "policyHolder",
                "snackbar.reject",
                {}
              ),
      });
      // setTimeout(() => {
      //   this.reload();
      // }, 3000);
    } else {
      this.setState({
        snackbar: true,
        severity: "error",
        snackbarMsg: payload?.message,
      });
    }
  };
  handleDialogOpen = (insureeData) => {
    this.setState({ confirmDialog: true });
    this.setState({ statusCheck: insureeData.status });
    this.setState({ payload: insureeData });
  };
  handleDialogClose = () => {
    this.setState({ confirmDialog: false });
  };
  handleSnackbarClose = () => {
    this.setState({ snackbar: false });
  };

  render() {
    const {
      intl,
      rights,
      back,
      save,
      policyHolderId,
      classes,
      approverData,
      documentDetails,
      policyHolder,
    } = this.props;
    // console.log("policyHolder",policyHolder);
    // console.log("documentDetails", documentDetails)
    const { payment, newPayment, reset, payload, statusCheck } = this.state;
    const exceptionApprove =
      !!approverData &&
      documentDetails?.length > 0 &&
      policyHolder[0]?.status === "PENDING";

    return (
      <Fragment>
        <Helmet
          title={formatMessageWithValues(
            this.props.intl,
            "policyHolder",
            "policyHolder.page.title",
            this.titleParams()
          )}
        />
        <Form
          module="policyHolder"
          title="policyHolder.page.title"
          titleParams={this.titleParams()}
          edited={this.state.policyHolder}
          back={back}
          canSave={this.canSave}
          save={this.save}
          onEditedChanged={this.onEditedChanged}
          HeadPanel={ExceptionPolicyHolderMasterPanel}
          saveTooltip={formatMessage(
            intl,
            "policyHolder",
            `savePolicyHolderButton.tooltip.${
              this.canSave() ? "enabled" : "disabled"
            }`
          )}
          onValidation={this.onValidation}
          rights={rights}
          openDirty={save}
          approveorreject={this.handleDialogOpen}
          exceptionApprove={exceptionApprove}
          documentDetails={documentDetails}
        />

        <ApproveRejectPolicyholderDialog
          isOpen={this.state.confirmDialog}
          onClose={this.handleDialogClose}
          payload={payload}
          approveorreject={this._approveorreject}
          statusCheck={statusCheck}
          classes={classes}
        />
        <CommonSnackbar
          open={this.state.snackbar}
          onClose={this.handleSnackbarClose}
          intl={intl}
          message={this.state.snackbarMsg}
          severity={this.state.severity}
          backgroundColor={
            this.state.severity === "success" ? "#00913E" : "#FF0000"
          }
        />
        {this.state.success && (
          <Dialog open={this.state.success} onClose={this.cancel} maxWidth="md">
            <DialogContent className={classes.dialogBg}>
              <DialogContentText className={classes.primaryHeading}>
                <FormattedMessage module="insuree" id="success" />
              </DialogContentText>
            </DialogContent>
            <DialogActions className={classes.dialogBg}>
              <Button onClick={this.cancel} className={classes.secondaryButton}>
                <FormattedMessage module="core" id="ok" />
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  fetchingPolicyHolder: state.policyHolder.fetchingExceptionPolicyholderById,
  errorPolicyHolder: state.policyHolder.errorExceptionPolicyholderById,
  fetchedPolicyHolder: state.policyHolder.fetchedExceptionPolicyholderById,
  policyHolder: state.policyHolder.ExceptionPolicyholderById,
  approverData: state.payment.approverData,
  documentDetails: state.policyHolder.documentsData,

  // isPolicyHolderCodeValid:
  //   state.policyHolder?.validationFields?.policyHolderCode?.isValid,
  // submittingMutation: state.policyHolder.submittingMutation,
  // mutation: state.policyHolder.mutation,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchPolicyHolder,
      clearPolicyHolder,
      journalize,
      sendEmail,
      printReport,
      havingPAymentApprove,
      fetchPolicyHolderExceptionBYId,
      policyHolderExceptionApproval,
      updateExternalDocuments,
    },
    dispatch
  );
};

export default withHistory(
  withModulesManager(
    injectIntl(
      withTheme(
        withStyles(styles)(
          connect(
            mapStateToProps,
            mapDispatchToProps
          )(ExceptionPolicyHolderForm)
        )
      )
    )
  )
);
