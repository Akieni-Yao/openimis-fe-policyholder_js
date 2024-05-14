import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    Slide,
    makeStyles,
    Grid,
    IconButton,
    Typography,
} from "@material-ui/core";
import {
    PublishedComponent,
    TextInput,
    useTranslations,
    withModulesManager,
    combine,
    ConstantBasedPicker,
} from "@openimis/fe-core";
import { Close as CloseIcon } from "@material-ui/icons";

const useStyles = makeStyles(() => ({
    rejectBtn: {
        backgroundColor: "#FF0000",
        color: "#fff",
        "&:hover": {
            backgroundColor: "#c13a3a",
        },
    },
    approveBtn: {
        backgroundColor: "#00913E",
        color: "#fff",
        "&:hover": {
            backgroundColor: "#00652b",
        },
    },
    closeIcon: {
        position: "absolute",
        top: 0,
        right: 15,
    },
}));
const PolicyholderRework = (props) => {
    const {
        classes,
        reworkRequest,
        onClose,
        isOpen,
        payload,
        statusCheck,
        modulesManager,
        intl,
    } = props;
    console.log("payload", payload, "reworkRequest", reworkRequest)
    const approverData = useSelector((store) => store);
    const { formatMessage, formatMessageWithValues } = useTranslations(
        "policyHolder",
        modulesManager
    );
    const [comment, setComment] = useState({
        statusComment: null,
        status: "",
        reviewer: null,
        reason: null,
        validOption: null
    });
    const newClasses = useStyles();
    const handleChange = (name, value) => {
        setComment((prevComment) => ({
            ...prevComment,
            [name]: value,
        }));
    };
    useEffect(() => {
        if (statusCheck == 5) {
            setComment((prevComment) => ({ ...prevComment, status: 5 }));
        } else {
            setComment((prevComment) => ({ ...prevComment, status: -1 }));
        }
    }, [statusCheck]);
    const updatedPayload = { ...payload, ...comment };
    const payment_rejection = ["not_clear_docs", "not_valid"];
    return (
        <div>
            <Dialog open={isOpen} onClose={() => onClose()} maxWidth="xs" fullWidth>
                <DialogTitle style={{ fontWeight: 600 }}>
                    {statusCheck == "5"
                        && formatMessage("Request Missing Information")
                    }
                    <IconButton
                        edge="end"
                        className={newClasses.closeIcon}
                        color="inherit"
                        onClick={() => onClose()}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Grid item className={classes.item}>
                        <ConstantBasedPicker
                            module="policyHolder"
                            label="policyHolder.rejectComment"
                            value={
                                !!comment && !!comment?.statusComment
                                    ? comment?.statusComment
                                    : comment.statusComment
                            }
                            onChange={(value) => handleChange("statusComment", value)}
                            constants={payment_rejection}
                            // withNull
                        />
                    </Grid>
                    <Grid>
                        <TextInput
                            // pubRef="insuree"
                            module="policyholder"
                            label="policyholder.rejectComment"
                            required={false}
                            placeholder="Please write your comments here"
                            value={
                                !!comment && !!comment?.reason
                                    ? comment?.reason
                                    : comment.reason
                            }
                            onChange={(e) => handleChange("reason", e)}
                        />
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => onClose()}
                        variant="outlined"
                        className={classes.primaryButton}
                    >
                        {formatMessage("dialog.cancel")}
                    </Button>
                    <Button
                        onClick={() => reworkRequest(updatedPayload)}
                        variant="contained"
                        className={
                            statusCheck == "5" ? newClasses.approveBtn : newClasses.rejectBtn
                        }
                    >
                        {statusCheck == "5"
                            ? formatMessage("Send Request")
                            : formatMessage("button.reject")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
const enhance = combine(withModulesManager);
export default enhance(PolicyholderRework);
