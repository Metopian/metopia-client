import { pinataApiKey, pinataSecretApiKey } from '../config/constant'
import { ipfsApi, testApi } from '../config/urls'


const createImage = url =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', error => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

export declare type Area = {
    width: number;
    height: number;
    x: number;
    y: number;
};

export async function getCroppedImg(imageSrc: string, pixelCrop: Area) {
    const image = (await createImage(imageSrc)) as CanvasImageSource
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    // As Base64 string
    // return canvas.toDataURL('image/jpeg');

    // As a blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(file => {
            console.log(canvas, file)
            resolve(window.URL.createObjectURL(file))
        }, 'image/jpeg')
    })
}


function getBase64Image(img: any) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL
}

export const updateImgToIfps = (image: File) => {
    let headers = new Headers();
    headers.append("pinata_api_key", pinataApiKey)
    headers.append("pinata_secret_api_key", pinataSecretApiKey)
    const formData = new FormData();
    formData.append('file', image);

    const options = {
        method: 'POST',
        body: formData,
        headers: headers
    };

    return fetch(ipfsApi.pinata_pinFileToIPFS, options).then(res => res.json());
}


export const updateImg = (image: File) => {
    let headers = new Headers();
    const formData = new FormData();
    formData.append('file', image);

    const options = {
        method: 'POST',
        body: formData,
        headers: headers
    };

    return fetch(testApi.image_store, options).then(res => res.json());
}