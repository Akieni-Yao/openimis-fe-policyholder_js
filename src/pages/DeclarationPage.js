import React, { Component } from "react";
import { bindActionCreators } from "redux";
import {
  formatMessage,
  Helmet,
  clearCurrentPaginationPage,
  withTooltip,
  baseApiUrl,
  apiHeaders,
  formatDateFromISO,
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
    const resultObject = {};
    this.state.filterData.forEach((item) => {
      const [key, ...valueParts] = item.split(/:\s*/);
      const value = valueParts.join(":").trim();
      resultObject[key] = parseValue(value);
    });

    function parseValue(value) {
      // Check if the value is enclosed in double quotes
      if (/^".*"$/.test(value)) {
        // Remove the quotes and handle escaped quotes
        return value.slice(1, -1).replace(/\\"/g, '"');
      } else if (value === "true" || value === "false") {
        return value === "true";
      } else if (/^\d+$/.test(value)) {
        return parseInt(value, 10);
      } else {
        return value;
      }
    }

    let url_import =
      `${baseApiUrl}/policyholder/export/notdeclaredpolicyholder?declared=${resultObject.declared}` +
      `${
        resultObject.dateContractFrom_Gte
          ? `&from_date=${resultObject.dateContractFrom_Gte
              .trim()
              .substring(0, 10)}`
          : ""
      }` +
      `${
        resultObject.dateContractTo_Lte
          ? `&to_date=${resultObject.dateContractTo_Lte.substring(0, 10)}`
          : ""
      }` +
      `${
        resultObject.code_Istartswith
          ? `&camu_code=${encodeURIComponent(resultObject.code_Istartswith)}`
          : ""
      }` +
      `${
        resultObject.tradeName_Istartswith
          ? `&trade_name=${encodeURIComponent(
              resultObject.tradeName_Istartswith
            )}`
          : ""
      }` +
      `${
        resultObject.department
          ? `&department=${encodeURIComponent(resultObject.department)}`
          : ""
      }`;

    try {
      const response = await fetch(url_import, {
        headers: apiHeaders,
        method: "GET",
        credentials: "same-origin",
      });

      if (response.status >= 400) {
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${
        !!resultObject.declared
          ? "declared_policyholder.xlsx"
          : "notdeclared_policyholder.xlsx"
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

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
