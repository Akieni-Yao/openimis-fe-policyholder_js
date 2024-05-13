import {
  formatServerError,
  formatGraphQLError,
  parseData,
  pageInfo,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
} from "@openimis/fe-core";

function reducer(
  state = {
    fetchingPolicyHolders: false,
    errorPolicyHolders: null,
    fetchedPolicyHolders: false,
    policyHolders: [],
    policyHoldersPageInfo: {},
    policyHoldersTotalCount: 0,
    submittingMutation: false,
    mutation: {},
    fetchingPolicyHolder: false,
    errorPolicyHolder: null,
    fetchedPolicyHolder: false,
    policyHolder: {},
    fetchingPolicyHolderInsurees: false,
    errorPolicyHolderInsurees: null,
    fetchedPolicyHolderInsurees: false,
    policyHolderInsurees: [],
    policyHolderInsureesPageInfo: {},
    policyHolderInsureesTotalCount: 0,
    fetchingPickerPolicyHolderInsurees: false,
    errorPickerPolicyHolderInsurees: null,
    fetchedPickerPolicyHolderInsurees: false,
    pickerPolicyHolderInsurees: [],
    pickerPolicyHolderInsureesPageInfo: {},
    pickerPolicyHolderInsureesTotalCount: 0,
    fetchingPolicyHolderContributionPlanBundles: false,
    errorPolicyHolderContributionPlanBundles: null,
    fetchedPolicyHolderContributionPlanBundles: false,
    policyHolderContributionPlanBundles: [],
    policyHolderContributionPlanBundlesPageInfo: {},
    policyHolderContributionPlanBundlesTotalCount: 0,
    fetchingPickerPolicyHolderContributionPlanBundles: false,
    errorPickerPolicyHolderContributionPlanBundles: null,
    fetchedPickerPolicyHolderContributionPlanBundles: false,
    pickerPolicyHolderContributionPlanBundles: [],
    pickerPolicyHolderContributionPlanBundlesPageInfo: {},
    pickerPolicyHolderContributionPlanBundlesTotalCount: 0,
    fetchingPolicyHolderUsers: false,
    errorPolicyHolderUsers: null,
    fetchedPolicyHolderUsers: false,
    policyHolderUsers: [],
    policyHolderUsersPageInfo: {},
    policyHolderUsersTotalCount: 0,
    fetchingDeclarationReport: false,
    fetchedDeclarationReport: false,
    declarationReport: [],
    declarationReportPageInfo: {},
    declarationReportTotalCount: 0,
    errorDeclarationReport: null,
    fetchingPayments: false,
    fetchedPayment: false,
    errorPayments: null,
    payment: null,
    paymentsPageInfo: { totalCount: 0 },
    fetchingapprover: false,
    fetchedapprover: false,
    approverData: null,
    errorapprover: null,
    fetchingExceptionInsurees: false,
    errorExceptionInsurees: null,
    fetchedExceptionInsurees: false,
    ExceptionInsurees: [],
    ExceptionInsureesPageInfo: {},
    ExceptionInsureesTotalCount: 0,
    fetchingExceptionPolicyholder: false,
    errorExceptionPolicyholder: null,
    fetchedExceptionPolicyholder: false,
    ExceptionPolicyholder: [],
    ExceptionPolicyholderPageInfo: {},
    ExceptionPolicyholderTotalCount: 0,

    fetchingExceptionPolicyholderById: false,
    errorExceptionPolicyholderById: null,
    fetchedExceptionPolicyholderById: false,
    ExceptionPolicyholderById: [],
    ExceptionPolicyholderPageInfoById: {},
    ExceptionPolicyholderTotalCountById: 0,

    fetchingExceptionInsureesByID: false,
    errorExceptionInsureesByID: null,
    fetchedExceptionInsureesByID: false,
    ExceptionInsureesByID: [],
    ExceptionInsureesPageInfoByID: {},
    ExceptionInsureesTotalCountByID: 0,

    fetchingDocuments: false,
    fetchedDocuments: false,
    documentsData: null,
    errorDocument: null,

    fetchingPolicyExcp: false,
    fetchedPolicyExcp: false,
    PolicyExcp: null,
    errorPolicyExcp: null,

    fetchingPolicyHolderCode: false,
    errorPolicyHolderUsersCode: null,
    fetchedPolicyHolderUsersCode: false,
    policyHolderUsersCode: [],

    fetchingRequestPolicyholder: false,
    errorRequestPolicyholder: null,
    fetchedRequestPolicyholder: false,
    RequestPolicyholder: [],
    RequestPolicyholderPageInfo: {},
    RequestPolicyholderTotalCount: 0,

    fetchingRequestPolicyholderById: false,
    errorRequestPolicyholderById: null,
    fetchedRequestPolicyholderById: false,
    RequestPolicyholderById: [],
    RequestPolicyholderPageInfoById: {},
    RequestPolicyholderTotalCountById: 0,
  },
  action
) {
  switch (action.type) {
    case "POLICYHOLDER_POLICYHOLDERS_REQ":
      return {
        ...state,
        fetchingPolicyHolders: true,
        fetchedPolicyHolders: false,
        policyHolders: [],
        policyHoldersPageInfo: {},
        policyHoldersTotalCount: 0,
        errorPolicyHolders: null,
      };
    case "POLICYHOLDER_POLICYHOLDERS_RESP":
      return {
        ...state,
        fetchingPolicyHolders: false,
        fetchedPolicyHolders: true,
        policyHolders: parseData(action.payload.data.policyHolder),
        policyHoldersPageInfo: pageInfo(action.payload.data.policyHolder),
        policyHoldersTotalCount: !!action.payload.data.policyHolder
          ? action.payload.data.policyHolder.totalCount
          : null,
        errorPolicyHolders: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_POLICYHOLDERS_ERR":
      return {
        ...state,
        fetchingPolicyHolders: false,
        errorPolicyHolders: formatServerError(action.payload),
      };
    case "POLICYHOLDER_POLICYHOLDER_REQ":
      return {
        ...state,
        fetchingPolicyHolder: true,
        fetchedPolicyHolder: false,
        policyHolder: null,
        errorPolicyHolder: null,
      };
    case "POLICYHOLDER_POLICYHOLDER_RESP":
      return {
        ...state,
        fetchingPolicyHolder: false,
        fetchedPolicyHolder: true,
        policyHolder: parseData(action.payload.data.policyHolder).find(
          (policyHolder) => !!policyHolder
        ),
        errorPolicyHolder: formatGraphQLError(action.payload),
      };

    case "POLICYHOLDER_POLICYHOLDER_CLEAR":
      return {
        ...state,
        fetchingPolicyHolder: true,
        fetchedPolicyHolder: false,
        policyHolder: {},
        errorPolicyHolder: null,
      };
    case "POLICYHOLDER_POLICYHOLDER_ERR":
      return {
        ...state,
        fetchingPolicyHolder: false,
        errorPolicyHolder: formatServerError(action.payload),
      };
    case "POLICYHOLDER_POLICYHOLDER_CODE_REQ":
      return {
        ...state,
        fetchingPolicyHolderCode: true,
        fetchedPolicyHolderCode: false,
        policyHolderCode: null,
        errorPolicyHolderCode: null,
      };
    case "POLICYHOLDER_POLICYHOLDER_CODE_RESP":
      return {
        ...state,
        fetchingPolicyHolderCode: false,
        fetchedPolicyHolderCode: true,
        policyHolderCode: parseData(action.payload.data.policyHolder).find(
          (policyHolder) => !!policyHolder
        ),
        errorPolicyHolderCode: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_POLICYHOLDER_CODE_ERR":
      return {
        ...state,
        fetchingPolicyHolderCode: false,
        errorPolicyHolderCode: formatServerError(action.payload),
      };
    case "POLICYHOLDER_POLICYHOLDERINSUREES_REQ":
      return {
        ...state,
        fetchingPolicyHolderInsurees: true,
        fetchedPolicyHolderInsurees: false,
        policyHolderInsurees: [],
        policyHolderInsureesPageInfo: {},
        policyHolderInsureesTotalCount: 0,
        errorPolicyHolderInsurees: null,
      };
    case "POLICYHOLDER_POLICYHOLDERINSUREES_RESP":
      return {
        ...state,
        fetchingPolicyHolderInsurees: false,
        fetchedPolicyHolderInsurees: true,
        policyHolderInsurees: parseData(
          action.payload.data.policyHolderInsuree
        ),
        policyHolderInsureesPageInfo: pageInfo(
          action.payload.data.policyHolderInsuree
        ),
        policyHolderInsureesTotalCount: !!action.payload.data
          .policyHolderInsuree
          ? action.payload.data.policyHolderInsuree.totalCount
          : null,
        errorPolicyHolderInsurees: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_POLICYHOLDERINSUREES_ERR":
      return {
        ...state,
        fetchingPolicyHolderInsurees: false,
        errorPolicyHolderInsurees: formatServerError(action.payload),
      };
    case "POLICYHOLDER_EXCEPTIONINSUREES_REQ":
      return {
        ...state,
        fetchingExceptionInsurees: true,
        fetchedExceptionInsurees: false,
        ExceptionInsurees: [],
        ExceptionInsureesPageInfo: {},
        ExceptionInsureesTotalCount: 0,
        errorExceptionInsurees: null,
      };
    case "POLICYHOLDER_EXCEPTIONINSUREES_RESP":
      return {
        ...state,
        fetchingExceptionInsurees: false,
        fetchedExceptionInsurees: true,
        ExceptionInsurees: parseData(
          action.payload.data.allInsureeExceptions
        ),
        ExceptionInsureesPageInfo: pageInfo(
          action.payload.data.allInsureeExceptions
        ),
        ExceptionInsureesTotalCount: !!action.payload.data
          .allInsureeExceptions
          ? action.payload.data.allInsureeExceptions.totalCount
          : null,
        errorExceptionInsurees: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_EXCEPTIONINSUREES_ERR":
      return {
        ...state,
        fetchingExceptionInsurees: false,
        errorExceptionInsurees: formatServerError(action.payload),
      };

    case "POLICYHOLDER_EXCEPTIONINSUREES_BY_ID_REQ":
      return {
        ...state,
        fetchingExceptionInsureesByID: true,
        fetchedExceptionInsureesByID: false,
        ExceptionInsureesByID: [],
        ExceptionInsureesPageInfoByID: {},
        ExceptionInsureesTotalCountByID: 0,
        errorExceptionInsureesByID: null,
      };
    case "POLICYHOLDER_EXCEPTIONINSUREES_BY_ID_RESP":
      return {
        ...state,
        fetchingExceptionInsureesByID: false,
        fetchedExceptionInsureesByID: true,
        ExceptionInsureesByID: parseData(
          action.payload.data.allInsureeExceptions
        ),
        ExceptionInsureesPageInfoByID: pageInfo(
          action.payload.data.allInsureeExceptions
        ),
        ExceptionInsureesTotalCountByID: !!action.payload.data
          .allInsureeExceptions
          ? action.payload.data.allInsureeExceptions.totalCount
          : null,
        errorExceptionInsurees: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_EXCEPTIONINSUREES_BY_ID_ERR":
      return {
        ...state,
        fetchingExceptionInsureesByID: false,
        errorExceptionInsureesByID: formatServerError(action.payload),
      };
    case "POLICYHOLDER_EXCEPTIONPOLICYHOLDER_REQ":
      return {
        ...state,
        fetchingExceptionPolicyholder: true,
        fetchedExceptionPolicyholder: false,
        ExceptionPolicyholder: [],
        ExceptionPolicyholderPageInfo: {},
        ExceptionPolicyholderTotalCount: 0,
        errorExceptionPolicyholder: null,
      };
    case "POLICYHOLDER_EXCEPTIONPOLICYHOLDER_RESP":
      return {
        ...state,
        fetchingExceptionPolicyholder: false,
        fetchedExceptionPolicyholder: true,
        ExceptionPolicyholder: parseData(
          action.payload.data.allPolicyholderExceptions
        ),
        ExceptionPolicyholderPageInfo: pageInfo(
          action.payload.data.allPolicyholderExceptions
        ),
        ExceptionPolicyholderTotalCount: !!action.payload.data
          .allPolicyholderExceptions
          ? action.payload.data.allPolicyholderExceptions.totalCount
          : null,
        errorExceptionPolicyholder: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_EXCEPTIONPOLICYHOLDER_ERR":
      return {
        ...state,
        fetchingExceptionPolicyholder: false,
        errorExceptionPolicyholder: formatServerError(action.payload),
      };

    case "POLICYHOLDER_REQUESTPOLICYHOLDER_REQ":
      return {
        ...state,
        fetchingRequestPolicyholder: true,
        fetchedRequestPolicyholder: false,
        RequestPolicyholder: [],
        RequestPolicyholderPageInfo: {},
        RequestPolicyholderTotalCount: 0,
        errorRequestPolicyholder: null,
      };
    case "POLICYHOLDER_REQUESTPOLICYHOLDER_RESP":
      return {
        ...state,
        fetchingRequestPolicyholder: false,
        fetchedRequestPolicyholder: true,
        RequestPolicyholder: parseData(
          action.payload.data.policyHolder
        ),
        RequestPolicyholderPageInfo: pageInfo(
          action.payload.data.policyHolder
        ),
        RequestPolicyholderTotalCount: !!action.payload.data
          .policyHolder
          ? action.payload.data.policyHolder.totalCount
          : null,
        errorRequestPolicyholder: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_REQUESTPOLICYHOLDER_ERR":
      return {
        ...state,
        fetchingRequestPolicyholder: false,
        errorRequestPolicyholder: formatServerError(action.payload),
      };


    case "POLICYHOLDER_REQUESTPOLICYHOLDERBYID_REQ":
      return {
        ...state,
        fetchingRequestPolicyholderById: true,
        fetchedRequestPolicyholderById: false,
        RequestPolicyholderById: [],
        RequestPolicyholderPageInfoById: {},
        RequestPolicyholderTotalCountById: 0,
        errorRequestPolicyholderById: null,
      };
    case "POLICYHOLDER_REQUESTPOLICYHOLDERBYID_RESP":
      return {
        ...state,
        fetchingRequestPolicyholderById: false,
        fetchedRequestPolicyholderById: true,
        RequestPolicyholderById: parseData(
          action.payload.data.policyHolder
        ),
        RequestPolicyholderPageInfoById: pageInfo(
          action.payload.data.policyHolder
        ),
        RequestPolicyholderTotalCountById: !!action.payload.data
          .policyHolder
          ? action.payload.data.policyHolder.totalCount
          : null,
        errorRequestPolicyholderById: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_REQUESTPOLICYHOLDERBYID_ERR":
      return {
        ...state,
        fetchingRequestPolicyholderById: false,
        errorRequestPolicyholderById: formatServerError(action.payload),
      };

    case "POLICYHOLDER_EXCEPTIONPOLICYHOLDER_BY_ID_REQ":
      return {
        ...state,
        fetchingExceptionPolicyholderById: true,
        fetchedExceptionPolicyholderById: false,
        ExceptionPolicyholderById: [],
        ExceptionPolicyholderPageInfoById: {},
        ExceptionPolicyholderTotalCountById: 0,
        errorExceptionPolicyholderById: null,
      };
    case "POLICYHOLDER_EXCEPTIONPOLICYHOLDER_BY_ID_RESP":
      return {
        ...state,
        fetchingExceptionPolicyholderById: false,
        fetchedExceptionPolicyholderById: true,
        ExceptionPolicyholderById: parseData(
          action.payload.data.allPolicyholderExceptions
        ),
        ExceptionPolicyholderPageInfoById: pageInfo(
          action.payload.data.allPolicyholderExceptions
        ),
        ExceptionPolicyholderTotalCountById: !!action.payload.data
          .allPolicyholderExceptions
          ? action.payload.data.allPolicyholderExceptions.totalCount
          : null,
        errorExceptionPolicyholderById: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_EXCEPTIONPOLICYHOLDER_BY_ID_ERR":
      return {
        ...state,
        fetchingExceptionPolicyholderById: false,
        errorExceptionPolicyholderById: formatServerError(action.payload),
      };
    case "INSUREE_DOCUMENTS_REQ":
      return {
        ...state,
        fetchingDocuments: true,
        fetchedDocuments: false,
        documentsData: null,
        errorDocument: null,
      };
    case "INSUREE_DOCUMENTS_RESP":
      return {
        ...state,
        fetchingDocuments: false,
        fetchedDocuments: true,
        documentsData: action.payload.data.insureeDocuments,
        errorDocument: formatGraphQLError(action.payload),
      };
    case "INSUREE_DOCUMENTS_ERR":
      return {
        ...state,
        fetchingDocuments: false,
        errorDocument: formatServerError(action.payload),
      };
    case "POLICYHOLDER_PICKERPOLICYHOLDERINSUREES_REQ":
      return {
        ...state,
        fetchingPickerPolicyHolderInsurees: true,
        fetchedPickerPolicyHolderInsurees: false,
        pickerPolicyHolderInsurees: [],
        pickerPolicyHolderInsureesPageInfo: {},
        pickerPolicyHolderInsureesTotalCount: 0,
        errorPickerPolicyHolderInsurees: null,
      };
    case "POLICYHOLDER_PICKERPOLICYHOLDERINSUREES_RESP":
      return {
        ...state,
        fetchingPickerPolicyHolderInsurees: false,
        fetchedPickerPolicyHolderInsurees: true,
        pickerPolicyHolderInsurees: parseData(
          action.payload.data.policyHolderInsuree
        ),
        pickerPolicyHolderInsureesPageInfo: pageInfo(
          action.payload.data.policyHolderInsuree
        ),
        pickerPolicyHolderInsureesTotalCount: !!action.payload.data
          .policyHolderInsuree
          ? action.payload.data.policyHolderInsuree.totalCount
          : null,
        errorPickerPolicyHolderInsurees: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_PICKERPOLICYHOLDERINSUREES_ERR":
      return {
        ...state,
        fetchingPickerPolicyHolderInsurees: false,
        errorPickerPolicyHolderInsurees: formatServerError(action.payload),
      };
    case "POLICYHOLDER_POLICYHOLDERCONTRIBUTIONPLANBUNDLES_REQ":
      return {
        ...state,
        fetchingPolicyHolderContributionPlanBundles: true,
        fetchedPolicyHolderContributionPlanBundles: false,
        policyHolderContributionPlanBundles: [],
        policyHolderContributionPlanBundlesPageInfo: {},
        policyHolderContributionPlanBundlesTotalCount: 0,
        errorPolicyHolderContributionPlanBundles: null,
      };
    case "POLICYHOLDER_POLICYHOLDERCONTRIBUTIONPLANBUNDLES_RESP":
      return {
        ...state,
        fetchingPolicyHolderContributionPlanBundles: false,
        fetchedPolicyHolderContributionPlanBundles: true,
        policyHolderContributionPlanBundles: parseData(
          action.payload.data.policyHolderContributionPlanBundle
        ),
        policyHolderContributionPlanBundlesPageInfo: pageInfo(
          action.payload.data.policyHolderContributionPlanBundle
        ),
        policyHolderContributionPlanBundlesTotalCount: !!action.payload.data
          .policyHolderContributionPlanBundle
          ? action.payload.data.policyHolderContributionPlanBundle.totalCount
          : null,
        errorPolicyHolderContributionPlanBundles: formatGraphQLError(
          action.payload
        ),
      };
    case "POLICYHOLDER_POLICYHOLDERCONTRIBUTIONPLANBUNDLES_ERR":
      return {
        ...state,
        fetchingPolicyHolderContributionPlanBundles: false,
        errorPolicyHolderContributionPlanBundles: formatServerError(
          action.payload
        ),
      };
    case "POLICYHOLDER_PICKERPOLICYHOLDERCONTRIBUTIONPLANBUNDLES_REQ":
      return {
        ...state,
        fetchingPickerPolicyHolderContributionPlanBundles: true,
        fetchedPickerPolicyHolderContributionPlanBundles: false,
        pickerPolicyHolderContributionPlanBundles: [],
        pickerPolicyHolderContributionPlanBundlesPageInfo: {},
        pickerPolicyHolderContributionPlanBundlesTotalCount: 0,
        errorPickerPolicyHolderContributionPlanBundles: null,
      };
    case "POLICYHOLDER_PICKERPOLICYHOLDERCONTRIBUTIONPLANBUNDLES_RESP":
      return {
        ...state,
        fetchingPickerPolicyHolderContributionPlanBundles: false,
        fetchedPickerPolicyHolderContributionPlanBundles: true,
        pickerPolicyHolderContributionPlanBundles: parseData(
          action.payload.data.policyHolderContributionPlanBundle
        ),
        pickerPolicyHolderContributionPlanBundlesPageInfo: pageInfo(
          action.payload.data.policyHolderContributionPlanBundle
        ),
        pickerPolicyHolderContributionPlanBundlesTotalCount: !!action.payload
          .data.policyHolderContributionPlanBundle
          ? action.payload.data.policyHolderContributionPlanBundle.totalCount
          : null,
        errorPickerPolicyHolderContributionPlanBundles: formatGraphQLError(
          action.payload
        ),
      };
    case "POLICYHOLDER_PICKERPOLICYHOLDERCONTRIBUTIONPLANBUNDLES_ERR":
      return {
        ...state,
        fetchingPickerPolicyHolderContributionPlanBundles: false,
        errorPickerPolicyHolderContributionPlanBundles: formatServerError(
          action.payload
        ),
      };
    case "POLICYHOLDER_POLICYHOLDERUSERS_REQ":
      return {
        ...state,
        fetchingPolicyHolderUsers: true,
        fetchedPolicyHolderUsers: false,
        policyHolderUsers: [],
        policyHolderUsersPageInfo: {},
        policyHolderUsersTotalCount: 0,
        errorPolicyHolderUsers: null,
      };
    case "POLICYHOLDER_POLICYHOLDERUSERS_RESP":
      return {
        ...state,
        fetchingPolicyHolderUsers: false,
        fetchedPolicyHolderUsers: true,
        policyHolderUsers: parseData(action.payload.data.policyHolderUser),
        policyHolderUsersPageInfo: pageInfo(
          action.payload.data.policyHolderUser
        ),
        policyHolderUsersTotalCount: !!action.payload.data.policyHolderUser
          ? action.payload.data.policyHolderUser.totalCount
          : null,
        errorPolicyHolderUsers: formatGraphQLError(action.payload),
      };
    case "POLICYHOLDER_POLICYHOLDERUSERS_ERR":
      return {
        ...state,
        fetchingPolicyHolderUsers: false,
        errorPolicyHolderUsers: formatServerError(action.payload),
      };
    case "DECLARATION_REPORT_REQ":
      return {
        ...state,
        fetchingDeclarationReport: true,
        fetchedDeclarationReport: false,
        declarationReport: [],
        declarationReportPageInfo: {},
        declarationReportTotalCount: 0,
        errorDeclarationReport: null,
      };
    case "DECLARATION_REPORT_RESP":
      return {
        ...state,
        fetchingDeclarationReport: false,
        fetchedDeclarationReport: true,
        declarationReport: parseData(
          action.payload.data.notDeclaredPolicyHolder
        ),
        declarationReportPageInfo: pageInfo(
          action.payload.data.notDeclaredPolicyHolder
        ),
        declarationReportTotalCount: !!action.payload.data
          .notDeclaredPolicyHolder
          ? action.payload.data.notDeclaredPolicyHolder.totalCount
          : null,
        errorDeclarationReport: formatGraphQLError(action.payload),
      };
    case "DECLARATION_REPORT_ERR":
      return {
        ...state,
        fetchingDeclarationReport: false,
        errorDeclarationReport: formatServerError(action.payload),
      };
    case "POLICYHOLDER_CODE_FIELDS_VALIDATION_REQ":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          policyHolderCode: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case "POLICYHOLDER_CODE_FIELDS_VALIDATION_RESP":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          policyHolderCode: {
            isValidating: false,
            isValid: action.payload?.data?.isValid,
            validationError: formatGraphQLError(action.payload),
          },
        },
      };
    case "POLICYHOLDER_CODE_FIELDS_VALIDATION_ERR":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          policyHolderCode: {
            isValidating: false,
            isValid: false,
            validationError: formatServerError(action.payload),
          },
        },
      };
    case "POLICYHOLDER_CODE_FIELDS_VALIDATION_CLEAR":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          policyHolderCode: {
            isValidating: true,
            isValid: false,
            validationError: null,
          },
        },
      };
    case "POLICYHOLDER_CODE_FIELDS_VALIDATION_SET_VALID":
      return {
        ...state,
        validationFields: {
          ...state.validationFields,
          policyHolderCode: {
            isValidating: false,
            isValid: true,
            validationError: null,
          },
        },
      };
    case "PAYMENT_OVERVIEW_REQ":
      return {
        ...state,
        fetchingPayment: true,
        fetchedPayment: false,
        payment: null,
        errorPayment: null,
        paymentsPageInfo: { totalCount: 0 },
      };
    case "PAYMENT_OVERVIEW_RESP":
      var payments = parseData(action.payload.data.payments);
      return {
        ...state,
        fetchingPayment: false,
        fetchedPayment: true,
        payment: payments,
        errorPayment: formatGraphQLError(action.payload),
        paymentsPageInfo: pageInfo(action.payload.data.payments)
      };
    case "PAYMENT_OVERVIEW_ERR":
      return {
        ...state,
        fetchingPayment: false,
        errorPayment: formatServerError(action.payload),
      };
    case "HAVING_APPROVER_RESP":
      return {
        ...state,
        fetchingapprover: false,
        fetchedapprover: true,
        approverData: action.payload.data.havingPaymentApproveRight,
        errorapprover: formatGraphQLError(action.payload),
      };
    // case "POLICYHOLDER_INSUREE_POLICYHOLDERAPPROVAL_RESP":
    //   return {
    //     fetchingPolicyExcp: false,
    //     fetchedPolicyExcp: true,
    //     PolicyExcp: action.payload.data.createStation,
    //     errorPolicyExcp: formatGraphQLError(action.payload),
    //   };
    case "POLICYHOLDER_MUTATION_REQ":
      return dispatchMutationReq(state, action);
    case "POLICYHOLDER_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "POLICYHOLDER_CREATE_POLICYHOLDER_RESP":
      return dispatchMutationResp(state, "createPolicyHolder", action);
    case "POLICYHOLDER_UPDATE_POLICYHOLDER_RESP":
      return dispatchMutationResp(state, "updatePolicyHolder", action);
    case "POLICYHOLDER_DELETE_POLICYHOLDER_RESP":
      return dispatchMutationResp(state, "deletePolicyHolder", action);
    case "POLICYHOLDER_CREATE_POLICYHOLDERINSUREE_RESP":
      return dispatchMutationResp(state, "createPolicyHolderInsuree", action);
    case "POLICYHOLDER_UPDATE_POLICYHOLDERINSUREE_RESP":
      return dispatchMutationResp(state, "updatePolicyHolderInsuree", action);
    case "POLICYHOLDER_DELETE_POLICYHOLDERINSUREE_RESP":
      return dispatchMutationResp(state, "deletePolicyHolderInsuree", action);
    // case "POLICYHOLDER_REPLACE_POLICYHOLDERINSUREE_RESP":
    //   return dispatchMutationResp(state, "replacePolicyHolderInsuree", action);
    case "POLICYHOLDER_CREATE_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_RESP":
      return dispatchMutationResp(
        state,
        "createPolicyHolderContributionPlanBundle",
        action
      );
    case "POLICYHOLDER_UPDATE_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_RESP":
      return dispatchMutationResp(
        state,
        "updatePolicyHolderContributionPlanBundle",
        action
      );
    case "POLICYHOLDER_DELETE_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_RESP":
      return dispatchMutationResp(
        state,
        "deletePolicyHolderContributionPlanBundle",
        action
      );
    case "POLICYHOLDER_REPLACE_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_RESP":
      return dispatchMutationResp(
        state,
        "replacePolicyHolderContributionPlanBundle",
        action
      );
    case "POLICYHOLDER_CREATE_POLICYHOLDERUSER_RESP":
      return dispatchMutationResp(state, "createPolicyHolderUser", action);
    case "POLICYHOLDER_UPDATE_POLICYHOLDERUSER_RESP":
      return dispatchMutationResp(state, "updatePolicyHolderUser", action);
    case "POLICYHOLDER_DELETE_POLICYHOLDERUSER_RESP":
      return dispatchMutationResp(state, "deletePolicyHolderUser", action);
    case "POLICYHOLDER_REPLACE_POLICYHOLDERUSER_RESP":
      return dispatchMutationResp(state, "replacePolicyHolderUser", action);
    case "POLICYHOLDER_EXCP_CREATE_RESP":
      return dispatchMutationResp(state, "createException", action);
    case "POLICYHOLDER_POLICYHOLDER_EXCP_CREATE_RESP":
      return dispatchMutationResp(state, "createPolicyHolderException", action);
    case "POLICYHOLDER_INSUREE_APPROVAL_RESP":
      return dispatchMutationResp(state, "insureeApproval", action);
    case "POLICYHOLDER_INSUREE_POLICYHOLDERAPPROVAL_RESP":
      return dispatchMutationResp(state, "policyHolderApproval", action);
    default:
      return state;
  }
}

export default reducer;
