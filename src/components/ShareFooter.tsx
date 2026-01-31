import { useState } from 'react'

type ShareFooterProps = {
  shareUrl?: string
}

type CopyStatus = 'idle' | 'success' | 'error'

function ShareFooter({
  shareUrl = 'https://personal-multi-investment-tracker.vercel.app/',
}: ShareFooterProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const hasClipboard =
    typeof navigator !== 'undefined' && Boolean(navigator.clipboard)

  const handleCopy = async () => {
    if (!hasClipboard) {
      setCopyStatus('error')
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyStatus('success')
    } catch (error) {
      console.warn('Failed to copy share link.', error)
      setCopyStatus('error')
    }
  }

  const statusMessage =
    copyStatus === 'success'
      ? 'Link copied.'
      : copyStatus === 'error'
        ? 'Copy failed. Please use the link above.'
        : ''

  return (
    <section className="share-footer" aria-label="Share this app">
      <p className="share-footer__title">Share this app</p>
      <div className="share-footer__actions">
        <button
          className="button button--ghost"
          type="button"
          onClick={handleCopy}
        >
          Copy link
        </button>
        {statusMessage && (
          <span
            className="share-footer__status"
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </span>
        )}
      </div>
    </section>
  )
}

export default ShareFooter
