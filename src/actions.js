import {
  graphql,
  graphqlMutationLegacy,
  formatPageQuery,
  formatPageQueryWithCount,
  formatMutation,
  graphqlWithVariables,
  decodeId,
  formatGQLString,
  formatQuery,
} from "@openimis/fe-core";

const POLICYHOLDER_FULL_PROJECTION = (modulesManager) => [
  "id",
  "code",
  "tradeName",
  "locations" +
  modulesManager.getProjection("location.Location.FlatProjection"),
  "address",
  "phone",
  "fax",
  "email",
  "contactName",
  "legalForm",
  "activityCode",
  "accountancyAccount",
  "bankAccount",
  "paymentReference",
  "dateValidFrom",
  "dateValidTo",
  "isDeleted",
  "jsonExt",
];

export const POLICYHOLDER_PICKER_PROJECTION = ["id", "code", "tradeName"];

const POLICYHOLDERINSUREE_FULL_PROJECTION = (modulesManager) => [
  "id",
  "dateValidFrom",
  "dateValidTo",
  "employerNumber",
  "jsonExt",
  "lastPolicy{id}",
  "policyHolder{id}",
  "insuree" + modulesManager.getProjection("insuree.InsureePicker.projection"),
  "contributionPlanBundle" +
  modulesManager.getProjection(
    "contributionPlan.ContributionPlanBundlePicker.projection"
  ),
  "isDeleted",
  "replacementUuid",
];

const POLICYHOLDERINSUREE_PICKER_PROJECTION = (modulesManager) => [
  "id",
  "insuree" + modulesManager.getProjection("insuree.InsureePicker.projection"),
  "contributionPlanBundle" +
  modulesManager.getProjection(
    "contributionPlan.ContributionPlanBundlePicker.projection"
  ),
];

const POLICYHOLDERCONTRIBUTIONPLANBUNDLE_FULL_PROJECTION = (modulesManager) => [
  "id",
  "dateValidFrom",
  "dateValidTo",
  "jsonExt",
  "isDeleted",
  "replacementUuid",
  "policyHolder{id}",
  "contributionPlanBundle" +
  modulesManager.getProjection(
    "contributionPlan.ContributionPlanBundlePicker.projection"
  ),
];

const POLICYHOLDERCONTRIBUTIONPLANBUNDLE_PICKER_PROJECTION = (
  modulesManager
) => [
    "id",
    "contributionPlanBundle" +
    modulesManager.getProjection(
      "contributionPlan.ContributionPlanBundlePicker.projection"
    ),
  ];

const POLICYHOLDERUSER_FULL_PROJECTION = (modulesManager) => [
  "id",
  "dateValidFrom",
  "dateValidTo",
  "isDeleted",
  "policyHolder" + `{${POLICYHOLDER_PICKER_PROJECTION}}`,
  "user" + modulesManager.getProjection("admin.UserPicker.projection"),
];

function dateTimeToDate(date) {
  return date.split("T")[0];
}

function formatMail(edited) {
  // console.log(edited, "format")
  let reportName = "registration_application";
  // if(edited?.camuNumber!=null)
  // {
  //   reportName="enrollment_receipt"
  // }else{
  //   reportName="pre_enrollment_receipt"
  // }
  const formatMail = `uuid: "${decodeId(
    edited?.id
  )}",  isEmail: ${true},reportName: "${reportName}"`;
  return formatMail;
}

function formatPrint(edited) {
  // console.log(edited, "format");
  let reportName = "registration_application";
  // if(edited?.camuNumber!=null)
  // {
  //   reportName="enrollment_receipt"
  // }else{
  //   reportName="pre_enrollment_receipt"
  // }
  const formatPrint = `uuid: "${decodeId(
    edited?.id
  )}",  isEmail: ${false},reportName: "${reportName}"`;
  return formatPrint;
}

function formatPrintInsuree(edited) {
  // console.log(JSON.parse(edited?.insuree?.jsonExt), "format");
  const insureeJson = JSON.parse(edited?.insuree?.jsonExt);

  const formatPrint = `uuid: "${edited?.insuree?.uuid
    }",  isEmail: ${false},reportName: "${insureeJson?.insureeEnrolmentType}"`;
  return formatPrint;
}

