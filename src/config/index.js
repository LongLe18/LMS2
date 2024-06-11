const ENV = 'dev';
const config = {
    //database
    database: {
        username: 'root',
        password: 'root',
        database: 'tracnghiemtructuyen',
        port: 3306,
        host: 'localhost',
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
    //direct url when error
    err:{
        url: 'https://luyenthiquocgia.edu.vn/'
    },
    captcha: {
        siteKey: '6LcGtKAiAAAAAMOQJnfqBfk-yJ99Laqe-3QWC_Nb',
        secretKey: '6LcGtKAiAAAAAJdAxE0msKc43zLwG5X4sbsaQRMR',
    },
    //config api
    api: {
        port: 3001,
        portHttps: 3000,
        login_url: ENV === 'dev' ? 'http://localhost:3002/auth/hocvien' : 'https://dgnl.luyenthiquocgia.edu.vn/auth/hocvien',
        be_url: ENV === 'dev' ? 'http://localhost:3001' : 'https://luyenthiquocgia.edu.vn:3000',
    },
    oauth: {
        REDIRECT_DOMAIN: ENV === 'dev' ? 'http://localhost:3002' : 'https://dgnl.luyenthiquocgia.edu.vn',
        USER: 'viettrieu.mta@gmail.com',
        GOOGLE_CLIENT_ID:
            '43022684672-hikc0ecj5ajdo9f0nn043aban2v2hbef.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: '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',
        CALLBACK_URL: ENV === 'dev' ? 'http://localhost:3001/auth/google/callback' : 'https://luyenthiquocgia.edu.vn:3000/auth/google/callback',
        REDIRECT_URL: 'https://developers.google.com/oauthplayground',
        REFRESH_TOKEN:
            '1//040egfidmLHtnCgYIARAAGAQSNwF-L9IrHxmhECBn7gGwzm9gUCtdeqgLpj3lIs0XZIR35DsmGk6MeLjIGJctQEROltEOKH08H9M',
    },
    vnpay: {
        vnp_TmnCode: 'FSXSRAYX',
        vnp_HashSecret: 'APVSZRXAQQNRAYNFWWVEMELVVYCZFFZS',
        vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        vnp_ReturnUrl: 'https://luyenthiquocgia.edu.vn:3000/payment/vnpay_return',
        url_Success: 'https://dgnl.luyenthiquocgia.edu.vn/luyen-tap/hoa-don/checkout',
    },
};

module.exports = config;
