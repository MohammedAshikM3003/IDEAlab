import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'
import styles from './ImageCropModal.module.css'

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImageBitmap(await fetch(imageSrc).then((response) => response.blob()))
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const context = canvas.getContext('2d')

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.95)
  })
}

export default function ImageCropModal({ imageSrc, aspectRatio, onCropComplete, onCancel, progressLabel = '' }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isApplying, setIsApplying] = useState(false)

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels || isApplying) {
      return
    }

    setIsApplying(true)

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (!croppedBlob) {
        return
      }
      await onCropComplete(croppedBlob)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel} role="presentation">
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Crop image"
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Crop Image</h3>
          {progressLabel ? <p className={styles.progressLabel}>{progressLabel}</p> : null}
        </div>

        <div className={styles.cropArea}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            restrictPosition={false}
            style={{
              containerStyle: {
                touchAction: 'none',
              },
            }}
          />
        </div>

        <div className={styles.zoomRow}>
          <input
            className={styles.zoomSlider}
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label="Zoom"
          />
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.applyButton} onClick={handleApplyCrop} disabled={isApplying}>
            {isApplying ? 'Applying...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  )
}
