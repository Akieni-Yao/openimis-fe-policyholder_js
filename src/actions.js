import {
  graphql,
  graphqlMutationLegacy,
  formatPageQuery,
  formatPageQueryWithCount,
  formatMutation,
  graphqlWithVariables,
  decodeId,
  formatGQLString,
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
  let reportName="registration_application"
  // if(edited?.camuNumber!=null)
  // {
  //   reportName="enrollment_receipt"
  // }else{
  //   reportName="pre_enrollment_receipt"
  // }
  const formatMail = `uuid: "${decodeId(edited?.id)}",  isEmail: ${true},reportName: "${reportName}"`
  return formatMail;
}

function formatPrint(edited) {
  console.log(edited, "format")
  let reportName="registration_application"
  // if(edited?.camuNumber!=null)
  // {
  //   reportName="enrollment_receipt"
  // }else{
  //   reportName="pre_enrollment_receipt"
  // }
  const formatPrint = `uuid: "${decodeId(edited?.id)}",  isEmail: ${false},reportName: "${reportName}"`
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
      "policyHolder { policyholder { id code }}",
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
      "policyHolder { policyholder { id code }}",
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
    },
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
    clientMutationLabel,

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
    "success message responses",
  );
}

export function printReport(mm, edited) {
  let mutation = `mutation SendNotification{
    sentNotification(${formatPrint(edited)}) {
    success
    message
    data
  }}`;
  return graphql(
    mutation,
    ["INSUREE_MUTATION_REQ", "INSUREE_REPORT_RESP", "INSUREE_MUTATION_ERR"],
    "success message",
  );
}