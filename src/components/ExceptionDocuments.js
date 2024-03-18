import React, { Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import _ from "lodash";
import {
    Checkbox,
    Paper,
    IconButton,
    Grid,
    Divider,
    Typography,
    Tooltip,
    Button,
    Box,
} from "@material-ui/core";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import {
    formatMessage,
    formatMessageWithValues,
    withModulesManager,
    formatDateFromISO,
    historyPush,
    withTooltip,
    FormattedMessage,
    formatSorter,
    sort,
    coreAlert,
    Table,
    PagedDataHandler,
    PublishedComponent,
    ProgressOrError,
    ConstantBasedPicker,
} from "@openimis/fe-core";
import {
    // fetchFamilyMembers,
    // selectFamilyMember,
    fetchInsureeDocuments,
    // updateInsureeDocument,
} from "../actions";

// import DocumentViewDialog from "./DocumentViewDialog";
// import DocumentView from "./DocumentView";
import HelpIcon from "@material-ui/icons/Help";
import DocumentView from "./DocumentView";

const styles = (theme) => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    tableTitle: theme.table.title,
    tableHeader: theme.table.header,
    biometricPaper: {
        background: "#fff",
    },
    btnPrimary: theme.formTable.actions,
    approvedIcon: {
        "&.Mui-checked": {
            color: "#00913E",
        },
    },
    rejectIcon: {
        "&.Mui-checked": {
            color: "#FF0000",
        },
    },
    commonBtn: {
        color: "grey",
    },
    noBtnClasses: {
        visibility: "hidden",
    },
    customArrow: {
        color: "#eeeaea",
    },
    tooltip: {
        maxWidth: 1000,
        width: "fit-content",
        // width: "auto",
        // color: "white",
        // backgroundColor: "#eeeaea",
    },
    typograpghy: {
        color: "red",
        justifyContent: "center",
        textAlign: "center",
        alignItems: "center",
        padding: "6rem 0",
        fontSize: "1.8rem",

    },
});
const DOCUMENT_REJECT_COMMENTS = ["1", "2"];
class ExceptionDocuments extends PagedDataHandler {
    state = {
        documentViewOpen: false,
        chfid: null,
        confirmedAction: null,
        documentId: null,
        changeInsureeFamily: null,
        reset: 0,
        canAddAction: null,
        checkedCanAdd: false,
        dataFromAPI: null,
    };

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = props.modulesManager.getConf(
            "fe-insuree",
            "familyInsureesOverview.rowsPerPageOptions",
            [5, 10, 20]
        );
        this.defaultPageSize = props.modulesManager.getConf(
            "fe-insuree",
            "familyInsureesOverview.defaultPageSize",
            5
        );
    }
    componentDidUpdate() {
        this.setState({ orderBy: null }, (e) =>
            this.onChangeRowsPerPage(this.defaultPageSize)
        );
        if (this.props?.edited[0]?.code) {
            // this.props.fetchInsureeDocuments();
            this.props.fetchInsureeDocuments(this.props?.edited[0]?.code);
        }
    }
    // componentDidMount() {
    //     this.setState({ orderBy: null }, (e) =>
    //         this.onChangeRowsPerPage(this.defaultPageSize)
    //     );
    //     debugger;
    //     if (this.props.edited?.fosaCode) {
    //         // this.props.fetchInsureeDocuments();
    //         this.props.fetchInsureeDocuments(this.props?.edited?.fosaCode);
    //     }
    // }
    queryPrms = () => {
        let prms = [];
        if (!!this.state.orderBy) {
            prms.push(`orderBy: "${this.state.orderBy}"`);
        }
        if (!!this.props.family && !!this.props.family.uuid) {
            prms.push(`familyUuid:"${this.props.family.uuid}"`);
            return prms;
        }
        return null;
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.documentViewOpen !== this.state.documentViewOpen) {
            this.adjustButtonZIndex();
        }
        if (prevProps.edited[0]?.code != this.props?.edited[0]?.code) {
            // this.props.fetchInsureeDocuments();
            this.props.fetchInsureeDocuments(this.props?.edited[0]?.code);
        }
    }

    adjustButtonZIndex = () => {
        const buttonElements = document.querySelectorAll(
            'div[title="Save changes"], div[title="Create new"]'
        );
        if (this.state.documentViewOpen) {
            if (buttonElements.length > 0) {
                buttonElements.forEach((element) => {
                    if (element.style) {
                        element.style.zIndex = "1000";
                    }
                });
            }
        } else {
            if (buttonElements.length > 0) {
                buttonElements.forEach((element) => {
                    if (element.style) {
                        element.style.zIndex = "2000";
                    }
                });
            }
        }
    };

    onDoubleClick = (i, newTab = false) => {
        historyPush(
            this.props.modulesManager,
            this.props.history,
            "insuree.route.insuree",
            [i.uuid, this.props.family.uuid],
            newTab
        );
    };
    // handleExternalNavigation = () => {
    //   window.open(process.env.REACT_APP_ABIS_URL, "_blank");
    // };
    // approved = async (docData) => {
    //     const response = await this.props.updateInsureeDocument(docData);
    //     setTimeout(() => {
    //         this.props.fetchInsureeDocuments(this.props?.edited?.fosaCode);
    //     }, 2000);
    // };
    // rejectDoc = async (docData) => {
    //     const response = await this.props.updateInsureeDocument(docData);
    //     setTimeout(() => {
    //         this.props.fetchInsureeDocuments(this.props?.edited?.fosaCode);
    //     }, 1000);
    // };
    // onChangeSelection = (i) => {
    //   this.props.selectFamilyMember(i[0] || null);
    // };

    headers = [
        "Documents Name",
        "View Documents",
        // "Insuree.status",
    ];

    sorter = (attr, asc = true) => [
        () =>
            this.setState(
                (state, props) => ({ orderBy: sort(state.orderBy, attr, asc) }),
                (e) => this.query()
            ),
        () => formatSorter(this.state.orderBy, attr, asc),
    ];

    headerActions = [
        // this.sorter("documentsName"),
        // this.sorter("viewDocuments"),
        // this.sorter("status"),
    ];

    onDocumentViewClose = () => {
        this.setState({ documentViewOpen: false });
    };
    rejectedCommentsTooltip = (rejectComment) => {
        return (
            // <PublishedComponent
            //   pubRef="insuree.RejectCommentPicker"
            //   withNull
            //   filterLabels={false}
            //   value={!!rejectComment.comments && Number(rejectComment.comments)}
            //   readOnly={true}
            // >
            //   <div style={{ color: "white" }}>{rejectComment.comments}</div>
            // </PublishedComponent>
            // <ConstantBasedPicker
            //   module="insuree"
            //   label="Insuree.rejectComments"
            //   readOnly={true}
            //   value={!!rejectComment.comments && rejectComment.comments}
            //   // onChange={(v) => setRejectComment(v)}P
            //   constants={DOCUMENT_REJECT_COMMENTS}
            //   // withNull
            //   withLabel={false}
            // />
            formatMessage(
                this.props.intl,
                "insuree",
                `Insuree.rejectComments.${rejectComment.comments}`
            )
        );
    };
    viewDocumentAction = (uuid) => {
        return (
            <Tooltip
                title={formatMessage(
                    this.props.intl,
                    "insuree",
                    "Insuree.viewDocuments"
                )}
            >
                <IconButton
                    onClick={(e) =>
                        this.setState({ documentId: uuid, documentViewOpen: true })
                    }
                >
                    <InsertDriveFileIcon className={this.props.classes.btnPrimary} />
                </IconButton>
            </Tooltip>
        );
    };
    getCheckBoxClass = (status) => {
        const checkStatus = status.documentStatus;
        let selectedClass = null;
        let rejectedTooltip = null;
        let docsStatus = null;
        switch (checkStatus) {
            case "APPROVED":
                selectedClass = this.props.classes.approvedIcon;
                // docsStatus = "Approved";
                docsStatus = formatMessage(
                    this.props.intl,
                    "insuree",
                    "Insuree.approved"
                );
                break;
            case "REJECTED":
                selectedClass = this.props.classes.rejectIcon;
                rejectedTooltip = (
                    <Tooltip
                        placement="right"
                        arrow
                        classes={{
                            tooltip: this.props.classes.tooltip,
                            arrow: this.props.classes.customArrow,
                        }}
                        title={this.rejectedCommentsTooltip(status)}
                    >
                        <IconButton>
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                );
                // docsStatus = "Rejected";
                docsStatus = formatMessage(
                    this.props.intl,
                    "insuree",
                    "Insuree.rejected"
                );
                break;
            case "PENDING_FOR_REVIEW":
                selectedClass = this.props.classes.commonBtn;
                // docsStatus = "NOT REVIEWED";
                docsStatus = formatMessage(
                    this.props.intl,
                    "insuree",
                    "Insuree.notReviewed"
                );
                break;
            default:
                selectedClass = this.props.classes.noBtnClasses;
                break;
        }

        return { selectedClass, rejectedTooltip, docsStatus };
    };

    formatters = [
        (i) => formatMessage(this.props.intl, "insuree", i.documentName) || "",
        (i) => !!i.documentId && this.viewDocumentAction(i.documentId),

        // (i) => {
        //   const { selectedClass, rejectedTooltip, docsStatus } =
        //     this.getCheckBoxClass(i);
        //   return (
        //     <>
        //       <Checkbox
        //         className={selectedClass}
        //         readOnly={true}
        //         disabled={true}
        //         checked={
        //           i.documentStatus == "APPROVED" || i.documentStatus == "REJECTED"
        //         }
        //       />
        //       {docsStatus}
        //       {rejectedTooltip}
        //     </>
        //   );
        // },
    ];

    // addNewInsuree = () =>
    //   historyPush(
    //     this.props.modulesManager,
    //     this.props.history,
    //     "insuree.route.insuree",
    //     ["_NEW_", this.props.family.uuid]
    //   );
    rowLocked = (i) => !!i.clientMutationId;
    onChangeSelection = (i) => {
        // this.props.selectFamilyMember(i[0] || null);
    };
    render() {
        const {
            intl,
            classes,
            pageInfo,
            family,
            fetchingDocuments,
            errorDocuments,
            readOnly,
            checkingCanAddInsuree,
            errorCanAddInsuree,
            edited,
            documentDetails,
            dataFromAPI,
        } = this.props;
        console.log("edit",edited)
        let actions =
            !!readOnly || !!checkingCanAddInsuree || !!errorCanAddInsuree
                ? []
                : [
                    // {
                    //   button: (
                    //     <Button onClick={this.handleExternalNavigation} variant="contained" color="primary">
                    //       Collect Documents
                    //     </Button>
                    //   ),
                    // },
                ];
        if (!!checkingCanAddInsuree || !!errorCanAddInsuree) {
            actions.push({
                button: (
                    <div>
                        <ProgressOrError
                            progress={checkingCanAddInsuree}
                            error={errorCanAddInsuree}
                        />
                    </div>
                ),
                tooltip: formatMessage(intl, "insuree", "familyCheckCanAdd"),
            });
        }
        let bioActions =
            !!readOnly || !!checkingCanAddInsuree || !!errorCanAddInsuree
                ? []
                : [
                    {
                        button: (
                            <Button
                                onClick={this.handleExternalNavigation}
                                variant="contained"
                                color="primary"
                            >
                                {formatMessage(intl, "insuree", "Insuree.CollectBiometric")}
                            </Button>
                        ),
                    },
                ];
        if (!!checkingCanAddInsuree || !!errorCanAddInsuree) {
            actions.push({
                button: (
                    <div>
                        <ProgressOrError
                            progress={checkingCanAddInsuree}
                            error={errorCanAddInsuree}
                        />
                    </div>
                ),
                tooltip: formatMessage(intl, "insuree", "familyCheckCanAdd"),
            });
        }
        return (
            <Grid container>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Grid
                            container
                            alignItems="center"
                            direction="row"
                            className={classes.paperHeader}
                        >
                            <Grid item xs={8}>
                                <Typography className={classes.tableTitle}>
                                    <FormattedMessage
                                        module="location"
                                        id="Exception Documents"
                                    />
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Grid container justify="flex-end">
                                    {actions.map((a, idx) => {
                                        return (
                                            <Grid
                                                item
                                                key={`form-action-${idx}`}
                                                className={classes.paperHeaderAction}
                                            >
                                                {withTooltip(a.button, a.tooltip)}
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                        </Grid>
                        {documentDetails?.length > 0 && !fetchingDocuments ? (
                            <Table
                                module="location"
                                headers={this.headers}
                                headerActions={this.headerActions}
                                itemFormatters={this.formatters}
                                items={documentDetails}
                                fetching={fetchingDocuments}
                                error={errorDocuments}
                                onDoubleClick={this.onDoubleClick}
                                withSelection={"single"}
                                onChangeSelection={this.onChangeSelection}
                                withPagination={false}
                                rowsPerPageOptions={this.rowsPerPageOptions}
                                defaultPageSize={this.defaultPageSize}
                                page={this.currentPage()}
                                pageSize={this.currentPageSize()}
                                count={0}
                                onChangePage={this.onChangePage}
                                onChangeRowsPerPage={this.onChangeRowsPerPage}
                                rowLocked={this.rowLocked}
                            />
                        ) : !fetchingDocuments && documentDetails?.length == 0 ? (
                            <Grid
                                style={{
                                    dispaly: "flex",
                                    height: "15rem",
                                }}
                            >
                                <Typography className={classes.typograpghy}
                                // style={{
                                //     color: "red",
                                //     justifyContent: "center",
                                //     textAlign: "center",
                                //     alignItems: "center",
                                //     padding: "6rem 0",
                                //     fontSize: "1.8rem",
                                // }}
                                >
                                    {formatMessage(
                                        this.props.intl,
                                        "insuree",
                                        "Insuree.noDocuments"
                                    )}
                                </Typography>
                            </Grid>
                        ) : null}
                    </Paper>
                </Grid>
                {/* <Grid item xs={5}>
          <Paper className={classes.paper}>
            <Grid container alignItems="center" direction="row" className={classes.paperHeader}>
              <Grid item xs={8}>
                <Typography className={classes.tableTitle}>
                  <FormattedMessage module="insuree" id="Insuree.BiometricHeading" />
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Grid container justify="flex-end">
                  {bioActions.map((a, idx) => {
                    return (
                      <Grid item key={`form-action-${idx}`} className={classes.paperHeaderAction}>
                        {withTooltip(a.button, a.tooltip)}
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
              <Grid item xs={12} className={classes.biometricPaper}>
                <Divider />
                <Grid container justify="center" alignItems="center" style={{ backgroundColor: "#00913E0D" }}>
                  <Typography style={{ padding: "30px 20px" }} alignItems="center">
                    {
                      edited?.biometricsStatus ? (
                        edited.biometricsIsMaster ? (
                          <ValidBiometric fontSize="large" />
                        ) : (
                          <InvalidBiometric fontSize="large" />
                        )
                      ) : (
                        <DisabledBiometric fontSize="large" />
                      )
                     
                    }
                  </Typography>
                  <Typography
                    variant="h6"
                    style={{
                      fontSize: "1.4rem",
                      color: edited?.biometricsStatus ? (edited.biometricsIsMaster ? "#00913E" : "#FF0000") : "black",
                    }}
                  >
                    {`  ${
                      edited?.biometricsStatus
                        ? edited.biometricsIsMaster
                          ? formatMessage(this.props.intl, "insuree", "Insuree.biometricStatus.masterRecordFound")
                          : formatMessage(this.props.intl, "insuree", "Insuree.biometricStatus.duplicateRecordFound")
                        : formatMessage(this.props.intl, "insuree", "Insuree.biometricStatus.detailNotProvided")
                    }`}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid> */}
                {!!this.state.documentViewOpen && (
                    <DocumentView
                        open={this.state.documentViewOpen}
                        onClose={this.onDocumentViewClose}
                        documentImage={this.state.documentId}
                        approved={this.approved}
                        rejectDoc={this.rejectDoc}
                    />
                )}
            </Grid>
        );
    }
}

const mapStateToProps = (state) => ({
    family: state,
    fetchingDocuments: state.policyHolder.fetchingDocuments,
    errorDocuments: state.policyHolder.errorDocuments,
    documentDetails: state.policyHolder.documentsData,
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        {
            // selectFamilyMember,
            coreAlert,
            fetchInsureeDocuments,
            // updateInsureeDocument,
        },
        dispatch
    );
};

export default withModulesManager(
    injectIntl(
        withTheme(
            withStyles(styles)(
                connect(mapStateToProps, mapDispatchToProps)(ExceptionDocuments)
            )
        )
    )
);
