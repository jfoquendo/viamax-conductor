const CLOUD_NAME =
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';

const UPLOAD_PRESET =
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

function getFileExtension(uri) {
    const cleanUri = String(uri ?? '').split('?')[0];
    const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);

    return match?.[1]?.toLowerCase() ?? 'jpg';
}

function getMimeType(extension) {
    if (extension === 'png') return 'image/png';
    if (extension === 'webp') return 'image/webp';
    if (extension === 'heic' || extension === 'heif') {
        return 'image/heic';
    }

    return 'image/jpeg';
}

export async function uploadImageToCloudinary(
    uri,
    { folder = 'viamax' } = {}
) {
    if (!uri) {
        throw new Error('No se seleccionó ninguna imagen');
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Cloudinary no está configurado');
    }

    const extension = getFileExtension(uri);

    const fileResponse = await fetch(uri);

    if (!fileResponse.ok) {
        throw new Error('No se pudo leer la imagen seleccionada');
    }

    const fileBlob = await fileResponse.blob();

    const formData = new FormData();

    formData.append(
        'file',
        fileBlob,
        `viamax-${Date.now()}.${extension}`
    );

    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result?.error?.message ?? 'No se pudo subir la imagen'
        );
    }

    if (!result?.secure_url) {
        throw new Error(
            'Cloudinary no devolvió la URL de la imagen'
        );
    }

    return {
        url: result.secure_url,
        publicId: result.public_id ?? null,
    };
}