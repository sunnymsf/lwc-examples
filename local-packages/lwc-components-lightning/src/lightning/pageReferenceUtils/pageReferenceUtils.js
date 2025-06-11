/*
    utility functions to encode/decode the defaultFieldValues object into/from our custom encoding format
    the format is a delimiter(comma) separated key&value pairs, key and value are connected by an assignment operator(equal)
    value will be url encoded
    Example object:
    {
      Name: "Salesforce, #1=CRM",
      OwnerId: "005B0000005WsihIAC",
      NumberOfEmployees: 35000,
      NS__Check__c: true
    }
    Formatted string:
    'Name=Salesforce%2C%20%231%3DCRM,OwnerId=005B0000005WsihIAC,NumberOfEmployees=35000,NS__Check__c=true'
*/

export function encodeDefaultFieldValues(defaultFieldValues) {
    if (typeof defaultFieldValues !== 'object' || defaultFieldValues === null) {
        throw new TypeError(
            'The encodeDefaultFieldValues input must be a non-null object.'
        );
    }
    const pair = [];
    Object.keys(defaultFieldValues)
        .sort()
        .forEach((key) => {
            const value = defaultFieldValues[key];
            if (
                typeof value !== 'string' &&
                typeof value !== 'number' &&
                typeof value !== 'boolean' &&
                value !== null &&
                value !== undefined
            ) {
                throw new TypeError(
                    `The value of a defaultFieldValues entry must be a string, boolean or number. Invalid value type for '${key}' is ${typeof value}.`
                );
            }
            if (value === null) {
                pair.push(encodeURIComponent(key));
            } else if (value !== undefined) {
                // if value is undefined we drop the key
                pair.push(
                    encodeURIComponent(key) + '=' + encodeURIComponent(value)
                );
            }
        });
    return pair.join(',');
}

export function decodeDefaultFieldValues(dfvString) {
    if (typeof dfvString !== 'string') {
        throw new TypeError(
            'The decodeDefaultFieldValues input must be a string.'
        );
    }
    const defaultFieldValues = {};
    dfvString.split(',').forEach((kv) => {
        const pair = kv.split('=');
        if (pair && pair.length === 2) {
            defaultFieldValues[decodeURIQueryComponent(pair[0])] =
                decodeURIQueryComponent(pair[1]);
        } else {
            defaultFieldValues[decodeURIQueryComponent(kv)] = null;
        }
    });
    return defaultFieldValues;
}

// to support where space is encoded to a plus sign (+)
function decodeURIQueryComponent(str) {
    return str ? decodeURIComponent(str.replace(/\+/g, ' ')) : str;
}
