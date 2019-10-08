import decodeResponse from './decodeResponse';
import { ZonkyApiException, ZonkyApiSMSException, ZonkyApiSMSLimitException } from './exceptions';
import * as ERROR_CODES from './error-codes';

export default async (response: Response, request: Request) => {
    const decodedResponse = await decodeResponse(response);

    const toRespond = {
        data: decodedResponse,
        status: response.status,
        source: response,
        request,
    };

    if (!response.ok) {
        if (typeof toRespond.data === 'string' || toRespond.data instanceof Buffer) {
            throw new ZonkyApiException(toRespond);
        }

        if (toRespond.data.error === ERROR_CODES.AUTHORIZATION_SMS_REQUIRED) {
            throw new ZonkyApiSMSException(toRespond);
        }

        if (toRespond.data.error === ERROR_CODES.AUTHORIZATION_SMS_LIMIT_EXCEEDED) {
            throw new ZonkyApiSMSLimitException(toRespond);
        }

        throw new ZonkyApiException(toRespond);
    }

    return toRespond;
};
