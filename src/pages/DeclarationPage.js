import React, { Component } from "react";
import { bindActionCreators } from "redux";
import {
  formatMessage,
  Helmet,
  clearCurrentPaginationPage,
  withTooltip,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import CreatePolicyHolderUserDialog from "../dialogs/CreatePolicyHolderUserDialog";
import DeclarartionSearcher from "../components/DeclarationSearcher";
import {
  RIGHT_POLICYHOLDERUSER_SEARCH,
  RIGHT_PORTALPOLICYHOLDERUSER_SEARCH,
  RIGHT_POLICYHOLDERUSER_CREATE,
  RIGHT_PORTALPOLICYHOLDERUSER_CREATE,
} from "../constants";
import SystemUpdateAltIcon from "@material-ui/icons/SystemUpdateAlt";
import { Fab } from "@material-ui/core";
import * as XLSX from "xlsx";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class DeclarationPage extends Component {
  state = {
    reset: 0,
  };

  onSave = () =>
    this.setState((state) => ({
      reset: state.reset + 1,
    }));

  componentDidMount = () => {
    const moduleName = "policyHolder";
    const { module } = this.props;
    if (module !== moduleName) this.props.clearCurrentPaginationPage();
  };

  componentWillUnmount = () => {
    const { location, history } = this.props;
    const {
      location: { pathname },
    } = history;
    const urlPath = location.pathname;
    if (!pathname.includes(urlPath)) this.props.clearCurrentPaginationPage();
  };

  _downloadExcel = () => {
    const { declaration } = this.props;

    if (!declaration || declaration.length === 0) {
      // Handle the case where there is no data to download
      return;
    }

    // Flatten nested objects
    const flattenedData = declaration.map((item) => {
      const flatItem = { ...item };

      // Flatten the 'locations' object if it exists
      if (flatItem.locations) {
        flatItem.locationId = flatItem.locations.id;
        flatItem.locationUuid = flatItem.locations.uuid;
        flatItem.locationCode = flatItem.locations.code;
        flatItem.locationName = flatItem.locations.name;
        flatItem.locationType = flatItem.locations.type;
        delete flatItem.locations;
      }

      // If 'contactName' is a string, parse it as JSON
      if (typeof flatItem.contactName === "string") {
        try {
          const contactNameObj = JSON.parse(flatItem.contactName);
          flatItem.contactName = contactNameObj.contactName;
        } catch (error) {
          // Handle the parsing error if necessary
        }
      }

      return flatItem;
    });

    // Create a table element
    const table = document.createElement("table");

    // Add table headers
    const headerRow = table.insertRow(0);
    Object.keys(flattenedData[0]).forEach((key) => {
      const cell = headerRow.insertCell();
      cell.textContent = key;
    });

    // Add table data
    flattenedData.forEach((item, index) => {
      const row = table.insertRow(index + 1);
      Object.values(item).forEach((value) => {
        const cell = row.insertCell();
        cell.textContent = value;
      });
    });

    // Create a workbook from the table
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Declaration Data");

    const dataURI = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    const a = document.createElement("a");
    a.href =
      "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
      dataURI;
    // a.href = url;
    a.download = "declaration_data.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // URL.revokeObjectURL(url);
  };

  render() {
    const { classes, rights } = this.props;
    return (
      [RIGHT_POLICYHOLDERUSER_SEARCH, RIGHT_PORTALPOLICYHOLDERUSER_SEARCH].some(
        (right) => rights.includes(right)
      ) && (
        <div className={classes.page}>
          <Helmet
            title={formatMessage(
              this.props.intl,
              "policyHolder",
              "menu.policyHolderUsers"
            )}
          />
          <DeclarartionSearcher
            rights={rights}
            reset={this.state.reset}
            onSave={this.onSave}
          />
          {withTooltip(
            <div className={classes.fab}>
              <Fab color="primary" onClick={this._downloadExcel}>
                <SystemUpdateAltIcon />
              </Fab>
            </div>,
            formatMessage(
              this.props.intl,
              "policyHolder",
              "declarationDownload.tooltip"
            )
          )}
        </div>
      )
    );
  }
}

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  module: state.core?.savedPagination?.module,
  declaration: state.policyHolder.declarationReport,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export default injectIntl(
  withTheme(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(DeclarationPage)
    )
  )
);
