import { useState } from 'react'

type ShareFooterProps = {
  shareUrl?: string
}

type CopyStatus = 'idle' | 'success' | 'error'

function ShareFooter({
  shareUrl = 'https://your-hosted-url',
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
    <footer className="share-footer" aria-label="Share this app">
      <p className="share-footer__title">Share this app</p>
      <p className="share-footer__hint">
        Share this app:{' '}
        <a
          className="share-footer__link"
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
        >
          {shareUrl}
        </a>
      </p>
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
      <p className="share-footer__privacy">Data stays in your browser.</p>
    </footer>
  )
}

export default ShareFooter
