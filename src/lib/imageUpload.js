// Turns a picked file into a small, square, JPEG data URL — there's no
// backend to upload to, so a profile photo has to live inside the same
// localStorage blob as the rest of progress (see data/progress.js), which
// has a hard size ceiling. Downscaling + compressing here, once, at pick
// time is what keeps a phone photo (often several MB) from ever reaching
// that ceiling in the first place.
const MAX_SOURCE_BYTES = 12 * 1024 * 1024 // reject absurd files before even decoding them
export const AVATAR_SIZE = 256
const JPEG_QUALITY = 0.82

export class ImageUploadError extends Error {}

export function readImageAsSquareDataUrl(file, size = AVATAR_SIZE) {
  if (!file) return Promise.reject(new ImageUploadError('No file selected'))
  if (!file.type?.startsWith('image/')) return Promise.reject(new ImageUploadError('Choose an image file'))
  if (file.size > MAX_SOURCE_BYTES) return Promise.reject(new ImageUploadError('That image is too large — try one under 12MB'))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new ImageUploadError('Could not read that file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new ImageUploadError('Could not read that image'))
      img.onload = () => {
        try {
          resolve(cropToSquareDataUrl(img, size))
        } catch {
          reject(new ImageUploadError('Could not process that image'))
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// Center-crops to a square before scaling, so a portrait or landscape photo
// fills the circular avatar instead of squashing.
function cropToSquareDataUrl(img, size) {
  const sourceSize = Math.min(img.naturalWidth, img.naturalHeight)
  const sourceX = (img.naturalWidth - sourceSize) / 2
  const sourceY = (img.naturalHeight - sourceSize) / 2

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size)

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}
