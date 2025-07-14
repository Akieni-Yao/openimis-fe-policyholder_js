import React from "react";
import BusinessIcon from "@material-ui/icons/Business";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import { FormattedMessage } from "@openimis/fe-core";
import messages_en from "./translations/en.json";
import messages_fr from "./translations/fr.json";
import PolicyHoldersPage from "./pages/PolicyHoldersPage";
import ExceptionReasonPage from "./pages/ExceptionReasonPage";
import PolicyHolderPage from "./pages/PolicyHolderPage";
import LegalFormPicker from "./pickers/LegalFormPicker";
import ActivityCodePicker from "./pickers/ActivityCodePicker";
import PolicyHolderMenu from "./menus/PolicyHolderMenu";
import reducer from "./reducer";
import {
  RIGHT_POLICYHOLDERUSER_SEARCH,
  RIGHT_POLICYHOLDER_SEARCH,
  RIGHT_PORTALPOLICYHOLDERUSER_SEARCH,
  RIGHT_PORTALPOLICYHOLDER_SEARCH,
} from "./constants";
import TabPanel from "./components/TabPanel";
import {
  PolicyHolderInsureesTabLabel,
  PolicyHolderInsureesTabPanel,
} from "./components/PolicyHolderInsureesTab";
import {
  PolicyHolderContributionPlanBundlesTabLabel,
  PolicyHolderContributionPlanBundlesTabPanel,
} from "./components/PolicyHolderContributionPlanBundlesTab";
import ConfigBasedPicker from "./pickers/ConfigBasedPicker";
import PolicyHolderPicker from "./pickers/PolicyHolderPicker";
import PolicyHolderContributionPlanBundlePicker from "./pickers/PolicyHolderContributionPlanBundlePicker";
import PolicyHolderInsureePicker from "./pickers/PolicyHolderInsureePicker";
import {
  PolicyHolderPaymentsTabLabel,
  PolicyHolderPaymentsTabPanel,
} from "./components/PolicyHolderPaymentsTab";
import PolicyHolderUsersPage from "./pages/PolicyHolderUsersPage";
import {
  PolicyHolderUsersTabLabel,
  PolicyHolderUsersTabPanel,
} from "./components/PolicyHolderUsersTab";
import { POLICYHOLDER_PICKER_PROJECTION } from "./actions";

import DeclarationPage from "./pages/DeclarationPage";
import PaymentForApproval from "./pages/PaymentForApproval";
import RightsGeneralInfoPanel from "./components/RightsGeneralInfoPanel";
import ExceptionTabPanel from "./components/ExceptionTabPanel";
import {
  ExceptionInsureeTabLabel,
  ExceptionInsureeTabPanel,
} from "./pages/ExceptionInsureePage";
// import ExceptionRegionPicker from "./pickers/ExceptionStatusPicker";
import ExceptionRegionPicker from "./pickers/ExceptionRegionPicker";
import InsureeExceptionRegion from "./pickers/InsureeExceptionRegion";
import ExceptionStatusPicker from "./pickers/ExceptionStatusPicker";
import PolicyHolderPickerNew from "./pickers/PolicyHolderPickerNew";
import {
  ExceptionPolicyholderTabLabel,
  ExceptionPolicyholderTabPanel,
} from "./pages/ExceptionPolicyHolderPage";
import CamuCodePicker from "./pickers/CamuCodePicker";
import ExceptionForm from "./components/ExceptionForm";
import ExceptionInsureesFormPage from "./pages/ExceptionInsureesFormPage";
import ExceptionPolicyHolderFormPage from "./pages/ExceptionPolicyHolderFormPage ";
import ExceptionDocuments from "./components/ExceptionDocuments";
import PolicyHolderRequestSeacrher from "./components/PolicyHolderRequestSeacrher";
import RequestStatusPicker from "./pickers/RequestStatusPicker";
import PolicyholderApprovalForm from "./components/PolicyholderApprovalForm";
import PolicyHolderDocuments from "./components/PolicyHolderDocuments";
import {
  PolicyHolderPenaltyandSactionTabLabel,
  PolicyHolderPenaltyandSactionTabPanel,
} from "./components/PenaltyandSactionTab";
import BankPicker from "./pickers/BankAutoPicker";
import UnlockPolicyholderPage from "./pages/UnlockPolicyholderPage";

