import React, { Component, Fragment } from "react";
import {
  Tab,
  Grid,
  Typography,
  Input,
  Button,
  CircularProgress,
  Snackbar,
  Box,
} from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
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
import MuiAlert from "@material-ui/lab/Alert";
import axios from "axios";
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
      snackbarMessage: "",
      snackbarSeverity: "success",
      snackbarOpen: false,
      importProgress: null,
      isImporting: false,
      currentTaskId: null,
      downloadUrl: null,
      checkingTask: true,
    };
    this.progressIntervalRef = null;
    this.fileInputRef = React.createRef();
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

  componentDidMount() {
    this.checkStoredResults();
    this.checkForActiveTask();
  }

  componentDidUpdate(prevProps) {
    const { policyHolder } = this.props;
    const prevPolicyHolder = prevProps.policyHolder;
    if (policyHolder?.code && policyHolder?.code !== prevPolicyHolder?.code) {
      this.setState({ checkingTask: true }, () => {
        this.checkForActiveTask();
        this.checkStoredResults();
      });
    }
  }

  componentWillUnmount() {
    if (this.progressIntervalRef) {
      try {
        this.progressIntervalRef();
      } catch (err) {
        console.warn("Error cleaning up progress interval:", err);
      }
      this.progressIntervalRef = null;
    }
  }

  getActiveTask = async (phCode, taskId = null) => {
    try {
      let url = `${baseApiUrl}/policyholder/active-insuree-task/${encodeURIComponent(
        phCode
      )}`;
      if (taskId) {
        url += `?task_id=${encodeURIComponent(taskId)}`;
      }
      const res = await axios.get(url, {
        headers: apiHeaders,
        credentials: "same-origin",
      });
      return res.data;
    } catch (error) {
      console.error("[PROGRESS] Error fetching active task:", error);
      return null;
    }
  };

  handleProgressInterval = (
    taskId = null,
    phCode,
    onSuccess,
    onError,
    onProgress
  ) => {
    const interval = 1000 * 2;

    const progressInterval = setInterval(() => {
      checkProgress();
    }, interval);

    const checkProgress = async () => {
      const savedTaskId = taskId
        ? taskId
        : localStorage.getItem(`active_insuree_task_${phCode}`);

      let activeTaskData = null;
      try {
        activeTaskData = await this.getActiveTask(phCode, savedTaskId);
      } catch (err) {
        console.warn("Error fetching active task:", err);
        return;
      }

      if (!activeTaskData) {
        clearInterval(progressInterval);
        if (savedTaskId) {
          localStorage.removeItem(`active_insuree_task_${phCode}`);
        }
        onError();
        return;
      }

      const progress = {
        status: activeTaskData.status,
        percent: activeTaskData.percent || 0,
        total: activeTaskData.total || 0,
        processed: activeTaskData.processed || 0,
        success_count: activeTaskData.success_count || 0,
        error_count: activeTaskData.error_count || 0,
        download_url: activeTaskData.download_url,
      };

      if (typeof onProgress === "function") {
        onProgress(progress);
      }

      if (!activeTaskData.has_active_task && activeTaskData.ready) {
        clearInterval(progressInterval);
        localStorage.removeItem(`active_insuree_task_${phCode}`);
        if (activeTaskData.status === "FAILED" || !activeTaskData.successful) {
          onError(progress);
          return;
        }
        onSuccess(progress);
        return;
      }

      if (
        progress &&
        (progress?.status === "COMPLETED" || progress?.status === "SUCCESS")
      ) {
        clearInterval(progressInterval);
        localStorage.removeItem(`active_insuree_task_${phCode}`);
        onSuccess(progress);
        return;
      }

      if (progress && progress?.status === "FAILED") {
        clearInterval(progressInterval);
        localStorage.removeItem(`active_insuree_task_${phCode}`);
        onError(progress);
      }
    };

    return () => {
      clearInterval(progressInterval);
    };
  };

  checkStoredResults = () => {
    const { policyHolder } = this.props;
    if (!policyHolder?.code) return;

    const storedResult = localStorage.getItem(
      `importResult_${policyHolder.code}`
    );

    if (storedResult) {
      try {
        const result = JSON.parse(storedResult);
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

        if (result.timestamp && result.timestamp > twentyFourHoursAgo) {
          this.setState({
            snackbarMessage: result.message,
            snackbarSeverity: result.severity,
            snackbarOpen: true,
            downloadUrl: result.downloadUrl || this.state.downloadUrl,
          });
          localStorage.removeItem(`importResult_${policyHolder.code}`);
        } else {
          localStorage.removeItem(`importResult_${policyHolder.code}`);
        }
      } catch (err) {
        console.warn("Error parsing stored result:", err);
        localStorage.removeItem(`importResult_${policyHolder.code}`);
      }
    }
  };

  checkForActiveTask = async () => {
    const { policyHolder } = this.props;
    if (!policyHolder?.code) {
      this.setState({ checkingTask: false, isImporting: false });
      return;
    }

    try {
      const savedTaskId = localStorage.getItem(
        `active_insuree_task_${policyHolder.code}`
      );

      const taskData = await this.getActiveTask(policyHolder.code, savedTaskId);

      if (!taskData) {
        this.setState({
          isImporting: false,
          importProgress: null,
          currentTaskId: null,
          checkingTask: false,
        });
        if (savedTaskId) {
          localStorage.removeItem(`active_insuree_task_${policyHolder.code}`);
        }
        return;
      }

      if (taskData?.task_id && taskData?.ready && !taskData?.has_active_task) {
        this.setState(
          {
            isImporting: false,
            importProgress: null,
            currentTaskId: null,
            checkingTask: false,
          },
          () => {}
        );

        localStorage.removeItem(`active_insuree_task_${policyHolder.code}`);

        if (this.fileInputRef.current) {
          this.fileInputRef.current.value = "";
        }

        if (taskData.download_url) {
          this.setState({ downloadUrl: taskData.download_url });
        }

        if (!this.state.snackbarOpen) {
          if (taskData.successful) {
            const successMessage =
              taskData?.success_count !== undefined &&
              taskData?.error_count !== undefined
                ? `Téléchargement réussi - ${
                    taskData.success_count || 0
                  } succès, ${taskData.error_count || 0} erreurs`
                : "Téléchargement réussi";
            this.setState({
              snackbarMessage: successMessage,
              snackbarSeverity: "success",
              snackbarOpen: true,
              insureeCheck: true,
            });
            this.onSave();
          } else {
            const errorMessage = "Téléchargement échoué";
            this.setState({
              snackbarMessage: errorMessage,
              snackbarSeverity: "error",
              snackbarOpen: true,
            });
          }
        }
        return;
      }

      if (taskData?.has_active_task && taskData?.task_id) {
        localStorage.setItem(
          `active_insuree_task_${policyHolder.code}`,
          taskData.task_id
        );

        if (this.progressIntervalRef) {
          try {
            this.progressIntervalRef();
          } catch (err) {
            console.warn("Error clearing previous progress interval:", err);
          }
          this.progressIntervalRef = null;
        }

        this.setState(
          {
            currentTaskId: taskData.task_id,
            isImporting: true,
            checkingTask: false,
            downloadUrl: taskData.download_url || this.state.downloadUrl,
            importProgress: {
              status: taskData.status,
              percent: taskData.percent || 0,
              total: taskData.total || 0,
              processed: taskData.processed || 0,
              success_count: taskData.success_count || 0,
              error_count: taskData.error_count || 0,
            },
          },
          () => {
            this.progressIntervalRef = this.handleProgressInterval(
              null,
              policyHolder.code,
              this.onSuccessUpload,
              this.onErrorUpload,
              this.onProgressUpdate
            );
          }
        );
      } else {
        this.setState({
          isImporting: false,
          importProgress: null,
          currentTaskId: null,
          checkingTask: false,
        });
        if (savedTaskId) {
          localStorage.removeItem(`active_insuree_task_${policyHolder.code}`);
        }
      }
    } catch (error) {
      console.error("Error checking for active task:", error);
      this.setState({
        isImporting: false,
        importProgress: null,
        currentTaskId: null,
        checkingTask: false,
      });
    }
  };

  onSuccessUpload = (progressData) => {
    const { policyHolder } = this.props;
    if (this.progressIntervalRef) {
      try {
        this.progressIntervalRef();
      } catch (err) {
        console.warn("Error clearing progress interval:", err);
      }
      this.progressIntervalRef = null;
    }

    if (policyHolder?.code) {
      localStorage.removeItem(`active_insuree_task_${policyHolder.code}`);
    }

    const successMessage =
      progressData?.success_count !== undefined &&
      progressData?.error_count !== undefined
        ? `Téléchargement réussi - ${progressData.success_count || 0} succès, ${
            progressData.error_count || 0
          } erreurs`
        : "Téléchargement réussi";

    this.setState({
      isImporting: false,
      importProgress: null,
      currentTaskId: null,
      downloadUrl: progressData?.download_url || this.state.downloadUrl,
      snackbarMessage: successMessage,
      snackbarSeverity: "success",
      snackbarOpen: true,
      insureeCheck: true,
    });

    if (document.visibilityState !== "visible" && policyHolder?.code) {
      const result = {
        message: successMessage,
        severity: "success",
        downloadUrl: progressData?.download_url || null,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `importResult_${policyHolder.code}`,
        JSON.stringify(result)
      );
    }

    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = "";
    }

    this.onSave();
  };

  onErrorUpload = (progressData = null) => {
    const { policyHolder } = this.props;
    if (this.progressIntervalRef) {
      try {
        this.progressIntervalRef();
      } catch (err) {
        console.warn("Error clearing progress interval:", err);
      }
      this.progressIntervalRef = null;
    }

    if (policyHolder?.code) {
      localStorage.removeItem(`active_insuree_task_${policyHolder.code}`);
    }

    const errorMessage = "Téléchargement échoué";

    this.setState({
      isImporting: false,
      importProgress: null,
      currentTaskId: null,
      downloadUrl: progressData?.download_url || this.state.downloadUrl,
      snackbarMessage: errorMessage,
      snackbarSeverity: "error",
      snackbarOpen: true,
    });

    if (document.visibilityState !== "visible" && policyHolder?.code) {
      const result = {
        message: errorMessage,
        severity: "error",
        downloadUrl: progressData?.download_url || null,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `importResult_${policyHolder.code}`,
        JSON.stringify(result)
      );
    }

    this.setState((state) => ({
      reset: state.reset + 1,
    }));

    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = "";
    }
  };

  onProgressUpdate = (progress) => {
    this.setState({ importProgress: progress });
  };

  getStatusTranslationId = (status) => {
    const statusMap = {
      PROCESSING: "statusProcessing",
      COMPLETED: "statusCompleted",
      SUCCESS: "statusSuccess",
      FAILED: "statusFailed",
      UPLOADING: "statusUploading",
      PENDING: "statusPending",
    };
    return statusMap[status] || null;
  };

  isActionEnabled = () => {
    const { isImporting, checkingTask } = this.state;
    return !(isImporting || checkingTask);
  };

  handleDownloadResult = () => {
    const { downloadUrl } = this.state;
    if (downloadUrl) {
      const cleanUrl = downloadUrl.startsWith("/api")
        ? downloadUrl.substring(4)
        : downloadUrl;
      window.open(`${baseApiUrl}${cleanUrl}`, "_blank");
    }
  };

  downloadStatusFile = async () => {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      this.userlang === "fr"
        ? "Titulaires de polices_assurés"
        : "policyholder_insurees.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  onUpload = async (event) => {
    const { policyHolder } = this.props;
    const file = event.target.files[0];
    if (!file) return;
    if (this.state.isImporting || this.state.checkingTask) {
      event.preventDefault();
      return;
    }
    let formData = new FormData();
    formData.append("file", file);

    let encodedCode = encodeURIComponent(policyHolder.code);
    let url_import = `${baseApiUrl}/policyholder/imports/${encodedCode}/policyholderinsurees/v2`;

    this.setState({
      isImporting: true,
      importProgress: { status: "UPLOADING", percent: 0 },
      downloadUrl: null,
    });

    try {
      const response = await axios.post(url_import, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...apiHeaders,
        },
        credentials: "same-origin",
      });

      const taskId = response?.data?.task_id;
      if (taskId) {
        localStorage.setItem(
          `active_insuree_task_${policyHolder.code}`,
          taskId
        );
      }

      this.setState({
        currentTaskId: taskId || null,
        importProgress: {
          status: "PROCESSING",
          percent: 0,
          total: 0,
          processed: 0,
        },
      });

      if (this.progressIntervalRef) {
        try {
          this.progressIntervalRef();
        } catch (err) {
          console.warn("Error clearing previous progress interval:", err);
        }
        this.progressIntervalRef = null;
      }
      setTimeout(() => {
        this.progressIntervalRef = this.handleProgressInterval(
          null,
          policyHolder.code,
          this.onSuccessUpload,
          this.onErrorUpload,
          this.onProgressUpdate
        );
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      if (this.fileInputRef.current) {
        this.fileInputRef.current.value = "";
      }
      this.onErrorUpload();
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
    link.download =
      this.userlang === "fr"
        ? "Echantillon_données_assurés.xlsx"
        : "sample_insurees_data.xlsx";
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
      a.download =
        this.userlang === "fr"
          ? "liste des assurées Ouvrant droit.xlsx"
          : "policyholder_insurees.xlsx";
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
    const {
      snackbarOpen,
      snackbarMessage,
      snackbarSeverity,
      isImporting,
      importProgress,
      downloadUrl,
      checkingTask,
    } = this.state;

    return (
      (rights.includes(RIGHT_POLICYHOLDERINSUREE_SEARCH) ||
        rights.includes(RIGHT_PORTALPOLICYHOLDERINSUREE_SEARCH)) && (
        <PublishedComponent
          pubRef="policyHolder.TabPanel"
          module="policyHolder"
          index={POLICYHOLDERINSUREE_TAB_VALUE}
          value={value}
        >
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={this.handleCloseSnackbar}
          >
            <Alert
              onClose={this.handleCloseSnackbar}
              severity={snackbarSeverity}
            >
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
                  {isImporting && importProgress && (
                    <Grid item xs={12} style={{ marginBottom: "1rem" }}>
                      <div
                        style={{
                          padding: "1rem",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "4px",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          <FormattedMessage
                            module="policyHolder"
                            id="policyHolderInsuree.insureeImportProgress"
                          />
                        </Typography>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Box width="100%" mr={1}>
                            <LinearProgress
                              variant="determinate"
                              value={importProgress.percent || 0}
                              color={
                                importProgress.status === "FAILED"
                                  ? "secondary"
                                  : "primary"
                              }
                            />
                          </Box>
                          <Box minWidth={35}>
                            <Typography variant="body2" color="textSecondary">
                              {`${importProgress.percent || 0}%`}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2">
                          <FormattedMessage module="policyHolder" id="status" />
                          :{" "}
                          {this.getStatusTranslationId(
                            importProgress.status
                          ) ? (
                            <FormattedMessage
                              module="policyHolder"
                              id={this.getStatusTranslationId(
                                importProgress.status
                              )}
                            />
                          ) : (
                            importProgress.status
                          )}
                          {importProgress.total > 0 && (
                            <>
                              {" "}
                              - {importProgress.processed || 0} /{" "}
                              {importProgress.total}{" "}
                              <FormattedMessage
                                module="policyHolder"
                                id="processed"
                                defaultMessage="processed"
                              />
                            </>
                          )}
                        </Typography>
                        {(importProgress.success_count !== undefined ||
                          importProgress.error_count !== undefined) && (
                          <Typography variant="body2">
                            <FormattedMessage
                              module="policyHolder"
                              id="success"
                              defaultMessage="Success"
                            />
                            : {importProgress.success_count || 0} |{" "}
                            <FormattedMessage
                              module="policyHolder"
                              id="errors"
                              defaultMessage="Errors"
                            />
                            : {importProgress.error_count || 0}
                          </Typography>
                        )}
                      </div>
                    </Grid>
                  )}
                  <label>
                    <Button
                      onClick={this.handleDownload}
                      variant="contained"
                      component="span"
                      color="primary"
                      startIcon={<GetAppIcon />}
                      disabled={isImporting || checkingTask}
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
                        disabled={isImporting || checkingTask}
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
                    inputRef={this.fileInputRef}
                    inputProps={{
                      accept:
                        ".xls, application/vnd.ms-excel, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    }}
                    type="file"
                    onChange={this.onUpload}
                    disabled={isImporting || checkingTask}
                  />
                  <label htmlFor="import-button">
                    <Button
                      variant="contained"
                      component="span"
                      color="primary"
                      startIcon={
                        isImporting || checkingTask ? (
                          <CircularProgress size={20} />
                        ) : (
                          <CloudUploadIcon />
                        )
                      }
                      disabled={isImporting || checkingTask}
                    >
                      <FormattedMessage
                        module="policyHolder"
                        id="policyHolderInsuree.import"
                      />
                    </Button>
                  </label>
                  {downloadUrl && (
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<GetAppIcon />}
                        onClick={this.handleDownloadResult}
                        disabled={isImporting || checkingTask}
                      >
                        <FormattedMessage
                          module="policyHolder"
                          id="policyHolderInsuree.downloadImportResults"
                        />
                      </Button>
                    </Grid>
                  )}
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
                      disabled={isImporting || checkingTask}
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
                isActionEnabled={this.isActionEnabled()}
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
