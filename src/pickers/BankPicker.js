import React, { Component } from "react";
import { withModulesManager } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import ConfigBasedPicker from "./ConfigBasedPicker";

class BankPicker extends Component {
  constructor(props) {
    super(props);
    this.bankOptions = props.modulesManager.getConf(
      "fe-policyHolder",
      "policyHolderFilter.bankOptions",
      [
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
    );
  }

  render() {
    return (
      <ConfigBasedPicker configOptions={this.bankOptions} {...this.props} />
    );
  }
}

export default withModulesManager(injectIntl(BankPicker));
