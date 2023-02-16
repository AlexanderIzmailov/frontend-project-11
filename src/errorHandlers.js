// export default (err) => {
//   const codes = {
//     ERR_NETWORK: 'errors.network',
//     ERR_NOT_ONE_OF: 'errors.notOneOf',
//     ERR_URL: 'errors.url',
//     ERR_MISSING_RSS: 'errors.rss',
//   };

//   return codes[err.code];
// };

export class MyError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export const errorCodes = {
  ERR_NETWORK: 'errors.network',
  ERR_NOT_ONE_OF: 'errors.notOneOf',
  ERR_URL: 'errors.url',
  ERR_MISSING_RSS: 'errors.rss',
};
