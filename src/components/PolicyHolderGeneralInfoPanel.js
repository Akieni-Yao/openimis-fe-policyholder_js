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

class PolicyHolderGeneralInfoPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.phoneValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.phoneValidation",
      {
        regex: /^[0-9]*$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "phoneValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "phoneValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.tradeNameValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.tradeNameValidation",
      {
        regex: /^[a-zA-Z0-9. ]*$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "tradeNameValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "tradeNameValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.mainActivityValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.mainActivityValidation",
      {
        regex: /^[a-zA-Z0-9. ]*$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "mainActivityValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "mainActivityValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.contactNameValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.contactNameValidation",
      {
        regex: /^[a-zA-Z0-9. ]*$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "contactNameValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "contactNameValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.shortNameValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.shortNameValidation",
      {
        regex: /^[a-zA-Z0-9. ]*$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "shortNameValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "shortNameValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.niuValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.niuValidation",
      {
        regex: /^[a-zA-Z0-9. ]*$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "niuValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "niuValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.rccmValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.rccmValidation",
      {
        regex: /^[a-zA-Z0-9. ]*$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "rccmValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "rccmValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.addressValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.addressValidation",
      {
        regex: /^[a-zA-Z0-9\s,'-]*$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "addressValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "addressValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.bankValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.bankValidation",
      {
        regex: /^[a-zA-Z0-9. ]*$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "bankValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "bankValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.bankAccountNbValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.bankAccountNbValidation",
      {
        regex: /^[0-9]+$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "bankAccountNbValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "bankAccountNbValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.bankCodeValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.bankCodeValidation",
      {
        regex: /^[0-9]+$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "bankCodeValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "bankCodeValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.rbiValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.rbiValidation",
      {
        regex: /^[0-9]+$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "rbiValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "rbiValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.faxValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.faxValidation",
      {
        regex: /^[0-9]{8,9}$/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "faxValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "faxValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.emailValidation = {
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      regexMsg: {
        en: formatMessage(
          props.intl,
          "policyHolder",
          "emailValidation.regexMsg.en"
        ),
        fr: formatMessage(
          props.intl,
          "policyHolder",
          "emailValidation.regexMsg.fr"
        ),
      },
    };
    this.accountancyAccountValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.accountancyAccountValidation",
      {
        regex: /.+/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "accountancyAccountValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "accountancyAccountValidation.regexMsg.fr"
          ),
        },
      }
    );
    this.paymentReferenceValidation = props.modulesManager.getConf(
      "policyHolder",
      "policyHolderForm.paymentReferenceValidation",
      {
        regex: /.+/,
        regexMsg: {
          en: formatMessage(
            props.intl,
            "policyHolder",
            "paymentReferenceValidation.regexMsg.en"
          ),
          fr: formatMessage(
            props.intl,
            "policyHolder",
            "paymentReferenceValidation.regexMsg.fr"
          ),
        },
      }
    );
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
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this._componentDidUpdate(prevProps, prevState, snapshot);
    const { edited } = this.props;
    if (prevProps.edited !== edited) {
      let isFormValid = true;
      if (
        !!this.regexError("phone", edited?.phone) ||
        !!this.regexError("tradeName", edited?.tradeName) ||
        !!this.regexError("mainActivity", edited?.jsonExt?.mainActivity) ||
        !!this.regexError("contactName", edited?.contactName) ||
        !!this.regexError("shortName", edited?.jsonExt?.shortName) ||
        !!this.regexError("niu", edited?.jsonExt?.niu) ||
        !!this.regexError("rccm", edited?.jsonExt?.rccm) ||
        !!this.regexError("address", edited?.address) ||
        !!this.regexError("bank", edited?.bankAccount?.bank) ||
        !!this.regexError("bankKey", edited?.bankAccount?.bankKey) ||
        !!this.regexError(
          "bankAccountNb",
          edited?.bankAccount?.bankAccountNb
        ) ||
        !!this.regexError("bankCode", edited?.bankAccount?.bankCode) ||
        !!this.regexError("fax", edited.fax) ||
        !!this.regexError("email", edited.email) ||
        !!this.regexError("accountancyAccount", edited.accountancyAccount) ||
        !!this.regexError("paymentReference", edited.paymentReference)
      ) {
        isFormValid = false;
      }
      this.props.onValidation(isFormValid);
    }
  }
  regexError = (field, value) => {
    if (!!value) {
      let validation = this[`${field}Validation`];
      return !!validation && !validation["regex"].test(value)
        ? validation["regexMsg"][this.props.intl.locale]
        : false;
    }
    return false;
  };

  shouldValidate = (input) => {
    const { savedPolicyHolderCode } = this.props;
    return input !== savedPolicyHolderCode;
  };

  updateAttributes = (updates) => {
    const findCodeByValue = () => {
      const { dataArray } = this.state;
      for (let i = 0; i < this.state.dataArray.length; i++) {
        if (this.state.dataArray[i].val == updates.activityCode) {
          return this.state.dataArray[i].code;
        }
      }
      return undefined;
    };
    const activityCode = findCodeByValue();
    let data = _.merge({}, this.state.data, updates, {
      jsonExt: { activityCode: activityCode },
    });
    if (!data.dateValidFrom) {
      data.dateValidFrom = new Date().toISOString().slice(0, 10);
    }
    this.props.onEditedChanged(data);
  };

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
    } = this.props;

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
        {mandatoryFieldsEmpty && (
          <Fragment>
            <div className={classes.item}>
              <FormattedMessage
                module="policyHolder"
                id="mandatoryFieldsEmptyError"
              />
            </div>
            <Divider />
          </Fragment>
        )}
        <Grid container className={classes.item}>
          <Grid item xs={2} className={classes.item}>
            {/* <ValidatedTextInput
              itemQueryIdentifier="policyHolderCode"
              codeTakenLabel="policyHolder.codeTaken"
              shouldValidate={this.shouldValidate}
              isValid={isCodeValid}
              isValidating={isCodeValidating}
              validationError={validationError}
              action={policyHolderCodeValidation}
              clearAction={policyHolderCodeClear}
              setValidAction={policyHolderCodeSetValid}
              module="policyHolder"
              required={true}
              label="code"
              value={!!edited && !!edited.code ? edited.code : ""}
              onChange={(v) => this.updateAttribute("code", v)}
              readOnly={isPolicyHolderPortalUser}
            /> */}
            <TextInput
              module="policyHolder"
              label="code"
              // inputProps={{ maxLength: MAX_TRADENAME_LENGTH }}
              value={!!edited && !!edited.code ? edited.code : ""}
              onChange={(v) => this.updateAttribute("code", v)}
              readOnly={true}
            />
          </Grid>
          <Grid item xs={5} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="tradeName"
              required
              inputProps={{ maxLength: MAX_TRADENAME_LENGTH }}
              value={!!edited && !!edited.tradeName ? edited.tradeName : ""}
              onChange={(v) => this.updateAttribute("tradeName", v)}
              error={this.regexError("tradeName", edited.tradeName)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="mainActivity"
              required
              inputProps={{ maxLength: MAX_TRADENAME_LENGTH }}
              value={
                !!edited && !!edited.jsonExt ? edited.jsonExt.mainActivity : ""
              }
              onChange={(v) =>
                this.updateAttributes({ jsonExt: { mainActivity: v } })
              }
              error={this.regexError(
                "mainActivity",
                edited?.jsonExt?.mainActivity
              )}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="contactName"
              inputProps={{ maxLength: MAX_TRADENAME_LENGTH }}
              value={!!edited && !!edited.contactName ? edited.contactName : ""}
              error={this.regexError("contactName", edited?.contactName)}
              onChange={(v) => this.updateAttribute("contactName", v)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="shortName"
              required
              inputProps={{ maxLength: MAX_TRADENAME_LENGTH }}
              value={
                !!edited && !!edited.jsonExt ? edited.jsonExt.shortName : ""
              }
              error={this.regexError("shortName", edited?.jsonExt?.shortName)}
              onChange={(v) =>
                this.updateAttributes({ jsonExt: { shortName: v } })
              }
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="NIU"
              inputProps={{ maxLength: MAX_TRADENAME_LENGTH }}
              value={!!edited && !!edited.jsonExt ? edited.jsonExt.niu : ""}
              onChange={(v) => this.updateAttributes({ jsonExt: { niu: v } })}
              error={this.regexError("niu", edited?.jsonExt?.niu)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="RCCM"
              inputProps={{ maxLength: MAX_TRADENAME_LENGTH }}
              value={!!edited && !!edited.jsonExt ? edited?.jsonExt?.rccm : ""}
              onChange={(v) => this.updateAttributes({ jsonExt: { rccm: v } })}
              error={this.regexError("rccm", edited?.jsonExt?.rccm)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>

          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="nbEmployees"
              type="text"
              required
              inputProps={{ maxLength: MAX_MAIN_ACTIVITY_LENGTH }}
              value={
                !!edited && !!edited.jsonExt ? edited.jsonExt.nbEmployees : ""
              }
              onChange={(v) =>
                this.updateAttributes({ jsonExt: { nbEmployees: v } })
              }
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>

          <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="policyHolder"
              label="dateValidFrom"
              required
              value={
                !!edited && !!edited.dateValidFrom
                  ? moment(edited.dateValidFrom, "YYYY-MM-DD").format(
                      "YYYY-MM-DD"
                    )
                  : moment().format("YYYY-MM-DD")
              }
              onChange={(v) => this.updateAttribute("dateValidFrom", v)}
              readOnly={true}
              // readOnly={(!!edited && !!edited.id) || isPolicyHolderPortalUser}
            />
          </Grid>
          {/* <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="policyHolder"
              label="dateValidTo"
              value={
                !!edited && !!edited.dateValidTo ? edited.dateValidTo : null
              }
              onChange={(v) => this.updateAttribute("dateValidTo", v)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid> */}

          <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="location.RegionPicker"
              withNull
              label={formatMessage(
                intl,
                "policyHolder",
                "policyHolder.createdAt"
              )}
              filterLabels={false}
              value={
                !!edited && !!edited.jsonExt ? edited.jsonExt.createdAt : null
              }
              onChange={(v) =>
                this.updateAttributes({ jsonExt: { createdAt: v } })
              }
              // onChange={(v) => this.updateAttribute("createdAt", v)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={8}>
            <PublishedComponent
              pubRef="location.DetailedLocation"
              withNull
              required
              filterLabels={false}
              value={!!edited ? edited.locations : null}
              onChange={(v) => this.updateAttribute("locations", v)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextAreaInput
              module="policyHolder"
              label="address"
              inputProps={{ maxLength: MAX_ADDRESS_LENGTH }}
              value={!!edited && !!edited.address ? edited.address : ""}
              onChange={(v) => this.updateAttribute("address", v)}
              error={this.regexError("address", edited?.address)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="phone"
              inputProps={{ maxLength: MAX_PHONE_LENGTH }}
              value={!!edited && !!edited.phone ? edited.phone : ""}
              error={this.regexError("phone", edited.phone)}
              onChange={(v) => this.updateAttribute("phone", v)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="email"
              inputProps={{ maxLength: MAX_EMAIL_LENGTH }}
              value={!!edited && !!edited.email ? edited.email : ""}
              error={this.regexError("email", edited.email)}
              onChange={(v) => this.updateAttribute("email", v)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>

          <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="policyHolder.LegalFormPicker"
              module="policyHolder"
              label="legalForm"
              withNull
              nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
              value={!!edited ? edited.legalForm : null}
              onChange={(v) => this.updateAttribute("legalForm", v)}
              readOnly={isPolicyHolderPortalUser}
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
              onChange={(v) => this.updateAttribute("activityCode", v)}
              readOnly={
                !!policyHolderId && !!edited.activityCode
                  ? true
                  : isPolicyHolderPortalUser
              }
            />
          </Grid>
          {/* <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="accountancyAccount"
              inputProps={{ maxLength: MAX_ACCOUNTANCYACCOUNT_LENGTH }}
              value={
                !!edited && !!edited.accountancyAccount
                  ? edited.accountancyAccount
                  : ""
              }
              error={this.regexError(
                "accountancyAccount",
                edited.accountancyAccount
              )}
              onChange={(v) => this.updateAttribute("accountancyAccount", v)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid> */}

          <Grid item xs={3} className={classes.item}>
            {/* <TextInput
              module="policyHolder"
              label="bank"
              value={
                !!edited && !!edited.bankAccount ? edited.bankAccount.bank : ""
              }
              inputProps={{ maxLength: MAX_ADDRESS_LENGTH }}
              error={this.regexError(
                "bank",
                edited?.bankAccount?.bank
              )}
              onChange={(v) =>
                this.updateAttributes({ bankAccount: { bank: v } })
              }
              readOnly={isPolicyHolderPortalUser}
            /> */}
            <PublishedComponent
              pubRef="policyHolder.BankPicker"
              module="policyHolder"
              label="bank"
              nullLabel={formatMessage(intl, "policyHolder", "emptyLabel")}
              value={!!edited.bankAccount ? edited.bankAccount.bank : ""}
              onChange={(v) =>
                this.updateAttributes({ bankAccount: { bank: v } })
              }
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="bankCode"
              inputProps={{ maxLength: MAX_BANK_CODE_LENGTH }}
              value={
                !!edited && !!edited.bankAccount
                  ? edited.bankAccount.bankCode
                  : ""
              }
              error={this.regexError("bankCode", edited?.bankAccount?.bankCode)}
              onChange={(v) =>
                this.updateAttributes({ bankAccount: { bankCode: v } })
              }
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="bankLockerCode"
              value={
                !!edited && !!edited.bankAccount
                  ? edited.bankAccount.lockerCode
                  : ""
              }
              onChange={(v) =>
                this.updateAttributes({ bankAccount: { lockerCode: v } })
              }
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="bankAccountNb"
              inputProps={{ maxLength: MAX_BANK_NUMBER_LENGTH }}
              value={
                !!edited && !!edited.bankAccount
                  ? edited.bankAccount.accountNb
                  : ""
              }
              error={this.regexError(
                "bankAccountNb",
                edited?.bankAccount?.accountNb
              )}
              onChange={(v) =>
                this.updateAttributes({ bankAccount: { accountNb: v } })
              }
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="bankKey"
              value={
                !!edited && !!edited.bankAccount
                  ? edited.bankAccount.bankKey
                  : ""
              }
              type="text"
              inputProps={{ maxLength: MAX_RIB_LENGTH }}
              error={this.regexError("bankKey", edited?.bankAccount?.bankKey)}
              onChange={(v) =>
                this.updateAttributes({ bankAccount: { bankKey: v } })
              }
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid>

          {/* <Grid item xs={2} className={classes.item}>
            <TextInput
              module="policyHolder"
              label="paymentReference"
              inputProps={{ maxLength: MAX_PAYMENTREFERENCE_LENGTH }}
              value={
                !!edited && !!edited.paymentReference
                  ? edited.paymentReference
                  : ""
              }
              error={this.regexError(
                "paymentReference",
                edited.paymentReference
              )}
              onChange={(v) => this.updateAttribute("paymentReference", v)}
              readOnly={isPolicyHolderPortalUser}
            />
          </Grid> */}
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
});

export default withModulesManager(
  injectIntl(
    connect(
      mapStateToProps,
      null
    )(withTheme(withStyles(styles)(PolicyHolderGeneralInfoPanel)))
  )
);
