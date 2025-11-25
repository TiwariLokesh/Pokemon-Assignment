import ky, { type BeforeRequestHook } from 'ky';

const attachClientHeader: BeforeRequestHook = (request) => {
  request.headers.set('x-client', 'novadex-ui');
};

export const apiClient = ky.create({
  prefixUrl: '/api',
  timeout: 8000,
  hooks: {
    beforeRequest: [attachClientHeader],
  },
});
