export function transformX(selector: string, x: number, reverseTransform: boolean): number
{
    let img = $(selector);
    let width = img.width();
    let marginLeft = (img.outerWidth(true) - img.outerWidth()) / 2;

    if(width == 0)
        return null;

    let trans;
    if(reverseTransform != true)
        trans = x * (width / 760) + marginLeft;
    else
        trans = (x - marginLeft) / (width / 760);
    return Math.round(trans);
}

export function transformY(selector: string, y: number, reverseTransform: boolean): number
{
    let img = $(selector);
    let height = img.height();

    if(height == 0)
        return null;

    let trans;
    if(reverseTransform != true)
        trans = y * (height / 600);
    else
        trans = y / (height / 600);
    return Math.round(trans);
}

export function transformW(selector: string, w: number, reverseTransform: boolean): number
{
    let img = $(selector);
    let width = img.width();

    if(width == 0)
        return null;

    let trans;
    if(reverseTransform != true)
        trans = w * (width / 760);
    else
        trans = w / (width / 760);
    return Math.round(trans);
}