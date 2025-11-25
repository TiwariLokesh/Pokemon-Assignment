import ky, { type BeforeRequestHook } from 'ky';

const attachClientHeader: BeforeRequestHook = (request) => {
  request.headers.set('x-client', 'novadex-ui');
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 8000,
  hooks: {
    beforeRequest: [attachClientHeader],
  },
});
