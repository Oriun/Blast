export const needUnit: { [key: string]: string } = {
    width: "px",
    height: "px",
    margin: "px",
    'margin-left': "px",
    'margin-right': "px",
    'margin-top': "px",
    'margin-bottom': "px",
    'margin-inline': "px",
    'margin-block': "px",
    'margin-inline-start': "px",
    'margin-block-start': "px",
    'margin-inline-end': "px",
    'margin-block-end': "px",
    padding: "px",
    'padding-left': "px",
    'padding-right': "px",
    'padding-top': "px",
    'padding-bottom': "px",
    'padding-inline': "px",
    'padding-block': "px",
    'padding-inline-start': "px",
    'padding-block-start': "px",
    'padding-inline-end': "px",
    'padding-block-end': "px",
    gap: "px",
    'column-gap': "px",
    'row-gap': "px",
    'border-radius': "px"
    // ...
}

export function transformCSSProperty(property: string) {
    let transformed = ""
    let copy = property.split('')
    let i = copy.findIndex(a => a === a.toUpperCase())
    while (i !== -1) {
        transformed += copy.slice(0, i).join('')
        transformed += '-' + copy[i].toLowerCase()
        copy = copy.slice(i + 1)
        i = copy.findIndex(a => a === a.toUpperCase())
    }
    return transformed + copy.join('')
}

export function parseStyleString(style: string): { [key: string]: string } {
    return Object.fromEntries(style.split(';').map(a => a.split(':')))
}

export function transformCSSValue(property: string, value: any) {
    return property in needUnit && typeof value !== 'string' ? value + needUnit[property] : value
}