export function fetchPolicyHolders(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    "policyHolder",
    params,
    POLICYHOLDER_FULL_PROJECTION(modulesManager)
  );
  return graphql(payload, "POLICYHOLDER_POLICYHOLDERS");
}

export function fetchPickerPolicyHolders(params) {
  const payload = formatPageQuery(
    "policyHolder",
    params,
    POLICYHOLDER_PICKER_PROJECTION
  );
  return graphql(payload, "POLICYHOLDER_POLICYHOLDERS");
}



export function fetchPolicyHolder(modulesManager, policyHolderId) {
  let filter = !!policyHolderId ? `id: "${policyHolderId}"` : "";
  const payload = formatPageQuery(
    "policyHolder",
    [filter],
    POLICYHOLDER_FULL_PROJECTION(modulesManager)
  );
  return graphql(payload, "POLICYHOLDER_POLICYHOLDER");
}

export function fetchPolicyHolderCode(modulesManager, policyHolderCode) {
  let filter = !!policyHolderCode ? `code: "${policyHolderCode}"` : "";
  const payload = formatPageQuery(
    "policyHolder",
    [filter],
    POLICYHOLDER_FULL_PROJECTION(modulesManager)
  );
  return graphql(payload, "POLICYHOLDER_POLICYHOLDER_CODE");
}

export function clearPolicyHolder() {
  return (dispatch) => {
    dispatch({ type: "POLICYHOLDER_POLICYHOLDER_CLEAR" });
  };
}

export function fetchPolicyHolderInsurees(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    "policyHolderInsuree",
    params,
    POLICYHOLDERINSUREE_FULL_PROJECTION(modulesManager)
  );
  return graphql(payload, "POLICYHOLDER_POLICYHOLDERINSUREES");
}

export function fetchPickerPolicyHolderInsurees(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    "policyHolderInsuree",
    params,
    POLICYHOLDERINSUREE_PICKER_PROJECTION(modulesManager)
  );
  return graphql(payload, "POLICYHOLDER_PICKERPOLICYHOLDERINSUREES");
}

export function fetchPolicyHolderContributionPlanBundles(
  modulesManager,
  params
) {
  const payload = formatPageQueryWithCount(
    "policyHolderContributionPlanBundle",
    params,
    POLICYHOLDERCONTRIBUTIONPLANBUNDLE_FULL_PROJECTION(modulesManager)
  );
  return graphql(payload, "POLICYHOLDER_POLICYHOLDERCONTRIBUTIONPLANBUNDLES");
}

export function fetchPickerPolicyHolderContributionPlanBundles(
  modulesManager,
  params
) {
  const payload = formatPageQueryWithCount(
    "policyHolderContributionPlanBundle",
    params,
    POLICYHOLDERCONTRIBUTIONPLANBUNDLE_PICKER_PROJECTION(modulesManager)
  );
  return graphql(
    payload,
    "POLICYHOLDER_PICKERPOLICYHOLDERCONTRIBUTIONPLANBUNDLES"
  );
}

export function fetchPolicyHolderUsers(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    "policyHolderUser",
    params,
    POLICYHOLDERUSER_FULL_PROJECTION(modulesManager)
  );
  return graphql(payload, "POLICYHOLDER_POLICYHOLDERUSERS");
}

