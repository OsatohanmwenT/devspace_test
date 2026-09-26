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

// Banners are wide and shown at most ~900px across, so they're cropped to a
// 3:1 strip and compressed harder than the avatar — a banner is the single
// biggest thing in the profile blob, and it's decorative.
export const BANNER_WIDTH = 1200
export const BANNER_HEIGHT = 400
const BANNER_QUALITY = 0.72

export function readImageAsSquareDataUrl(file, size = AVATAR_SIZE) {
  return readImage(file, (img) => cropToDataUrl(img, size, size, JPEG_QUALITY))
}

export function readImageAsBannerDataUrl(file) {
  return readImage(file, (img) => cropToDataUrl(img, BANNER_WIDTH, BANNER_HEIGHT, BANNER_QUALITY))
}

function readImage(file, process) {
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
          resolve(process(img))
        } catch {
          reject(new ImageUploadError('Could not process that image'))
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// Center-crops to the target aspect before scaling, so a portrait or
// landscape photo fills the avatar circle or banner strip instead of
// squashing. Never upscales past the source — a small image stays small.
function cropToDataUrl(img, width, height, quality) {
  const aspect = width / height
  const sourceWidth = Math.min(img.naturalWidth, img.naturalHeight * aspect)
  const sourceHeight = sourceWidth / aspect
  const sourceX = (img.naturalWidth - sourceWidth) / 2
  const sourceY = (img.naturalHeight - sourceHeight) / 2
  const scale = Math.min(1, sourceWidth / width) || 1

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/jpeg', quality)
}
