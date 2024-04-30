import getUuidByString from 'uuid-by-string';

export const genUUID = (string) => {
    return getUuidByString(string + Date.now(), 5);
};
