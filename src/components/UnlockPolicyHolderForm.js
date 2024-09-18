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
  historyPush,
} from "@openimis/fe-core";
import {
  fetchUnpaidDeclaration,
  clearPolicyHolder,
  sendEmail,
  printReport,
  havingPAymentApprove,
  fetchBankList,
  fetchPolicyHolder
} from "../actions";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography
} from "@material-ui/core";

import {
  RIGHT_PORTALPOLICYHOLDER_SEARCH,
  RIGHT_POLICYHOLDER_CREATE,
  RIGHT_POLICYHOLDER_UPDATE,
} from "../constants";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import CommonSnackbar from "./CommonSnackbar";
import UnlockPolicyHolderMasterPanel from "./UnlockPolicyHolderMasterPanel";
import UnpaidDeclarationSearcher from "./UnpaidDeclarationSearcher";
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
  spanPadding: {
    paddingTop: "2rem",
    // paddingTop: theme.spacing(2),
    marginRight: "2rem",
  },
});

const jsonFields = ["address", "contactName", "bankAccount", "jsonExt"];

class UnlockPolicyHolderForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      policyHolder: {},
      isFormValid: true,
      success: false,
      successMessage: "",
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
          ),
        this.props.fetchBankList()
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
    const rccmHasValue = !!policyHolder?.jsonExt?.rccm;

    // Define the list of mandatory fields based on the value of rccm
    const mandatoryFields = rccmHasValue
      ? [
          "tradeName",
          "locations",
          "jsonExt.mainActivity",
          "activityCode",
          "contactName",
          "address",
          "phone",
          "legalForm",
          "jsonExt.rccm",
          "jsonExt.nbEmployees",
          "jsonExt.createdAt",
          "dateValidFrom",
        ]
      : [
          "tradeName",
          "locations",
          "jsonExt.mainActivity",
          "activityCode",
          "contactName",
          "address",
          "phone",
          "legalForm",
        ];

    // Check if any mandatory field is undefined or empty
    const isEmpty = mandatoryFields.some((fieldPath) => {
      // Split the property path and traverse the object
      const fieldKeys = fieldPath.split(".");
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

  unlockPolicyholder = (policyHolderId) => {
    historyPush(
      this.props.modulesManager,
      this.props.history,
      "policyHolder.route.policyHolders"
    );
  };

  render() {
    const { intl, rights, back, save, policyHolderId, classes, } = this.props;    

    return (
      <Fragment>
        <Helmet
          title={formatMessageWithValues(
            this.props.intl,
            "policyHolder",
            "policyHolder.unlockPage.title",
            this.titleParams()
          )}
        />
        <Form
          module="policyHolder"
          title="policyHolder.unlockPage.title"
          titleParams={this.titleParams()}
          edited={this.state.policyHolder}
          back={back}
          canSave={this.canSave}
          save={this.save}
          onEditedChanged={this.onEditedChanged}
          HeadPanel={UnlockPolicyHolderMasterPanel}
          mandatoryFieldsEmpty={this.isMandatoryFieldsEmpty()}
          saveTooltip={formatMessage(
            intl,
            "policyHolder",
            `savePolicyHolderButton.tooltip.${
              this.canSave() ? "enabled" : "disabled"
            }`
          )}
          onValidation={this.onValidation}
          policyHolderId={policyHolderId}
          Panels={[UnpaidDeclarationSearcher]}
          rights={rights}
          isPolicyHolderPortalUser={this.isPolicyHolderPortalUser()}
          openDirty={save}
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
          intl={intl}
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

      </Fragment>
    );
  }
}

const mapStateToProps = (state,props) => ({
  fetchingPolicyHolder: state.policyHolder.fetchingPolicyHolder,
  errorPolicyHolder: state.policyHolder.errorPolicyHolder,
  fetchedPolicyHolder: state.policyHolder.fetchedPolicyHolder,
  policyHolder: state.policyHolder.policyHolder,
  isPolicyHolderCodeValid:
    state.policyHolder?.validationFields?.policyHolderCode?.isValid,
  submittingMutation: state.policyHolder.submittingMutation,
  mutation: state.policyHolder.mutation,
   policyHoldersUnpaid: state.policyHolder.policyHoldersUnpaid,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchUnpaidDeclaration,
      clearPolicyHolder,
      journalize,
      sendEmail,
      printReport,
      havingPAymentApprove,
      fetchBankList,
      fetchPolicyHolder
    },
    dispatch
  );
};

export default withHistory(
  withModulesManager(
    injectIntl(
      withTheme(
        withStyles(styles)(
          connect(mapStateToProps, mapDispatchToProps)(UnlockPolicyHolderForm)
        )
      )
    )
  )
);