const ROUTE_POLICY_HOLDERS = "policyHolders";
const ROUTE_POLICY_HOLDER = "policyHolders/policyHolder";
const ROUTE_POLICY_HOLDER_UNLOCK = "policyHolders/unlock";
const ROUTE_POLICY_HOLDER_USERS = "policyHolderUsers";
const ROUTE_DECLARATION = "declaration";
const ROUTE_PAYMENT_FOR_APPROVAL = "paymentApproval";
const EXCEPTION_PANELS = "exception";
const EXCEPTION_PANELS_POLICYHOLDER = "exception/policyholder";
const EXCEPTION__PENDING_APPROVAL_PANELS = "exception/pendingapproval";
const EXCEPTION__PENDING_APPROVAL_POLICYHOLDER_PANELS =
  "exception/pendingapproval/policyholder";
const POLICYHOLDER_APPROVAL = "policyholder/approval";
const ROUTE_POLICYHOLDER_REQUEST = "policyholderRequest";
const ROUTE_EXCEPTION_REASON = "exception/reason";
const DEFAULT_CONFIG = {
  translations: [
    { key: "en", messages: messages_en },
    { key: "fr", messages: messages_fr },
  ],
  reducers: [{ key: "policyHolder", reducer }],
  refs: [
    { key: "policyHolder.LegalFormPicker", ref: LegalFormPicker },
    { key: "policyHolder.ActivityCodePicker", ref: ActivityCodePicker },
    { key: "policyHolder.BankPicker", ref: BankPicker },
    { key: "policyHolder.ConfigBasedPicker", ref: ConfigBasedPicker },
    { key: "policyHolder.TabPanel", ref: TabPanel },
    { key: "policyHolder.PolicyHolderPicker", ref: PolicyHolderPicker },
    { key: "policyHolder.PolicyHolderPickerNew", ref: PolicyHolderPickerNew },
    { key: "policyHolder.ExceptionRegionPicker", ref: ExceptionRegionPicker },
    { key: "policyHolder.InsureeExceptionRegion", ref: InsureeExceptionRegion },

    { key: "policyHolder.ExceptionStatusPicker", ref: ExceptionStatusPicker },
    { key: "policyHolder.RequestStatusPicker", ref: RequestStatusPicker },
    { key: "policyHolder.camuCodePicker", ref: CamuCodePicker },
    {
      key: "policyHolder.PolicyHolderPicker.projection",
      ref: POLICYHOLDER_PICKER_PROJECTION,
    },
    {
      key: "policyHolder.PolicyHolderInsureePicker",
      ref: PolicyHolderInsureePicker,
    },
    {
      key: "policyHolder.PolicyHolderInsureePicker.projection",
      ref: [
        "id",
        "insuree{id,lastName,otherNames}",
        "contributionPlanBundle{id,code,name}",
      ],
    },
    {
      key: "policyHolder.PolicyHolderContributionPlanBundlePicker",
      ref: PolicyHolderContributionPlanBundlePicker,
    },
    {
      key: "policyHolder.PolicyHolderContributionPlanBundlePicker.projection",
      ref: ["id", "contributionPlanBundle{id,code,name}"],
    },
    { key: "policyHolder.route.policyHolders", ref: ROUTE_POLICY_HOLDERS },
    { key: "policyHolder.route.policyHolder", ref: ROUTE_POLICY_HOLDER },
    {
      key: "policyHolder.route.policyHolder.unlock",
      ref: ROUTE_POLICY_HOLDER_UNLOCK,
    },
    {
      key: "policyHolder.route.exception",
      ref: EXCEPTION__PENDING_APPROVAL_PANELS,
    },
    {
      key: "policyHolder.route.exception.policyholder",
      ref: EXCEPTION__PENDING_APPROVAL_POLICYHOLDER_PANELS,
    },
    {
      key: "policyHolder.route.policyholder.approval",
      ref: POLICYHOLDER_APPROVAL,
    },
    {
      key: "policyHolder.route.policyholderRequest",
      ref: ROUTE_POLICYHOLDER_REQUEST,
    },
  ],
  "core.Router": [
    { path: ROUTE_POLICY_HOLDERS, component: PolicyHoldersPage },
    {
      path: ROUTE_POLICY_HOLDER_UNLOCK + "/:policyholder_id?",
      component: UnlockPolicyholderPage,
    },
    {
      path: ROUTE_POLICY_HOLDER + "/:policyholder_id?",
      component: PolicyHolderPage,
    },
    { path: ROUTE_POLICY_HOLDER_USERS, component: PolicyHolderUsersPage },
    { path: ROUTE_DECLARATION, component: DeclarationPage },
    {
      path: ROUTE_POLICYHOLDER_REQUEST,
      component: PolicyHolderRequestSeacrher,
    },
    { path: ROUTE_PAYMENT_FOR_APPROVAL, component: PaymentForApproval },
    { path: EXCEPTION_PANELS, component: ExceptionTabPanel },
    { path: EXCEPTION_PANELS_POLICYHOLDER, component: ExceptionTabPanel },
    { path: ROUTE_EXCEPTION_REASON, component: ExceptionReasonPage },
    {
      path: EXCEPTION__PENDING_APPROVAL_PANELS,
      component: ExceptionTabPanel,
    },
    {
      path: EXCEPTION__PENDING_APPROVAL_PANELS + "/:policyholder_id?",
      component: ExceptionInsureesFormPage,
    },
    {
      path:
        EXCEPTION__PENDING_APPROVAL_POLICYHOLDER_PANELS + "/:policyholder_id?",
      component: ExceptionPolicyHolderFormPage,
    },
    {
      path: POLICYHOLDER_APPROVAL + "/:policyholder_id?",
      component: PolicyholderApprovalForm,
    },
  ],
  "policyHolder.policyHolder.documents": [ExceptionDocuments],
  "insuree.MainMenu": [
    {
      text: <FormattedMessage module="policyHolder" id="menu.policyHolders" />,
      icon: <BusinessIcon />,
      route: "/" + ROUTE_POLICY_HOLDERS,
      filter: (rights) =>
        [RIGHT_POLICYHOLDER_SEARCH, RIGHT_PORTALPOLICYHOLDER_SEARCH].some(
          (right) => rights.includes(right)
        ),
    },
  ],
  //   "admin.MainMenu": [
  //     {
  //       text: (
  //         <FormattedMessage module="policyHolder" id="menu.policyHolderUsers" />
  //       ),
  //       icon: <SupervisorAccountIcon />,
  //       route: "/" + ROUTE_POLICY_HOLDER_USERS,
  //       filter: (rights) =>
  //         [
  //           RIGHT_POLICYHOLDERUSER_SEARCH,
  //           RIGHT_PORTALPOLICYHOLDERUSER_SEARCH,
  //         ].some((right) => rights.includes(right)),
  //     },
  //   ],
  "core.MainMenu": [PolicyHolderMenu],
  "policyHolder.TabPanel.label": [
    PolicyHolderInsureesTabLabel,
    PolicyHolderContributionPlanBundlesTabLabel,
    PolicyHolderPaymentsTabLabel,
    PolicyHolderUsersTabLabel,
    PolicyHolderPenaltyandSactionTabLabel,
  ],
  "policyHolder.TabPanel.panel": [
    PolicyHolderInsureesTabPanel,
    PolicyHolderContributionPlanBundlesTabPanel,
    PolicyHolderPaymentsTabPanel,
    PolicyHolderUsersTabPanel,
    PolicyHolderPenaltyandSactionTabPanel,
  ],
  "Exception.TabPanel.label": [
    ExceptionInsureeTabLabel,
    ExceptionPolicyholderTabLabel,
  ],
  "Exception.TabPanel.panel": [
    ExceptionInsureeTabPanel,
    ExceptionPolicyholderTabPanel,
  ],
  "policyholder.policyholder.documents": [PolicyHolderDocuments],
  "invoice.SubjectAndThirdpartyPicker": [
    {
      type: "policy holder",
      picker: PolicyHolderPicker,
      pickerProjection: POLICYHOLDER_PICKER_PROJECTION,
    },
  ],
  "policyholder.rightsGeneralInfo": [RightsGeneralInfoPanel],
};

export const PolicyHolderModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};
