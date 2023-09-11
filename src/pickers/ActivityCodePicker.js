import React, { Component } from "react";
import { withModulesManager } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import ConfigBasedPicker from "./ConfigBasedPicker";

class ActivityCodePicker extends Component {
    constructor(props) {
        super(props);
        this.activityCodeOptions = props.modulesManager.getConf("fe-policyHolder", "policyHolderFilter.activityCodeOptions",
            [{   
                "value": "1", 
                "label": {
                    "en": "Agriculture, élevage et pêche",
                    "fr": "Agriculture, élevage et pêche"
                }
            }, {
                "value": "2",
                "label": {
                    "en": "Banques, assurances et microfinances",
                    "fr": "Banques, assurances et microfinances"
                }
            }, {
                "value": "3",
                "label": {
                    "en": "Bâtiment et travaux publics",
                    "fr": "Bâtiment et travaux publics"
                }
            }, {
                "value": "4",
                "label": { 
                    "en": "Commerces",
                    "fr": "Commerces"
                }
            }, {
                "value": "5",
                "label": { 
                    "en": "Environnement",
                    "fr":"Environnement"
                }
            }, {
                "value": "6",
                "label": {
                    "en": "Exploitation forestière",
                    "fr":"Exploitation forestière"
                }
            }, {
                "value": "7",
                "label": {
                    "en": "Hôtelleries et restaurations",
                    "fr":"Hôtelleries et restaurations"
                }
            }, {
                "value": "8",
                "label": {
                    "en": "Industries",
                    "fr":"Industries"
                }
            }, {
                "value": "9",
                "label": {
                    "en": "Jeux et Loisirs",
                    "fr":"Jeux et Loisirs"
                }
            }, {
                "value": "10",
                "label": {
                    "en": "Mines solides",
                    "fr":"Mines solides"
                }
            }, {
                "value": "11",
                "label": {
                    "en": "Pétrole",
                    "fr":"Pétrole"
                }
            }, {
                "value": "12",
                "label": {
                    "en": "Parapétrolier",
                    "fr":"Parapétrolier"
                }
            }, {
                "value": "13",
                "label": {
                    "en": "Projet",
                    "fr":"Projet"
                }
            }, {
                "value": "14",
                "label": {
                    "en": "Santé et médicament",
                    "fr":"Santé et médicament"
                }
            }, {
                "value": "15",
                "label": {
                    "en": "Services",
                    "fr":"Services"
                }
            }, {
                "value": "16",
                "label": {
                    "en": "Transport et Logistique",
                    "fr":"Transport et Logistique"
                }
            }, {
                "value": "17",
                "label": {
                    "en": "Télécom et NTIC",
                    "fr":"Télécom et NTIC"
                }
            }, {
                "value": "18",
                "label": {
                    "en": "Autre",
                    "fr":"Autre"
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

export default withModulesManager(injectIntl(ActivityCodePicker));
