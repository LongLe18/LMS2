const fs = require('fs');

const removeFile = (filePath) => {
    try {
        fs.unlinkSync(filePath);
        return true;
    } catch (error) {
        return error;
    }
};

module.exports = {
    removeFile,
};
