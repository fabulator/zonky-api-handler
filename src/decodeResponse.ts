export default function decodeResponse(response: Response): Promise<string | Buffer> {
    const contentType = response.headers.get('content-type');

    if (!contentType) {
        // @ts-ignore
        return response.buffer();
    }

    if (contentType.indexOf('json') >= 0) {
        return response.json();
    }

    // @ts-ignore
    return response.buffer();
}
