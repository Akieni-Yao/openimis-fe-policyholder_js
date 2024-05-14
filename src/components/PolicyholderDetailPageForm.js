import React, { Fragment } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { Grid, Divider, Typography } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  withModulesManager,
  formatMessage,
  FormPanel,
  TextInput,
  ValidatedTextInput,
  TextAreaInput,
  FormattedMessage,
  PublishedComponent,
  Contributions,
} from "@openimis/fe-core";
import {
  policyHolderCodeClear,
  policyHolderCodeSetValid,
  policyHolderCodeValidation,
} from "../actions";
import {
  MAX_ACCOUNTANCYACCOUNT_LENGTH,
  MAX_ADDRESS_LENGTH,
  MAX_BANK_CODE_LENGTH,
  MAX_BANK_NUMBER_LENGTH,
  MAX_CODE_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_FAX_LENGTH,
  MAX_MAIN_ACTIVITY_LENGTH,
  MAX_PAYMENTREFERENCE_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_RIB_LENGTH,
  MAX_TRADENAME_LENGTH,
} from "../constants";
import _ from "lodash";
import moment from "moment";

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

const POLICYHOLDER_RIGHTS_PANEL = "policyholder.rightsGeneralInfo";
class PolicyholderDetailPageForm extends FormPanel {
  constructor(props) {
    super(props);
    this.state = {
      dataArray: [
        { val: "1", code: "AEP" },
        { val: "2", code: "BAM" },
        { val: "3", code: "BTP" },
        { val: "4", code: "COM" },
        { val: "5", code: "ENV" },
        { val: "6", code: "EXF" },
        { val: "7", code: "HER" },
        { val: "8", code: "IND" },
        { val: "9", code: "JEL" },
        { val: "10", code: "MIS" },
        { val: "11", code: "PET" },
        { val: "12", code: "PPT" },
        { val: "13", code: "PRJ" },
        { val: "14", code: "SEM" },
        { val: "15", code: "SER" },
        { val: "16", code: "TEL" },
        { val: "17", code: "TEN" },
        { val: "18", code: "AUT" },
      ],
      legalFormVal: [
        {
          value: "1",
          label: {
            en: "Association/ Syndicat",
            fr: "Association/ Syndicat physique",
          },
        },
        {
          value: "2",
          label: {
            en: "SA/ SAU/ SAS",
            fr: "SA/ SAU/ SAS",
          },
        },
        {
          value: "3",
          label: {
            en: "Confession religieuse",
            fr: "Confession religieuse",
          },
        },
        {
          value: "4",
          label: {
            en: "Collectivité publique",
            fr: "Collectivité publique",
          },
        },
        {
          value: "5",
          label: {
            en: "Coopérative/ Société mutualiste/ GIE",
            fr: "Coopérative/ Société mutualiste/ GIE",
          },
        },
        {
          value: "6",
          label: {
            en: "Établissement individuel/ EURL",
            fr: "Établissement individuel/ EURL",
          },
        },
        {
          value: "7",
          label: {
            en: "Établissement public",
            fr: "Établissement public",
          },
        },
        {
          value: "8",
          label: {
            en: "Fondation/ ONG",
            fr: "Fondation/ ONG",
          },
        },
        {
          value: "9",
          label: {
            en: "Organisation Internationale/ Représentation diplo",
            fr: "Organisation Internationale/ Représentation diplo",
          },
        },
        {
          value: "10",
          label: {
            en: "SARL/ SARLU",
            fr: "SARL/ SARLU",
          },
        },
        {
          value: "11",
          label: {
            en: "Autre",
            fr: "Autre à risque limité",
          },
        },
      ],
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this._componentDidUpdate(prevProps, prevState, snapshot);
    const { edited } = this.props;
  }



  bankCode = (bankValue) => {
    let bankcodeVal;
    switch (bankValue) {
      case 30005:
        bankcodeVal = 30005;
        break;
      case 30008:
        bankcodeVal = 30008;
        break;
      case 30011:
        bankcodeVal = 30011;
        break;
      case 30012:
        bankcodeVal = 30012;
        break;
      case 30013:
        bankcodeVal = 30013;
        break;
      case 30014:
        bankcodeVal = 30014;
        break;
      case 30015:
        bankcodeVal = 30015;
        break;
      case 30016:
        bankcodeVal = 30016;
        break;
      case 30018:
        bankcodeVal = 30018;
        break;
      case 30019:
        bankcodeVal = 30019;
        break;
      case 30020:
        bankcodeVal = 30020;
        break;
      default:
        bankcodeVal = null;
        break;
    }
    return bankcodeVal;
  };
  bankNames = [
    {
      value: "30005",

      label: {
        en: "Mutuelle Congolaise de Crédit",
        fr: "Mutuelle Congolaise de Crédit",
      },
    },
    {
      value: "30008",
      label: {
        en: "BGFI",
        fr: "BGFI",
      },
    },
    {
      value: "30011",
      label: {
        en: "Crédit Du Congo",
        fr: "Crédit Du Congo",
      },
    },
    {
      value: "30012",
      label: {
        en: "La Congolaise des Banques",
        fr: "La Congolaise des Banques",
      },
    },
    {
      value: "30013",
      label: {
        en: "Banque Commerciale Internationale",
        fr: "Banque Commerciale Internationale",
      },
    },
    {
      value: "30014",
      label: {
        en: "Ecobank",
        fr: "Ecobank",
      },
    },
    {
      value: "30015",
      label: {
        en: "Banque Congolaise de l'Habitat",
        fr: "Banque Congolaise de l'Habitat",
      },
    },
    {
      value: "30016",
      label: {
        en: "United Banque of Africa",
        fr: "United Banque of Africa",
      },
    },
    {
      value: "30018",
      label: {
        en: "Société Générale du Congo",
        fr: "Société Générale du Congo",
      },
    },
    {
      value: "30019",
      label: {
        en: "Banque Postale du congo",
        fr: "Banque Postale du congo",
      },
    },
    {
      value: "30020",
      label: {
        en: "Banque Sino Congolaise pour l'Afrique",
        fr: "Banque Sino Congolaise pour l'Afrique",
      },
    },
  ]
  render() {
    const {
      intl,
      classes,
      edited,
      mandatoryFieldsEmpty,
      isPolicyHolderPortalUser,
      isCodeValid,
      isCodeValidating,
      validationError,
      policyHolderId,
      approverData,
    } = this.props;
    console.log("edited", edited)
    const jsonExt = !!edited.jsonExt ? JSON.parse(edited.jsonExt) : ""
    const bankAccount = !!edited.bankAccount ? JSON.parse(edited.bankAccount) : "";
    const bankName = !!bankAccount?.bankAccount ? bankAccount?.bankAccount.bank : ""
    const contactName = !!edited?.contactName ? JSON.parse(edited?.contactName) : ""
    const address = !!edited?.address ? JSON.parse(edited.address) : ""
    const selectedBank = this.bankNames.find(bank => bank.value === bankName);
    const bankLabel = selectedBank ? selectedBank.label.en : "";
    return (
      <Fragment>
        <Grid container className={classes.tableTitle}>
          <Grid item>
            <Grid
              container
              align="center"
              justify="center"
              direction="column"
              className={classes.fullHeight}
            >
              <Grid item>
                <Typography>
                  <FormattedMessage
                    module="policyHolder"
                    id="policyHolder.generalInfoPanel.title"
                  />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        <Grid container className={classes.item}>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="code"
              value={!!edited && !!edited.code ? edited.code : ""}
              onChange={(v) => this.updateAttribute("code", v)}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="tradeName"
              required
              value={!!edited && !!edited.tradeName ? edited.tradeName : ""}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="mainActivity"
              required
              value={
                !!edited && !!edited.jsonExt ? jsonExt.jsonExt.mainActivity : ""
              }
              capitalize
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="contactName"
              required
              value={!!edited && !!edited.contactName ? contactName.contactName : ""}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="shortName"
              required
              value={
                !!edited && !!edited.jsonExt ? jsonExt.jsonExt.shortName : ""
              }
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="NIU"
              value={!!edited && !!edited.jsonExt ? jsonExt.jsonExt.niu : ""}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="No. RCCM"
              value={!!edited && !!edited.jsonExt ? jsonExt.jsonExt?.rccm : ""}
              readOnly={true}
            />
          </Grid>

          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="nbEmployees"
              type="text"
              value={
                !!edited && !!edited.jsonExt ? jsonExt.jsonExt?.nbEmployees : ""
              }
              readOnly={true}
            />
          </Grid>

          <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="policyHolder"
              label="dateValidFrom"
              value={
                !!edited && !!edited.dateValidFrom
                  ? moment(edited.dateValidFrom, "YYYY-MM-DD").format(
                    "YYYY-MM-DD"
                  )
                  : moment().format("YYYY-MM-DD")
              }
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="location.RegionPicker"
              withNull
              label={formatMessage(
                intl,
                "policyHolder",
                "policyHolder.createdAt"
              )}
              // required={edited?.jsonExt?.rccm != "" ? true : false}
              // required
              filterLabels={false}
              value={
                !!edited && !!edited.jsonExt ? jsonExt.jsonExt.createdAt : null
              }
              // onChange={(v) => this.updateAttribute("createdAt", v)}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextAreaInput
              module="policyHolder"
              label="address"
              required
              value={!!edited && !!edited?.address ? address?.address : ""}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="phone"
              required
              value={!!edited && !!edited.phone ? edited.phone : ""}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={8}>
            <PublishedComponent
              pubRef="location.DetailedLocation"
              withNull
              required
              filterLabels={false}
              value={!!edited ? edited.locations : null}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="email"
              value={!!edited && !!edited.email ? edited.email : ""}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="policyHolder.LegalFormPicker"
              module="policyHolder"
              label="legalForm"
              required
              withNull
              nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
              value={!!edited ? edited.legalForm : null}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="policyHolder.ActivityCodePicker"
              module="policyHolder"
              label="activityCode"
              required
              nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
              value={!!edited.activityCode ? edited.activityCode : ""}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="bank"
              value={!!edited.bankAccount ? bankLabel : ""}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="bankCode"
              value={
                !!edited && !!bankAccount.bankAccount?.bank
                  ? bankAccount.bankAccount.bank
                  : this.bankCode(this.state?.data?.bankAccount?.bank)
              }
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="bankLockerCode"
              value={
                !!edited && !!bankAccount.bankAccount
                  ? bankAccount.bankAccount.lockerCode
                  : ""
              }
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="bankAccountNb"
              value={
                !!edited && !!bankAccount.bankAccount
                  ? bankAccount.bankAccount.accountNb
                  : ""
              }
              readOnly={true}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="bankKey"
              value={
                !!edited && !!bankAccount.bankAccount
                  ? bankAccount.bankAccount.bankKey
                  : ""
              }
              type="text"
              readOnly={true}
            />
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

const mapStateToProps = (store, props) => ({
  // isCodeValid: store.policyHolder?.validationFields?.policyHolderCode?.isValid,
  // isCodeValidating:
  //   store.policyHolder?.validationFields?.policyHolderCode?.isValidating,
  policyHolderId: props?.edited?.id,
  validationError:
    store.policyHolder?.validationFields?.policyHolderCode?.validationError,
  savedPolicyHolderCode: store.policyHolder?.policyHolder?.code,
  approverData: store.policyHolder.approverData,
});

export default withModulesManager(
  injectIntl(
    connect(
      mapStateToProps,
      null
    )(withTheme(withStyles(styles)(PolicyholderDetailPageForm)))
  )
);
