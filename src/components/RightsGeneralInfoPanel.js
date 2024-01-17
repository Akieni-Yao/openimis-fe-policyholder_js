import React, { Fragment } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import {
  Grid,
  Divider,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  withModulesManager,
  formatMessage,
  Helmet,
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
  marginDiv: {
    marginTop: "2rem",
  },
});

class RightsGeneralInfoPanel extends FormPanel {
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
    console.log("edited", edited);
    return (
      <Fragment>
        <Grid
          container
          className={`${classes.tableTitle} ${classes.marginDiv}`}
        >
          {formatMessage(
            this.props.intl,
            "policyHolder",
            "rights.exception.title"
          )}
        </Grid>
        {/* <Grid container>
          <Helmet
            title={formatMessage(
              this.props.intl,
              "policyHolder",
              "rights.exception.title"
            )}
          />
        </Grid> */}

        <Grid container className={classes.item}>
          <Grid item xs={2} className={classes.item}>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={
                    !!edited &&
                    !!edited?.jsonExt &&
                    !!edited?.jsonExt.penaltyWaiveOffContract
                  }
                  //   disabled={readOnlyFields.includes(
                  //     "penaltyWaiveOffContract"
                  //   )}
                  // this.updateAttributes({ jsonExt: { penaltyWaiveOffContract:  !edited || !edited?.penaltyWaiveOffContract } })
                  onChange={(v) =>
                    this.updateAttributes({
                      jsonExt: {
                        ...edited?.jsonExt,
                        penaltyWaiveOffContract:
                          !edited || !edited?.jsonExt?.penaltyWaiveOffContract,
                      },
                    })
                  }
                />
              }
              label={formatMessage(
                intl,
                "policyHolder",
                "rights.exception.applyException"
              )}
            />
          </Grid>
          <Grid container className={classes.item}>
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                module="contract"
                label="dateValidFrom"
                format={"DD-MMMM-YYYY"}
                monthtrue
                required
                // maxDate={!!edited && !!edited.dateValidTo && edited.dateValidTo}
                value={
                  !!edited &&
                  !!edited?.jsonExt &&
                  !!edited?.jsonExt.exceptiondateValidFrom &&
                  edited?.jsonExt.exceptiondateValidFrom
                }
                onChange={(v) => {
                  const parsedStartDate = new Date(v);

                  parsedStartDate.setDate(1);

                  const formattedStartDate = parsedStartDate
                    .toISOString()
                    .split("T")[0];
                  this.updateAttributes({
                    jsonExt: {
                      ...edited?.jsonExt,
                      exceptiondateValidFrom: formattedStartDate,
                    },
                  });
                  // this.validateFromDate(v);
                }}
                readOnly={
                  !!edited &&
                  !!edited?.jsonExt &&
                  !!edited?.jsonExt.penaltyWaiveOffContract
                    ? false
                    : true
                }
              />
            </Grid>
            <Grid item xs={2} className={classes.item}>
              <PublishedComponent
                pubRef="core.DatePicker"
                module="contract"
                label="dateValidTo"
                required
                format={"DD-MMMM-YYYY"}
                monthtrue
                // minDate={
                //   !!edited && !!edited.dateValidFrom && edited.dateValidFrom
                // }
                value={
                  !!edited &&
                  !!edited?.jsonExt &&
                  !!edited?.jsonExt.exceptiondateValidTo &&
                  edited?.jsonExt.exceptiondateValidTo
                }
                onChange={(v) => {
                  const parsedStartDate = new Date(v);

                  // Set the date to the last day of the month
                  parsedStartDate.setMonth(parsedStartDate.getMonth() + 1);
                  parsedStartDate.setDate(0);

                  const formattedEndDate = parsedStartDate
                    .toISOString()
                    .split("T")[0];

                  this.updateAttributes({
                    jsonExt: {
                      ...edited?.jsonExt,
                      exceptiondateValidTo: formattedEndDate,
                    },
                  });
                  // Additional code if needed
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(RightsGeneralInfoPanel)))
);
