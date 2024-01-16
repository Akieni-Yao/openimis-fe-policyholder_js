import React, { Component } from "react";
import { bindActionCreators } from "redux";
import {
  formatMessage,
  Helmet,
  clearCurrentPaginationPage,
  withTooltip,
  baseApiUrl,
  apiHeaders,
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
    filterData: null,
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

  handleFilters = (data) => {
    this.setState({ filterData: data });
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
  handleInsureeDownload = async () => {
    // const { policyHolder } = this.props;
    // const file = event.target.files[0];
    // let formData = new FormData();
    // formData.append("file", file);
    const extractedValues = {};
    function isValidDate(dateString) {
      const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
      return (
        dateString.match(regex) &&
        new Date(dateString) !== "Invalid Date" &&
        !isNaN(new Date(dateString))
      );
    }
    this.state.filterData.forEach((item) => {
      const [key, value] = item.split(":").map((part) => part.trim());

      // Handle cases where the value is enclosed in double quotes
      const cleanedValue =
        value.startsWith('"') && value.endsWith('"')
          ? value.slice(1, -1)
          : value;

      // Check if the cleaned value is a boolean or a number
      extractedValues[key] =
        cleanedValue.toLowerCase() === "true"
          ? true
          : cleanedValue.toLowerCase() === "false"
          ? false
          : !isNaN(cleanedValue)
          ? Number(cleanedValue)
          : cleanedValue;
    });

    let url_import = `${baseApiUrl}/policyholder/export/notdeclaredpolicyholder?declared=${extractedValues.declared}`;

    try {
      const response = await fetch(url_import, {
        headers: apiHeaders,
        // body: formData,
        method: "GET",
        credentials: "same-origin",
      });

      // const payload = await response.text();

      if (response.status >= 400) {
        // alert(`Error ${response.status}: ${payload.error}`);
        // alert(`Error ${response.status}: ${payload}`);

        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "policyholder_insurees.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // alert(`Success: ${payload}`);
      // console.log(`Success: ${payload}`);

      this.setState({ insureeCheck: true });
    } catch (error) {
      alert(
        error?.message ??
          formatMessage(
            `An error occurred. Please contact your administrator. ${error?.message}`
          )
      );
    }
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
            handleFilters={this.handleFilters}
          />
          {withTooltip(
            <div className={classes.fab}>
              <Fab color="primary" onClick={this.handleInsureeDownload}>
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
