const jsVarStr = '[a-zA-Z_\\$][a-zA-Z_0-9]*';
const jsSingleQuoteStr = `'[^'\\\\]*(:?\\\\[\\s\\S][^'\\\\]*)*'`;
const jsDoubleQuoteStr = `"[^"\\\\]*(:?\\\\[\\s\\S][^"\\\\]*)*"`;
const jsQuoteStr = `(?:${jsSingleQuoteStr}|${jsDoubleQuoteStr})`;
const jsKeyStr = `(?:${jsVarStr}|${jsQuoteStr})`;
const jsPropStr = `(?:\\.${jsVarStr}|\\[${jsQuoteStr}\\])`;
const jsEmptyStr = `(?:''|"")`;
const reverseStr = ':function\\(a\\)\\{' + '(?:return )?a\\.reverse\\(\\)' + '\\}';
const sliceStr = ':function\\(a,b\\)\\{' + 'return a\\.slice\\(b\\)' + '\\}';
const spliceStr = ':function\\(a,b\\)\\{' + 'a\\.splice\\(0,b\\)' + '\\}';
const swapStr =
    ':function\\(a,b\\)\\{' +
    'var c=a\\[0\\];a\\[0\\]=a\\[b(?:%a\\.length)?\\];a\\[b(?:%a\\.length)?\\]=c(?:;return a)?' +
    '\\}';
const actionsObjRegexp = new RegExp(
    `var (${jsVarStr})=\\{((?:(?:${jsKeyStr}${reverseStr}|${jsKeyStr}${sliceStr}|${jsKeyStr}${spliceStr}|${jsKeyStr}${swapStr}),?\\r?\\n?)+)\\};`
);
const actionsFuncRegexp = new RegExp(
    `${
        `function(?: ${jsVarStr})?\\(a\\)\\{` + `a=a\\.split\\(${jsEmptyStr}\\);\\s*` + `((?:(?:a=)?${jsVarStr}`
    }${jsPropStr}\\(a,\\d+\\);)+)` +
        `return a\\.join\\(${jsEmptyStr}\\)` +
        `\\}`
);
const reverseRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${reverseStr}`, 'm');
const sliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${sliceStr}`, 'm');
const spliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${spliceStr}`, 'm');
const swapRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${swapStr}`, 'm');

const swapHeadAndPosition = (arr, position) => {
    const first = arr[0];
    arr[0] = arr[position % arr.length];
    arr[position] = first;
    return arr;
};

export function decipher(tokens: string[], sg: string): string {
    let sig = sg.split('');
    for (let i = 0, len = tokens.length; i < len; i++) {
        let token = tokens[i],
            pos;
        switch (token[0]) {
            case 'r':
                sig = sig.reverse();
                break;
            case 'w':
                pos = ~~token.slice(1);
                sig = swapHeadAndPosition(sig, pos);
                break;
            case 's':
                pos = ~~token.slice(1);
                sig = sig.slice(pos);
                break;
            case 'p':
                pos = ~~token.slice(1);
                sig.splice(0, pos);
                break;
        }
    }

    return sig.join('');
}

export const extractTokens = (body: string): string[] => {
    const objResult = actionsObjRegexp.exec(body);
    const funcResult = actionsFuncRegexp.exec(body);
    if (!objResult || !funcResult) {
        return null;
    }

    const obj = objResult[1].replace(/\$/g, '\\$');
    const objBody = objResult[2].replace(/\$/g, '\\$');
    const funcBody = funcResult[1].replace(/\$/g, '\\$');

    let result = reverseRegexp.exec(objBody);
    const reverseKey = result && result[1].replace(/\$/g, '\\$').replace(/\$|^'|^"|'$|"$/g, '');
    result = sliceRegexp.exec(objBody);
    const sliceKey = result && result[1].replace(/\$/g, '\\$').replace(/\$|^'|^"|'$|"$/g, '');
    result = spliceRegexp.exec(objBody);
    const spliceKey = result && result[1].replace(/\$/g, '\\$').replace(/\$|^'|^"|'$|"$/g, '');
    result = swapRegexp.exec(objBody);
    const swapKey = result && result[1].replace(/\$/g, '\\$').replace(/\$|^'|^"|'$|"$/g, '');

    const keys = `(${[reverseKey, sliceKey, spliceKey, swapKey].join('|')})`;
    const myreg = `(?:a=)?${obj}(?:\\.${keys}|\\['${keys}'\\]|\\["${keys}"\\])` + `\\(a,(\\d+)\\)`;
    const tokenizeRegexp = new RegExp(myreg, 'g');
    const tokens = [];
    while ((result = tokenizeRegexp.exec(funcBody)) !== null) {
        let key = result[1] || result[2] || result[3];
        switch (key) {
            case swapKey:
                tokens.push(`w${result[4]}`);
                break;
            case reverseKey:
                tokens.push('r');
                break;
            case sliceKey:
                tokens.push(`s${result[4]}`);
                break;
            case spliceKey:
                tokens.push(`p${result[4]}`);
                break;
        }
    }
    return tokens;
};
