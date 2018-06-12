// @flow
export const FILE_DOWNLOAD: 'SCOPE_FILE_DOWNLOAD' = 'SCOPE_FILE_DOWNLOAD';
export const APP_WEB: 'SCOPE_APP_WEB' = 'SCOPE_APP_WEB';

export type ApiScope = typeof APP_WEB | typeof FILE_DOWNLOAD;
