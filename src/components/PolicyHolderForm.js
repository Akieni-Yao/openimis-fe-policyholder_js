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
import { fetchPolicyHolder, clearPolicyHolder, sendEmail, printReport,havingPAymentApprove } from "../actions";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@material-ui/core";

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
    paddingBootom: 10
  },
  dialogText: {
    color: "#000000",
    fontWeight: "Bold"
  },
  primaryHeading: {
    font: 'normal normal medium 20px/22px Roboto',
    color: '#333333'
  },
  primaryButton: {
    backgroundColor: "#FFFFFF 0% 0% no-repeat padding-box",
    border: '1px solid #999999',
    color: "#999999",
    borderRadius: '4px',
    // fontWeight: "bold",
    "&:hover": {
      backgroundColor: '#FF0000',
      border: '1px solid #FF0000',
      color: '#FFFFFF'
    },
  },//theme.dialog.primaryButton,
  secondaryButton: {
    backgroundColor: "#FFFFFF 0% 0% no-repeat padding-box",
    border: '1px solid #999999',
    color: "#999999",
    borderRadius: '4px',
    // fontWeight: "bold",
    "&:hover": {
      backgroundColor: '#FF0000',
      border: '1px solid #FF0000',
      color: '#FFFFFF'
    },
  }
});

const jsonFields = ["address", "contactName", "bankAccount", "jsonExt"];

class PolicyHolderForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      policyHolder: {},
      isFormValid: true,
      success: false,
      successMessage: ""
    };
  }
  wrapJSONFields = (policyHolder) => {
    jsonFields.forEach((item) => {
      if (!!policyHolder[item]) {
        const key = `"${item}"`;
        const value = `${JSON.stringify(policyHolder[item]).replace(
          /\\n/g,
          "\\n"
        )}`;
        policyHolder[item] = `{${key}: ${value}}`;
      }
    });
  };

  unwrapJSONFields = (policyHolder) => {
    jsonFields.forEach((item) => {
      if (!!policyHolder[item]) {
        policyHolder[item] = JSON.parse(policyHolder[item])[item];
      }
    });
  };

  componentDidMount() {
    if (!!this.props.policyHolderId) {
      this.setState(
        (_, props) => ({ policyHolderId: props.policyHolderId }),
        () =>
          this.props.fetchPolicyHolder(
            this.props.modulesManager,
            this.props.policyHolderId
          )
      );
    }
    const userid = localStorage.getItem("userId");
    this.props.havingPAymentApprove(userid.trim());
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.fetchedPolicyHolder !== this.props.fetchedPolicyHolder &&
      !!this.props.fetchedPolicyHolder
    ) {
      this.unwrapJSONFields(this.props.policyHolder);
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
  isMandatoryFieldsEmpty = () => {
    const { policyHolder } = this.state;
    //  console.log("this.state",this.state)
    // Check if rccm has a value
    const rccmHasValue = !!policyHolder?.jsonExt?.rccm;

    // Define the list of mandatory fields based on the value of rccm
    const mandatoryFields = rccmHasValue
      ? [
        'tradeName',
        'locations',
        'jsonExt.mainActivity',
        'activityCode',
        'contactName',
        'address',
        'phone',
        'legalForm',
        'jsonExt.rccm',
        'jsonExt.nbEmployees',
        'jsonExt.createdAt',
        'dateValidFrom'
      ]
      : [
        'tradeName',
        'locations',
        'jsonExt.mainActivity',
        'activityCode',
        'contactName',
        'address',
        'phone',
        'legalForm',
      ];

    // Check if any mandatory field is undefined or empty
    const isEmpty = mandatoryFields.some(fieldPath => {
      // Split the property path and traverse the object
      const fieldKeys = fieldPath.split('.');
      let fieldValue = policyHolder;

      for (const key of fieldKeys) {
        if (fieldValue && fieldValue[key] !== undefined) {
          fieldValue = fieldValue[key];
        } else {
          return true; // Field is undefined or empty
        }
      }

      return !fieldValue; // Field is undefined or empty
    });

    return isEmpty; // Returns true if any mandatory field is undefined or empty, otherwise returns false
  };
  // isMandatoryFieldsEmpty = () => {
  //   const { policyHolder } = this.state;
  //   console.log("this.state", this.state)
  //   if (
  //     // !!policyHolder.code &&
  //     !!policyHolder.tradeName &&
  //     !!policyHolder.locations &&
  //     !!policyHolder.jsonExt.mainActivity &&
  //     // !!policyHolder.dateValidFrom &&
  //     !!policyHolder.activityCode &&
  //     !!policyHolder.contactName &&
  //     !!policyHolder.address &&
  //     !!policyHolder.phone &&
  //     !!policyHolder.legalForm
  //     // && 
  //     // !!policyHolder.jsonExt.createdAt
  //   ) {
  //     return false;
  //   }
  //   if (!!policyHolder?.jsonExt?.rccm && !!policyHolder?.jsonExt?.nbEmployees &&
  //     !!policyHolder?.jsonExt?.createdAt &&
  //     !!policyHolder?.dateValidFrom) {
  //     return false
  //   }
  //   return true;
  // };

  emailButton = async (edited) => {
    const message = await this.props.sendEmail(this.props.modulesManager, edited)
    if (message?.payload?.data?.sentNotification?.message) {
      // If the email was sent successfully, update the success state and message
      this.setState({
        success: true,
        successMessage: 'Email sent successfully',
      });
    } else {
      // If the email send was not successful, you can also set success to false here
      // and provide an appropriate error message.
      this.setState({
        success: false,
        successMessage: 'Email sending failed',
      });
    }
  }
  displayPrintWindow = (base64Data, contentType) => {
    const printWindow = window.open('', 'Print Window', 'width=600, height=400');
    printWindow.document.open();

    if (contentType === 'pdf') {
      // printWindow.print(`<embed type="application/pdf" width="100%" height="100%" src="data:application/pdf;base64,${base64Data}" />`);
      printWindow.document.write(`<embed type="application/pdf" width="100%" height="100%" src="data:application/pdf;base64,${base64Data}" />`);
    } else {
      printWindow.document.write(`<img src="data:image/png;base64,${base64Data}" />`);
    }

    printWindow.document.close();
    // printWindow.print();
  }
  printReport = async (edited) => {
    const data = await this.props.printReport(this.props.modulesManager, edited)

    const base64Data = data?.payload?.data?.sentNotification?.data;
    const contentType = 'pdf';
    if (base64Data) {
      this.displayPrintWindow(base64Data, contentType)
    }
  }
  cancel = () => {
    this.setState({
      success: false,
    });
  }
  doesPolicyHolderChange = () => {
    const { policyHolder } = this.props;
    if (_.isEqual(policyHolder, this.state.policyHolder)) {
      return false;
    }
    return true;
  };

  canSave = () =>
    !this.isMandatoryFieldsEmpty() &&
    this.doesPolicyHolderChange() &&
    // this.props.isPolicyHolderCodeValid &&
    this.state.isFormValid;

  save = (policyHolder) => {
    this.wrapJSONFields(policyHolder);
    this.props.save(policyHolder);
    this.unwrapJSONFields(policyHolder);
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

  render() {
    const { intl, rights, back, save, policyHolderId, classes } = this.props;
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
          HeadPanel={PolicyHolderGeneralInfoPanel}
          mandatoryFieldsEmpty={this.isMandatoryFieldsEmpty()}
          saveTooltip={formatMessage(
            intl,
            "policyHolder",
            `savePolicyHolderButton.tooltip.${this.canSave() ? "enabled" : "disabled"
            }`
          )}
          onValidation={this.onValidation}
          Panels={[PolicyHolderTabPanel]}
          rights={rights}
          isPolicyHolderPortalUser={this.isPolicyHolderPortalUser()}
          openDirty={save}
          emailButton={this.emailButton}
          email={policyHolderId}
          print={policyHolderId}
          printButton={this.printReport}
          success={this.state.success}

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
        {this.state.success && (
          <Dialog open={this.state.success} onClose={this.cancel} maxWidth="md">
            <DialogContent className={classes.dialogBg}>
              <DialogContentText className={classes.primaryHeading}>
                <FormattedMessage
                  module="insuree"
                  id="success"
                // values={this.state.successMessage}
                />
              </DialogContentText>
            </DialogContent>
            <DialogActions className={classes.dialogBg}>
              <Button onClick={this.cancel} className={classes.secondaryButton}>
                <FormattedMessage module="core" id="ok" />
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {/* {this.state.success && (
          <Snackbar
            open={this.state.success}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            style={{ marginRight: "50px", color: "white" }}
            onClose={this.onHandlerClose}
          >
            <Alert variant="filled" severity="success">
              {this.state.successMessage}
            </Alert>
          </Snackbar>
        )} */}
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  fetchingPolicyHolder: state.policyHolder.fetchingPolicyHolder,
  errorPolicyHolder: state.policyHolder.errorPolicyHolder,
  fetchedPolicyHolder: state.policyHolder.fetchedPolicyHolder,
  policyHolder: state.policyHolder.policyHolder,
  isPolicyHolderCodeValid:
    state.policyHolder?.validationFields?.policyHolderCode?.isValid,
  submittingMutation: state.policyHolder.submittingMutation,
  mutation: state.policyHolder.mutation,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { fetchPolicyHolder, clearPolicyHolder, journalize, sendEmail, printReport,havingPAymentApprove },
    dispatch
  );
};

export default withHistory(
  withModulesManager(
    injectIntl(
      withTheme(
        withStyles(styles)(
          connect(mapStateToProps, mapDispatchToProps)(PolicyHolderForm)
        )
      )
    )
  )
);
