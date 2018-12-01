import { ZonkyApi } from '../src';

describe('ZonkyApi testing', () => {
    it('create api object', () => {
        const zonkyApi = new ZonkyApi();

        expect(zonkyApi).toBeDefined();
    });
});
