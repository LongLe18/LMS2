const ENV = 'prod';
const BASE_URL = ''
const API_URL_DEV = 'http://localhost:3001';
const API_URL_PROD = 'https://luyenthiquocgia.edu.vn:3000';
const DATE_FORMAT = 'HH:mm DD/MM/YYYY';
const DATE_FORMAT_SHORT = 'DD/MM/YYYY';
const SHOW_DATE_FORMAT = 'D MMMM YYYY, HH:mm';


const LANGUAGES = [
  {
    title: 'English',
    value: 'en',
  },
  {
    title: 'Vietnamese',
    value: 'vi',
  },
];
const AUTH_SOCIAL = {
  FACEBOOK_APP_ID: '226264828440675',
  GOOOGLE_APP_ID: '246536234255-k1gi5d5pvo1ovifgt36jebdaivmhrdff.apps.googleusercontent.com',
};
const CAPTCHA = {
  siteKey: '6LcGtKAiAAAAAMOQJnfqBfk-yJ99Laqe-3QWC_Nb',
  secretKey: '6LcGtKAiAAAAAJdAxE0msKc43zLwG5X4sbsaQRMR'
};
const config = {
  ENV,
  BASE_URL,
  API_URL: ENV === 'dev' ? API_URL_DEV : API_URL_PROD,
  RULE_SET_APP: ENV === 'dev' ? 'https://luyenthiquocgia.edu.vn:3000' : 'https://luyenthiquocgia.edu.vn:3000',
  UPLOAD_API_URL: 'https://luyenthiquocgia.edu.vn:3000',
  DATE_FORMAT,
  SHOW_DATE_FORMAT,
  DATE_FORMAT_SHORT,
  LANGUAGES,
  AUTH_SOCIAL,
  SOCKET_CONFIG: { transports: ['websocket', 'polling', 'flashsocket'] },
  PAGE_SIZE: 100,
  CAPTCHA,
};

export default config;
