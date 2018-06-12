// @flow
export default function decodeResponse(response: Response): Promise<string | Buffer> {
    const contentType: string = response.headers.get('content-type');

    if (contentType.indexOf('json') >= 0) {
        return response.json();
    }

    // $FlowFixMe
    return response.buffer();
}