function formatPolicyHolderGQL(policyHolder) {
  return `
        ${!!policyHolder.id ? `id: "${decodeId(policyHolder.id)}"` : ""}
        ${!!policyHolder.code
      ? `code: "${formatGQLString(policyHolder.code)}"`
      : ""
    }
        ${!!policyHolder.tradeName
      ? `tradeName: "${formatGQLString(policyHolder.tradeName)}"`
      : ""
    }
        ${!!policyHolder.locations
      ? `locationsId: ${decodeId(policyHolder.locations.id)}`
      : ""
    }
        ${!!policyHolder.address
      ? `address: ${JSON.stringify(policyHolder.address).replace(
        /\\n/g,
        "\\n"
      )}`
      : ""
    }
        ${!!policyHolder.phone
      ? `phone: "${formatGQLString(policyHolder.phone)}"`
      : ""
    }
        ${!!policyHolder.fax
      ? `fax: "${formatGQLString(policyHolder.fax)}"`
      : ""
    }
        ${!!policyHolder.email
      ? `email: "${formatGQLString(policyHolder.email)}"`
      : ""
    }
        ${!!policyHolder.contactName
      ? `contactName: ${JSON.stringify(policyHolder.contactName)}`
      : ""
    }
        ${!!policyHolder.legalForm ? `legalForm: ${policyHolder.legalForm}` : ""
    }
        ${!!policyHolder.activityCode
      ? `activityCode: ${policyHolder.activityCode}`
      : ""
    }
        ${!!policyHolder.accountancyAccount
      ? `accountancyAccount: "${formatGQLString(
        policyHolder.accountancyAccount
      )}"`
      : ""
    }
        ${!!policyHolder.bankAccount
      ? `bankAccount: ${JSON.stringify(policyHolder.bankAccount)}`
      : ""
    }
        ${!!policyHolder.paymentReference
      ? `paymentReference: "${formatGQLString(
        policyHolder.paymentReference
      )}"`
      : ""
    }
        ${!!policyHolder.dateValidFrom
      ? `dateValidFrom: "${dateTimeToDate(policyHolder.dateValidFrom)}"`
      : ""
    }
        ${!!policyHolder.dateValidTo
      ? `dateValidTo: "${dateTimeToDate(policyHolder.dateValidTo)}"`
      : ""
    }
        ${!!policyHolder.jsonExt
      ? `jsonExt: ${JSON.stringify(policyHolder.jsonExt).replace(
        /\\n/g,
        "\\n"
      )}`
      : ""
    }
    `;
}

function formatPolicyHolderInsureeGQL(
  policyHolderInsuree,
  isReplaceMutation = false
) {

  return `
        ${!!policyHolderInsuree.id
      ? `${isReplaceMutation ? "uuid" : "id"}: "${decodeId(
        policyHolderInsuree.id
      )}"`
      : ""
    }
        ${!!policyHolderInsuree.policyHolder && !isReplaceMutation
      ? `policyHolderId: "${decodeId(
        policyHolderInsuree.policyHolder.id
      )}"`
      : ""
    }
        ${!!policyHolderInsuree.insuree
      ? `insureeId: ${decodeId(policyHolderInsuree.insuree.id)}`
      : ""
    }
        ${!!policyHolderInsuree.contributionPlanBundle
      ? `contributionPlanBundleId: "${decodeId(
        policyHolderInsuree.contributionPlanBundle.id
      )}"`
      : ""
    }
        ${!!policyHolderInsuree.jsonExt
      ? `jsonExt: ${JSON.stringify(policyHolderInsuree.jsonExt)}`
      : ""
    }
    ${!!policyHolderInsuree.employerNumber
      ? `employerNumber: "${policyHolderInsuree.employerNumber}"`
      : ""
    }
        ${!!policyHolderInsuree.dateValidFrom
      ? `dateValidFrom: "${dateTimeToDate(
        policyHolderInsuree.dateValidFrom
      )}"`
      : ""
    }
        ${!!policyHolderInsuree.dateValidTo
      ? `dateValidTo: "${dateTimeToDate(
        policyHolderInsuree.dateValidTo
      )}"`
      : ""
    }
    `;
}

function formatPolicyHolderContributionPlanBundleGQL(
  policyHolderContributionPlanBundle,
  isReplaceMutation = false
) {
  return `
        ${!!policyHolderContributionPlanBundle.id
      ? `${isReplaceMutation ? "uuid" : "id"}: "${decodeId(
        policyHolderContributionPlanBundle.id
      )}"`
      : ""
    }
        ${!!policyHolderContributionPlanBundle.policyHolder &&
      !isReplaceMutation
      ? `policyHolderId: "${decodeId(
        policyHolderContributionPlanBundle.policyHolder.id
      )}"`
      : ""
    }
        ${!!policyHolderContributionPlanBundle.contributionPlanBundle
      ? `contributionPlanBundleId: "${decodeId(
        policyHolderContributionPlanBundle.contributionPlanBundle.id
      )}"`
      : ""
    }
        ${!!policyHolderContributionPlanBundle.dateValidFrom
      ? `dateValidFrom: "${dateTimeToDate(
        policyHolderContributionPlanBundle.dateValidFrom
      )}"`
      : ""
    }
        ${!!policyHolderContributionPlanBundle.dateValidTo
      ? `dateValidTo: "${dateTimeToDate(
        policyHolderContributionPlanBundle.dateValidTo
      )}"`
      : ""
    }
    `;
}

function formatPolicyHolderUserGQL(
  policyHolderUser,
  isReplaceMutation = false
) {
  return `
        ${!!policyHolderUser.id
      ? `${isReplaceMutation ? "uuid" : "id"}: "${decodeId(
        policyHolderUser.id
      )}"`
      : ""
    }
        ${!!policyHolderUser.user
      ? `userId: "${decodeId(policyHolderUser.user.id)}"`
      : ""
    }
        ${!!policyHolderUser.policyHolder
      ? `policyHolderId: "${policyHolderUser.policyHolder.id}"`
      : ""
    }
        ${!!policyHolderUser.dateValidFrom
      ? `dateValidFrom: "${dateTimeToDate(
        policyHolderUser.dateValidFrom
      )}"`
      : ""
    }
        ${!!policyHolderUser.dateValidTo
      ? `dateValidTo: "${dateTimeToDate(policyHolderUser.dateValidTo)}"`
      : ""
    }
    `;
}

export function createPolicyHolder(policyHolder, clientMutationLabel) {
  let mutation = formatMutation(
    "createPolicyHolder",
    formatPolicyHolderGQL(policyHolder),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphqlMutationLegacy(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_CREATE_POLICYHOLDER_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
    true,
    "policyHolder { policyholder { id code }}"
  );
}

export function updatePolicyHolder(policyHolder, clientMutationLabel) {
  let mutation = formatMutation(
    "updatePolicyHolder",
    formatPolicyHolderGQL(policyHolder),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphqlMutationLegacy(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_UPDATE_POLICYHOLDER_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
    true,
    "policyHolder { policyholder { id code }}"
  );
}

export function deletePolicyHolder(
  policyHolder,
  clientMutationLabel,
  clientMutationDetails = null
) {
  let policyHolderUuids = `uuids: ["${decodeId(policyHolder.id)}"]`;
  let mutation = formatMutation(
    "deletePolicyHolder",
    policyHolderUuids,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_DELETE_POLICYHOLDER_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createPolicyHolderInsuree(
  policyHolderInsuree,
  clientMutationLabel
) {
  let mutation = formatMutation(
    "createPolicyHolderInsuree",
    formatPolicyHolderInsureeGQL(policyHolderInsuree),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_CREATE_POLICYHOLDERINSUREE_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updatePolicyHolderInsuree(
  policyHolderInsuree,
  clientMutationLabel
) {
  let mutation = formatMutation(
    "updatePolicyHolderInsuree",
    formatPolicyHolderInsureeGQL(policyHolderInsuree),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_UPDATE_POLICYHOLDERINSUREE_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function deletePolicyHolderInsuree(
  policyHolderInsuree,
  clientMutationLabel,
  clientMutationDetails = null
) {
  let policyHolderInsureeUuids = `uuids: ["${decodeId(
    policyHolderInsuree.id
  )}"]`;
  let mutation = formatMutation(
    "deletePolicyHolderInsuree",
    policyHolderInsureeUuids,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_DELETE_POLICYHOLDERINSUREE_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function replacePolicyHolderInsuree(
  policyHolderInsuree,
  clientMutationLabel
) {
  let mutation = formatMutation(
    "replacePolicyHolderInsuree",
    formatPolicyHolderInsureeGQL(policyHolderInsuree, true),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_REPLACE_POLICYHOLDERINSUREE_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createPolicyHolderContributionPlanBundle(
  policyHolderContributionPlanBundle,
  clientMutationLabel
) {
  let mutation = formatMutation(
    "createPolicyHolderContributionPlanBundle",
    formatPolicyHolderContributionPlanBundleGQL(
      policyHolderContributionPlanBundle
    ),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_CREATE_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updatePolicyHolderContributionPlanBundle(
  policyHolderContributionPlanBundle,
  clientMutationLabel
) {
  let mutation = formatMutation(
    "updatePolicyHolderContributionPlanBundle",
    formatPolicyHolderContributionPlanBundleGQL(
      policyHolderContributionPlanBundle
    ),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_UPDATE_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function deletePolicyHolderContributionPlanBundle(
  policyHolderContributionPlanBundle,
  clientMutationLabel,
  clientMutationDetails = null
) {
  let policyHolderContributionPlanBundleUuids = `uuids: ["${decodeId(
    policyHolderContributionPlanBundle.id
  )}"]`;
  let mutation = formatMutation(
    "deletePolicyHolderContributionPlanBundle",
    policyHolderContributionPlanBundleUuids,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_DELETE_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function replacePolicyHolderContributionPlanBundle(
  policyHolderContributionPlanBundle,
  clientMutationLabel
) {
  let mutation = formatMutation(
    "replacePolicyHolderContributionPlanBundle",
    formatPolicyHolderContributionPlanBundleGQL(
      policyHolderContributionPlanBundle,
      true
    ),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_REPLACE_POLICYHOLDERCONTRIBUTIONPLANBUNDLE_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function createPolicyHolderUser(policyHolderUser, clientMutationLabel) {
  let mutation = formatMutation(
    "createPolicyHolderUser",
    formatPolicyHolderUserGQL(policyHolderUser),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_CREATE_POLICYHOLDERUSER_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function updatePolicyHolderUser(policyHolderUser, clientMutationLabel) {
  let mutation = formatMutation(
    "updatePolicyHolderUser",
    formatPolicyHolderUserGQL(policyHolderUser),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_UPDATE_POLICYHOLDERUSER_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function deletePolicyHolderUser(
  policyHolderUser,
  clientMutationLabel,
  clientMutationDetails = null
) {
  let policyHolderUserUuids = `uuids: ["${decodeId(policyHolderUser.id)}"]`;
  let mutation = formatMutation(
    "deletePolicyHolderUser",
    policyHolderUserUuids,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_DELETE_POLICYHOLDERUSER_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export function replacePolicyHolderUser(policyHolderUser, clientMutationLabel) {
  let mutation = formatMutation(
    "replacePolicyHolderUser",
    formatPolicyHolderUserGQL(policyHolderUser, true),
    clientMutationLabel
  );
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [
      "POLICYHOLDER_MUTATION_REQ",
      "POLICYHOLDER_REPLACE_POLICYHOLDERUSER_RESP",
      "POLICYHOLDER_MUTATION_ERR",
    ],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    }
  );
}

export const policyHolderCodeValidation = (mm, variables) => {
  return graphqlWithVariables(
    `
    query ($policyHolderCode: String!) {
      isValid: validatePolicyHolderCode(policyHolderCode: $policyHolderCode)
    }
    `,
    variables,
    "POLICYHOLDER_CODE_FIELDS_VALIDATION"
  );
};

export const policyHolderCodeSetValid = () => {
  return (dispatch) => {
    dispatch({
      type: "POLICYHOLDER_CODE_FIELDS_VALIDATION_SET_VALID",
    });
  };
};

export const policyHolderCodeClear = () => {
  return (dispatch) => {
    dispatch({ type: "POLICYHOLDER_CODE_FIELDS_VALIDATION_CLEAR" });
  };
};

export function sendEmail(mm, edited) {
  let mutation = `mutation SendNotification{
    sentNotification(${formatMail(edited)}) {
    success
    message
  }}`;
  return graphql(
    mutation,
    ["INSUREE_MUTATION_REQ", "INSUREE_SEND_EMAIL_RESP", "INSUREE_MUTATION_ERR"],
    "success message responses"
  );
}

export function printReport(mm, edited) {
  // console.log("edited", edited);
  let mutation = `mutation SendNotification{
    sentNotification(${formatPrint(edited)}) {
    success
    message
    data
  }}`;
  return graphql(
    mutation,
    ["INSUREE_MUTATION_REQ", "INSUREE_REPORT_RESP", "INSUREE_MUTATION_ERR"],
    "success message"
  );
}

export function printReportInsuree(mm, edited) {
  let mutation = `mutation SendNotification{
    sentNotification(${formatPrintInsuree(edited)}) {
    success
    message
    data
  }}`;
  return graphql(
    mutation,
    ["INSUREE_MUTATION_REQ", "INSUREE_REPORT_RESP", "INSUREE_MUTATION_ERR"],
    "success message"
  );
}

const DECLARATION_FULL_PROJECTION = (modulesManager) => [
  "id",
  "code",
  "tradeName",
  "phone",
  "email",
  "contactName",
  "locations" +
  modulesManager.getProjection("location.Location.FlatProjection"),

  ,
];

export function fetchDeclarationReport(modulesManager, params) {
  const payload = formatPageQueryWithCount(
    "notDeclaredPolicyHolder",
    params,
    DECLARATION_FULL_PROJECTION(modulesManager)
  );
  return graphql(payload, "DECLARATION_REPORT");
}

export function selectRegion(region) {
  return (dispatch) => {
    dispatch({ type: "CLAIM_CLAIM_REGION_SELECTED", payload: region });
  };
}

const PAYMENT_SUMMARIES_PROJECTION = (mm) => [
  "uuid",
  "id",
  "requestDate",
  "expectedAmount",
  "receivedDate",
  "receivedAmount",
  "status",
  "receiptNo",
  "typeOfPayment",
  "clientMutationId",
  "validityTo",
  "paymentCode",
  // `paymentDetails{edges{node{premium${mm.getProjection("contribution.PremiumPicker.projection")}}}}`
];

const PAYMENT_FULL_PROJECTION = (mm) => [
  ...PAYMENT_SUMMARIES_PROJECTION(mm),
  "officerCode",
  "phoneNumber",
  "transactionNo",
  "origin",
  "matchedDate",
  "rejectedReason",
  "dateLastSms",
  "languageName",
  "transferFee",
  "clientMutationId",
];

export function fetchPayment(mm, filters) {
  const payload = formatPageQueryWithCount(
    "payments",
    filters,
    PAYMENT_SUMMARIES_PROJECTION(mm)
  );
  return graphql(payload, "PAYMENT_OVERVIEW");
}


export const havingPAymentApprove = (uuid) => {
  const payload = formatQuery("havingPaymentApproveRight", [`uuid:"${uuid}"`]);
  return graphql(payload, "HAVING_APPROVER");
};
export function createException(mm, jsonData) {
  const raisedById = jsonData?.exceptionMonth == 6 ? `raisedById: ${decodeId(jsonData?.secondGuardian?.id)}` : '';
  let mutation = `mutation CreateInsureeException {
    createInsureeException(
        inputData: {
            insureeId: ${decodeId(jsonData?.insuree?.id)}
            exceptionReason:"${jsonData?.exceptionReason}"
            exceptionMonths: ${jsonData?.exceptionMonth}
            ${raisedById}
        }
    ) {
        insureeException {
            id
            status
            exceptionReason
            rejectionReason
            code
        }
        message
    }
}`;
  return graphql(
    mutation, ["POLICYHOLDER_MUTATION_REQ", "POLICYHOLDER_POLICYHOLDER_INSEXCP_CREATE_RESP", "POLICYHOLDER_MUTATION_ERR"], {

  }
  );
}
export function createPolicyHolderException(mm, jsonData) {
  let mutation = `mutation CreatePolicyHolderException  {
    createPolicyHolderException(
        inputData: {
          policyHolderId: "${decodeId(jsonData?.policyHolder?.id)}"
            exceptionReason:"${jsonData?.exceptionReason}"
        }
    ) {
      policyHolderExcption {
        id
        code
        status
        exceptionReason
        rejectionReason
        createdBy
        modifiedBy
        createdTime
        modifiedTime
    }
    message
    }
}`;
  return graphql(
    mutation, ["POLICYHOLDER_MUTATION_REQ", "POLICYHOLDER_POLICYHOLDER_EXCP_CREATE_RESP", "POLICYHOLDER_MUTATION_ERR"], {

  }
  );
}
export function fetchInsureeException(mm, filters) {
  return graphql(
    `query AllInsureeExceptions{
      allInsureeExceptions(${filters.join(" ")}){
        totalCount
        edgeCount
        pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
        }
        edges {
            node {
                id
                code
                status
                exceptionReason
                rejectionReason
                startDate
                endDate
                createdBy
                modifiedBy
                createdTime
                modifiedTime
                insuree {
                    camuNumber
                    lastName
                    otherNames
                    chfId
                    phone
                    jsonExt
                }
            }
          }
      }
  }`
    ,
    "POLICYHOLDER_EXCEPTIONINSUREES",
  );
}
export function fetchInsureeExceptionByID(mm, id) {
  return graphql(
    `query AllInsureeExceptions{
      allInsureeExceptions( id: "${id}"){
        totalCount
        edgeCount
        pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
        }
        edges {
            node {
                id
                code
                status
                exceptionReason
                rejectionReason
                startDate
                endDate
                createdBy
                modifiedBy
                createdTime
                modifiedTime
                insuree {
                    camuNumber
                    lastName
                    otherNames
                    chfId
                    phone
                    jsonExt
                    dob
                }
            }
          }
      }
  }`
    ,
    "POLICYHOLDER_EXCEPTIONINSUREES_BY_ID",
  );
}
export function fetchPolicyHolderException(mm, filters) {
  return graphql(
    `query AllPolicyholderExceptions {
      allPolicyholderExceptions(${filters.join(" ")}) {
          totalCount
          edgeCount
          pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
          }
          edges {
              node {
                  id
                  code
                  status
                  exceptionReason
                  rejectionReason
                  createdBy
                  modifiedBy
                  createdTime
                  modifiedTime
                  month
                  policyHolder {
                    code
                    tradeName
                    locations {
                      code
                      name
                      parent {
                        code
                        name
                        parent {
                          code
                          name
                          parent {
                            code
                            name
                          }
                        }
                      }
                    }
                  }
              }
          }
      }
  }`
    ,
    "POLICYHOLDER_EXCEPTIONPOLICYHOLDER",
  );
}
export function fetchPolicyHolderExceptionBYId(mm, id) {
  return graphql(
    `query AllPolicyholderExceptions {
      allPolicyholderExceptions( id: "${id}") {
          totalCount
          edgeCount
          pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
          }
          edges {
              node {
                  id
                  code
                  status
                  exceptionReason
                  rejectionReason
                  createdBy
                  modifiedBy
                  createdTime
                  modifiedTime
                  policyHolder {
                    code
                    tradeName
                    locations {
                      code
                      name
                      parent {
                        code
                        name
                        parent {
                          code
                          name
                          parent {
                            code
                            name
                          }
                        }
                      }
                    }
                  }
              }
          }
      }
  }`
    ,
    "POLICYHOLDER_EXCEPTIONPOLICYHOLDER_BY_ID",
  );
}
export const fetchInsureeDocuments = (fosaCode) => {
  const payload = formatQuery(
    "insureeDocuments",
    [`tempCamu: "${fosaCode}"`],
    [
      "id",
      "documentId",
      "documentName",
      "documentPath",
      "documentStatus",
      "comments",
      "tempCamu",
    ]
  );
  return graphql(payload, "INSUREE_POLICYHOLDER_DOCUMENTS");
};
export function insureeExceptionApproval(mm, jsonData) {
  // console.log("jsonDatas", jsonData)
  // console.log("jsonData", jsonData['0']['id'])
  const idValue = jsonData['0']['id'];
  let mutation = `query ApproveInsureeException {
    approveInsureeException(id: ${decodeId(idValue)}, isApproved:${jsonData?.status === 5 ? true : false}, rejectionReason:"${!!jsonData?.rejectionReason ? jsonData?.rejectionReason : null}") {
        success
        message
  
    }
  }`;
  return graphql(
    mutation, ["POLICYHOLDER_MUTATION_REQ", "INSUREE_REPORT_RESP", "POLICYHOLDER_MUTATION_ERR"], {
  }
  );
}
export function PolicyholderApproval(mm, jsonData) {
  let mutation = `mutation PolicyholderApproval  {
    policyholderApproval( 
      input: {
      id: "${decodeId(jsonData?.id)}",requestNumber: "${jsonData?.requestNumber}",isRejected: ${jsonData?.status === -1 ? true : false} ,isApproved:${jsonData?.status === 5 ? true : false},isRework: false, 
      ${!!jsonData?.statusComment ? `rejectedReason:"${jsonData?.statusComment}"` : ""}
    }
  ) {
        success
        message
  
    }
  }`;
  return graphql(
    mutation, ["POLICYHOLDER_MUTATION_REQ", "INSUREE_REPORT_RESP", "POLICYHOLDER_MUTATION_ERR"], {
  }
  );
}
export function PolicyholderReworkAction(mm, jsonData) {
  let mutation = `mutation PolicyholderApproval  {
    policyholderApproval( 
      input: {
      id: "${decodeId(jsonData?.id)}",requestNumber: "${jsonData?.requestNumber}",isRejected:false ,isApproved:false,isRework:true, 
      ${!!jsonData?.statusComment ? `reworkOption:"${jsonData?.statusComment}"` : ""}
      ${!!jsonData?.reason ? `reworkComment:"${jsonData?.reason}"` : ""}
    }
  ) {
        success
        message
  
    }
  }`;
  return graphql(
    mutation, ["POLICYHOLDER_MUTATION_REQ", "INSUREE_REPORT_RESP", "POLICYHOLDER_MUTATION_ERR"], {
  }
  );
}
export function policyHolderExceptionApproval(mm, jsonData) {
  // console.log("jsonDatas", jsonData)
  // console.log("jsonData", jsonData['0']['id'])
  const idValue = jsonData['0']['id'];
  // debugger;
  let mutation = `query ApprovePolicyholderException {
    approvePolicyholderException(id: ${decodeId(idValue)}, isApproved:${jsonData?.status === 5 ? true : false}, rejectionReason:"${!!jsonData?.statusComment ? jsonData?.statusComment : null}") {
        success
        message
    }
  }`;
  return graphql(
    mutation, ["POLICYHOLDER_MUTATION_REQ", "INSUREE_REPORT_RESP", "POLICYHOLDER_MUTATION_ERR"],
    "success message",
  );
}

function formatExternalDocument(docs, tempCamu, isApprove) {
  // debugger
  const newarray = docs?.map((doc) => ({
    documentId: doc.documentId,
    status: "REJECTED",
    comments: "",
  }));

  const result = {
    tempCamuNumber: tempCamu || "",
    documentUpdates: newarray,
    isApproved: isApprove,
  };

  const formattedResult = `
    tempCamuNumber: "${result.tempCamuNumber}",
    isApproved:${result.isApproved},
    documentUpdates: [
    ${result?.documentUpdates
      ?.map(
        (update) =>
          `{ documentId: "${update.documentId}", status: "${update.status}", comments: "${update.comments}" },`
      )
      .join("\n")}
    ]
  `;
  return formattedResult;
}
export function updateExternalDocuments(mm, docs, tempCamu, isApprove) {
  let mutation = `mutation UpdateStatusInExternalEndpoint {
  updateStatusInExternalEndpoint(${formatExternalDocument(
    docs,
    tempCamu,
    isApprove
  )}) {
    success
    message
    responses
  }}`;
  return graphql(
    mutation,
    [
      "INSUREE_MUTATION_REQ",
      "INSUREE_UPDATE_EXTERNAL_DOCUMENT_RESP",
      "INSUREE_MUTATION_ERR",
    ],
    "success message responses"
  );
}

export function fetchPolicyholderRequest(mm, filters) {
  return graphql(
    `query PolicyHolder {
      policyHolder(${filters.join(" ")}) {
          totalCount
          edgeCount
          edges {
              node {
                  requestNumber
                  tradeName
                  contactName
                  phone
                  email
                  status
                  jsonExt
                  id
                  rejectedReason
              }
          }
          pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
          }
      }
  }`
    ,
    "POLICYHOLDER_REQUESTPOLICYHOLDER",
  );
}
export function fetchPolicyholderRequestById(mm, uuid) {
  return graphql(
    `query PolicyHolder {
      policyHolder(id:"${uuid}",isDeleted: false) {
          totalCount
          edgeCount
          edges {
              node {
                          requestNumber
                          id
                          jsonExt
                          code
                          tradeName
                          address
                          phone
                          fax
                          email
                          status
                          contactName
                          legalForm
                          activityCode
                          accountancyAccount
                          bankAccount
                          paymentReference
                          isApproved
                          requestNumber
                          dateValidFrom
                          locations{id, uuid, code, name, type, parent{id,uuid,code,name,type,parent{id,uuid,code,name,type,parent{id,uuid,code,name,type}}}}
                          isSubmit
              formPhPortal
              isApproved
              }
          }
          pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
          }
      }
  }`
    ,
    "POLICYHOLDER_REQUESTPOLICYHOLDERBYID",
  );
}
