import React, { Component, Fragment } from "react";
import { Tab, Grid, Typography, Input, Button, CircularProgress, Snackbar } from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import GetAppIcon from "@material-ui/icons/GetApp";
import {
  formatMessage,
  PublishedComponent,
  FormattedMessage,
  baseApiUrl,
  apiHeaders,
} from "@openimis/fe-core";
import {
  RIGHT_POLICYHOLDERINSUREE_CREATE,
  RIGHT_POLICYHOLDERINSUREE_SEARCH,
  RIGHT_PORTALPOLICYHOLDERINSUREE_CREATE,
  RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH,
} from "../constants";
import PolicyHolderInsureeSearcher from "./PolicyHolderInsureeSearcher";
import { POLICYHOLDERINSUREE_TAB_VALUE } from "../constants";
import CreatePolicyHolderInsureeDialog from "../dialogs/CreatePolicyHolderInsureeDialog";
import * as XLSX from "xlsx";
import MuiAlert from '@material-ui/lab/Alert';
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
class PolicyHolderInsureesTabLabel extends Component {
  render() {
    const { intl, rights, onChange, disabled, tabStyle, isSelected } =
      this.props;
    return (
      (rights.includes(RIGHT_POLICYHOLDERINSUREE_SEARCH) ||
        rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH)) && (
        <Tab
          onChange={onChange}
          disabled={disabled}
          className={tabStyle(POLICYHOLDERINSUREE_TAB_VALUE)}
          selected={isSelected(POLICYHOLDERINSUREE_TAB_VALUE)}
          value={POLICYHOLDERINSUREE_TAB_VALUE}
          label={formatMessage(
            intl,
            "policyHolder",
            "policyHolderInsuree.label"
          )}
        />
      )
    );
  }
}

class PolicyHolderInsureesTabPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reset: 0,
      insureeCheck: false,
      downloadError: null,
      isLoading: false,
      snackbarMessage: '',
    };
  }
  userlang = localStorage.getItem("userLanguage");
  onSave = () => {
    this.setState((state) => ({
      reset: state.reset + 1,
    }));
  };

  handleCloseSnackbar = () => {
    this.setState({ snackbarOpen: false });
  };

  downloadStatusFile = async () => {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = this.userlang === "fr" ? "Titulaires de polices_assurés" : "policyholder_insurees.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  onUpload = async (event) => {
    const { policyHolder } = this.props;
    const file = event.target.files[0];
    let formData = new FormData();
    formData.append("file", file);

    let encodedCode = encodeURIComponent(policyHolder.code);
    let url_import = `${baseApiUrl}/policyholder/imports/${encodedCode}/policyholderinsurees`;

    this.setState({ isLoading: true });

    try {
      const response = await fetch(url_import, {
        headers: apiHeaders,
        body: formData,
        method: "POST",
        credentials: "same-origin",
      });
      console.log(response.status, 'responsee');

      if (response.status == 200) {
        this.setState({ isLoading: false });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.userlang === "fr" ? "Titulaires de polices_assurés" : "policyholder_insurees.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.setState({ insureeCheck: true });
        this.setState({
          snackbarMessage: 'Upload successful!',
          snackbarSeverity: 'success',
          snackbarOpen: true,
        });
        return;
      }
      if (response.status == 400) {
        this.setState({ isLoading: false });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.userlang === "fr" ? "Titulaires de polices_assurés" : "policyholder_insurees.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.setState({
          snackbarMessage: `An error occurred. Please contact your administrator.`,
          snackbarSeverity: 'error',
          snackbarOpen: true,
        });
        return;
      }
      if (response.status == 417) {
        this.setState({ isLoading: false });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.userlang === "fr" ? "Titulaires de polices_assurés" : "policyholder_insurees.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // this.downloadStatusFile();
        this.setState({
          snackbarMessage: `Incorrect data in the file. Please check.`,
          snackbarSeverity: 'error',
          snackbarOpen: true,
        });
        return;
      }
      if (response.status == 500) {
        this.setState({ isLoading: false });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.userlang === "fr" ? "Titulaires de polices_assurés" : "policyholder_insurees.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // this.downloadStatusFile();
        this.setState({
          snackbarMessage: `Something went wrong with the file. Please check.`,
          snackbarSeverity: 'error',
          snackbarOpen: true,
        });
        return;
      }
      if (response.status == 422) {
        this.setState({ isLoading: false });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.userlang === "fr" ? "Titulaires de polices_assurés" : "policyholder_insurees.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // this.downloadStatusFile();
        this.setState({
          snackbarMessage: `There is an issue with the file. Please check.`,
          snackbarSeverity: 'error',
          snackbarOpen: true,
        });
        return;
      }
      this.setState({ isLoading: false });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = this.userlang === "fr" ? "Titulaires de polices_assurés" : "policyholder_insurees.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // this.downloadStatusFile();
      this.setState({
        snackbarMessage: 'Upload successfully!',
        snackbarSeverity: 'success',
        snackbarOpen: true,
      });
      // alert(`Success: ${payload}`);

    } catch (error) {
      this.setState({ isLoading: false });
      this.setState({
        snackbarMessage: `An error occurred. Please contact your administrator.`,
        snackbarSeverity: 'error',
        snackbarOpen: true,
      });

      // this.setState({ downloadError: error });
    }
  };

  handleDownload = () => {
    const data = [
      [
        "Numéro CAMU",
        "Nom",
        "Prénom",
        "Numéro CAMU temporaire",
        "Date de naissance",
        "Lieu de naissance",
        "Sexe",
        "Civilité",
        "Téléphone",
        "Adresse",
        "Village",
        // "ID Famille",
        "Email",
        // "Matricule",
        // "Salaire Brut",
        // "Part Patronale %",
        // "Part Patronale",
        // "Part Salariale %",
        // "Part Salariale",
        // "Cotisation total",
        "Supprimé",
      ],
      [
        "",
        "Test",
        "Test",
        "",
        "03/03/2007",
        "Brazzaville",
        "M",
        "Célibataire",
        "242060000000",
        "Address",
        "CG105",
        // "",
        "",
        // "",
        // "70000",
        // "",
        // "",
        // "",
        // "",
        // "",
        "",
      ],
    ];

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Create a workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Generate a data URI containing the Excel data
    const dataURI = XLSX.write(wb, { bookType: "xlsx", type: "base64" });

    // Create a download link
    const link = document.createElement("a");
    link.href =
      "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
      dataURI;
    link.download = this.userlang === "fr" ? "Echantillon_données_assurés.xlsx" : "sample_insurees_data.xlsx"; // Change the filename if needed
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  handleInsureeDownload = async () => {
    const { policyHolder } = this.props;

    let encodedCode = encodeURIComponent(policyHolder.code);
    let url_import = `${baseApiUrl}/policyholder/export/${encodedCode}/policyholderinsurees`;

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
      a.download = this.userlang === "fr" ? "liste des assurées Ouvrant droit.xlsx" : "policyholder_insurees.xlsx";;
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
    const { rights, value, isTabsEnabled, policyHolder, intl } = this.props;
    const { isLoading, snackbarOpen, snackbarMessage, snackbarSeverity } = this.state;

    console.log(isLoading, 'isLoading');


    return (
      (rights.includes(RIGHT_POLICYHOLDERINSUREE_SEARCH) ||
        rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH)) && (
        <PublishedComponent
          pubRef="policyHolder.TabPanel"
          module="policyHolder"
          index={POLICYHOLDERINSUREE_TAB_VALUE}
          value={value}
        >
          {isLoading && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}>
              <CircularProgress />
            </div>
          )}
          <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={this.handleCloseSnackbar}>
            <Alert onClose={this.handleCloseSnackbar} severity={snackbarSeverity}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
          {isTabsEnabled ? (
            <Fragment>
              {(rights.includes(RIGHT_POLICYHOLDERINSUREE_CREATE) ||
                rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_CREATE)) && (
                  <Grid
                    container
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={1}
                  >
                    <label>
                      <Button
                        onClick={this.handleDownload}
                        variant="contained"
                        component="span"
                        color="primary"
                        startIcon={<GetAppIcon />}
                      // style={{ marginRight: "5px" }}
                      >
                        <FormattedMessage
                          module="policyHolder"
                          id="policyHolderInsuree.downloadsample"
                        />
                      </Button>
                    </label>
                    <Grid item>
                      <label htmlFor="download-button">
                        <Button
                          onClick={this.handleInsureeDownload}
                          variant="contained"
                          component="span"
                          color="primary"
                          style={{
                            // marginLeft: "50px",
                            display: "flex",
                            justifyContent: "end",
                          }}
                          startIcon={<GetAppIcon />}
                        >
                          <FormattedMessage
                            module="policyHolder"
                            id="policyHolderInsuree.downloadInsuree"
                          />
                        </Button>
                      </label>
                    </Grid>
                    <Input
                      required
                      id="import-button"
                      style={{ display: "none" }}
                      inputProps={{
                        accept:
                          ".xls, application/vnd.ms-excel, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      }}
                      type="file"
                      onChange={this.onUpload}
                    />
                    <label htmlFor="import-button">
                      <Button
                        variant="contained"
                        component="span"
                        color="primary"
                        startIcon={<CloudUploadIcon />}
                      >
                        <FormattedMessage
                          module="policyHolder"
                          id="policyHolderInsuree.import"
                        />
                      </Button>
                    </label>
                    <Grid item>
                      <Typography>
                        <FormattedMessage
                          module="policyHolder"
                          id="policyHolderInsuree.createPolicyHolderInsuree"
                        />
                      </Typography>
                    </Grid>
                    <Grid item>
                      <CreatePolicyHolderInsureeDialog
                        policyHolder={policyHolder}
                        onSave={this.onSave}
                      />
                    </Grid>

                  </Grid>
                )}
              <PolicyHolderInsureeSearcher
                policyHolder={policyHolder}
                rights={rights}
                reset={this.state.reset}
                onSave={this.onSave}
                insureeCheck={this.state.insureeCheck}
                loading={this.state.isLoading}
              />
            </Fragment>
          ) : (
            <FormattedMessage
              module="policyHolder"
              id="policyHolderInsuree.tabDisabledError"
            />
          )}
          {/* {(fetching || error) && (
          <Grid className={classes.loader} container justifyContent="center" alignItems="center">
            <ProgressOrError progress={this.state.insureeCheck} error={downloadError} />{" "}
            {/* We do not want to display the spinner with the empty table */}
          {/* </Grid>
        )}  */}
        </PublishedComponent>
      )
    );
  }
}

export { PolicyHolderInsureesTabLabel, PolicyHolderInsureesTabPanel };
