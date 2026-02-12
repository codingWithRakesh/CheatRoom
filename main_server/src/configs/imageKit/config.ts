import ImageKit from 'imagekit';

const imagekit: ImageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "IMAGEKIT_PUBLIC_KEY",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "IMAGEKIT_PRIVATE_KEY",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "IMAGEKIT_URL_ENDPOINT",
});

export default imagekit;