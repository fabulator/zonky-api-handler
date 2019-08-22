export default function decodeResponse(response: Response): Promise<string | Buffer> {
    const contentType = response.headers.get('content-type');

    if (!contentType) {
        // @ts-ignore
        return response.buffer();
    }

    if (contentType.includes('json')) {
        return response.json();
    }

    // @ts-ignore
    return response.buffer();
}
