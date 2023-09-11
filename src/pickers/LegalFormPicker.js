import React, { Component } from "react";
import { withModulesManager } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import ConfigBasedPicker from "./ConfigBasedPicker";

class LegalFormPicker extends Component {
    constructor(props) {
        super(props);
        this.activityCodeOptions = props.modulesManager.getConf("fe-policyHolder", "policyHolderFilter.legalFormOptions",
            [{
                "value": "1", 
                "label": {
                    "en": "Association/ Syndicat",
                    "fr": "Association/ Syndicat physique"
                }
            }, {
                "value": "2",
                "label": {
                    "en": "SA/ SAU/ SAS",
                    "fr": "SA/ SAU/ SAS"
                }
            }, {
                "value": "3",
                "label": {
                    "en": "Confession religieuse",
                    "fr": "Confession religieuse"
                }
            }, {
                "value": "4",
                "label": {
                    "en": "Collectivité publique",
                    "fr": "Collectivité publique"
                }
            }, {
                "value": "5",
                "label": {
                    "en": "Coopérative/ Société mutualiste/ GIE",
                    "fr": "Coopérative/ Société mutualiste/ GIE"
                }
            }, {
                "value": "6",
                "label": {
                    "en": "Établissement individuel/ EURL",
                    "fr": "Établissement individuel/ EURL"
                }
            }, {
                "value": "7",
                "label": {
                    "en": "Établissement public",
                    "fr": "Établissement public"
                }
            }, {
                "value": "8",
                "label": {
                    "en": "Fondation/ ONG",
                    "fr": "Fondation/ ONG"
                }
            }, {
                "value": "9",
                "label": {
                    "en": "Organisation Internationale/ Représentation diplo",
                    "fr": "Organisation Internationale/ Représentation diplo"
                }
            }, {
                "value": "10",
                "label": {
                    "en": "SARL/ SARLU",
                    "fr": "SARL/ SARLU"
                }
            }, {
                "value": "11",
                "label": {
                    "en": "Autre",
                    "fr": "Autre à risque limité"
                }
            }]
        );
    }

    render() {
        return (
            <ConfigBasedPicker
                configOptions={this.activityCodeOptions}
                {...this.props}
            />
        )
    }
}

export default withModulesManager(injectIntl(LegalFormPicker));
