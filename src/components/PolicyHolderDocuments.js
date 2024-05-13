import React, { Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import _ from "lodash";
import {
    Paper,
    IconButton,
    Grid,
    Divider,
    Typography,
    Tooltip,
    Button,
} from "@material-ui/core";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import {
    formatMessage,
    withModulesManager,
    historyPush,
    withTooltip,
    formatSorter,
    sort,
    coreAlert,
    Table,
    PagedDataHandler,
    ProgressOrError,
} from "@openimis/fe-core";
import {
    fetchInsureeDocuments,
} from "../actions";

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
    },
});
const DOCUMENT_REJECT_COMMENTS = ["1", "2"];
class PolicyHolderDocuments extends PagedDataHandler {
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

    componentDidMount() {
        this.setState({ orderBy: null }, (e) =>
            this.onChangeRowsPerPage(this.defaultPageSize)
        );
    }
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
        if (this.props.edited && prevProps.edited !== this.props.edited) {
            console.log("this.props.edited", this.props.edited);
            this.props.fetchInsureeDocuments(this.props.edited.code ? this.props.edited.code : this.props.edited.requestNumber);
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
    approved = async (docData) => {
        const response = await this.props.updateInsureeDocument(docData);
    };
    rejectDoc = async (docData) => {
        const response = await this.props.updateInsureeDocument(docData);
    };


    headers = [
        "documentsName",
        "viewDocuments",
    ];

    sorter = (attr, asc = true) => [
        () =>
            this.setState(
                (state, props) => ({ orderBy: sort(state.orderBy, attr, asc) }),
                (e) => this.query()
            ),
        () => formatSorter(this.state.orderBy, attr, asc),
    ];

    headerActions = [];

    onDocumentViewClose = () => {
        this.setState({ documentViewOpen: false });
    };
    rejectedCommentsTooltip = (rejectComment) => {
        return (
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
    ];

    rowLocked = (i) => !!i.clientMutationId;
    onChangeSelection = (i) => {
        console.log("hi");
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
        let actions =
            !!readOnly || !!checkingCanAddInsuree || !!errorCanAddInsuree
                ? []
                : [];
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
                                module="policyholder"
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
                                <Typography
                                    style={{
                                        color: "red",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        alignItems: "center",
                                        padding: "6rem 0",
                                        fontSize: "1.8rem",
                                    }}
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
    fetchingDocuments: state.payment.fetchingDocuments,
    errorDocuments: state.payment.errorDocuments,

    documentDetails: state.payment.documentsData,
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(
        {
            coreAlert,
            fetchInsureeDocuments,
        },
        dispatch
    );
};

export default withModulesManager(
    injectIntl(
        withTheme(
            withStyles(styles)(
                connect(mapStateToProps, mapDispatchToProps)(PolicyHolderDocuments)
            )
        )
    )
);
