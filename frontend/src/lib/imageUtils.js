export async function downscaleImage(file, maxSize = 1024, quality = 0.8) {
    if (!file.type.startsWith('image/')) return file

    try {
        const bitmap = await createImageBitmap(file)
        const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
        const width = Math.round(bitmap.width * scale)
        const height = Math.round(bitmap.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
        bitmap.close?.()

        const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', quality)
        )

        return blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file
    } catch {
        return file
    }
}