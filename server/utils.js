
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const prepare_message = (code, payload) => {
    return JSON.stringify({
        code,
        payload
    });
}

const parse_message = (message) => {
    const data = JSON.parse(message);
    if(!(data.code && data.payload)) throw new Error('Invalid message');
    return JSON.parse(message);
}

module.exports = { uuidv4, prepare_message, parse_message }