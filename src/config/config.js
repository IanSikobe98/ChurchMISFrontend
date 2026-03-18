export default {
    FAIL_RESPONSE_CODE : '01',
    SUCCESS_RESPONSE_CODE :'00',
    EMAIL_REGEX : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE_REGEX : /^(2547\d{8}|07\d{8}|2541\d{8}|01\d{8})$/,
    TEXT_REGEX : /^[a-zA-Z0-9]+(?:[ '\-/|\\][a-zA-Z0-9]+)*$/,
    NUMBER_ONLY_REGEX : /^\d+$/,
    DECIMAL_WHOLE_NUMBERS_REGEX : /^\d+(\.\d+)?$/,
    CURRENCY_REGEX:/^\d+(\.\d{1,2})?$/,
    SECRET_KEY: 'MyRSY1hAOGVXcDlUcTNMcw==',

}
