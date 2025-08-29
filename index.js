import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';
import { homedir } from 'os';

const file = process.argv[2];
if (typeof file !== 'string') throw new Error('Please input a valid path');

const scale = Number(process.argv[3]);
if (typeof scale !== 'number') throw new Error('Please input a valid scale');

const filePath = path.resolve(homedir(), file);
const readFile = fs.readFileSync(filePath);
const image = new Uint8Array(readFile);
const imgInfo = await sharp(image).metadata();

const desiredHeight = Math.ceil(imgInfo.height / 6);
const desiredWidth = Math.ceil(imgInfo.width / 6);

const { data, info } = await sharp(image)
    .resize(desiredWidth, desiredHeight)
    .removeAlpha()
    .toColorspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
const arrayImg = new Uint8Array(data);

const pixelMap = [];
const asciiChars = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';

function grayToAscii(grayScale) {
    return asciiChars[Math.round(((asciiChars.length - 1) * grayScale) / 255)];
}

for (let index = 0; index < arrayImg.length; index = index + 3) {
    const grayScale = Math.round(
        arrayImg[index] * 0.2126 + arrayImg[index + 1] * 0.7152 + arrayImg[index + 2] * 0.0722
    );

    pixelMap.push(grayScale);
}

function outputAscii(pixelMap, width) {
    const ascii = pixelMap.reduce((asciiImage, grayScale, index) => {
        let nextChars = grayToAscii(grayScale);

        if ((index + 1) % width === 0) {
            nextChars += '\n';
        }

        return asciiImage + nextChars;
    }, '');

    console.log(ascii);
}

outputAscii(pixelMap, info.width);
