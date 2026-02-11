'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BookQRCodeProps {
  digitalId: string;
  bookTitle: string;
}

export function BookQRCode({ digitalId, bookTitle }: BookQRCodeProps) {
  const [showModal, setShowModal] = useState(false);
  const historyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/book-history/${digitalId}`
      : `/book-history/${digitalId}`;

  // Generate QR code URL using Google Charts API (lightweight, no dependencies)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    historyUrl
  )}&bgcolor=ffffff&color=0a0a0a`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${digitalId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${bookTitle}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: system-ui, -apple-system, sans-serif;
                padding: 20px;
              }
              .container {
                text-align: center;
                max-width: 400px;
              }
              h1 {
                font-size: 18px;
                margin-bottom: 8px;
              }
              .subtitle {
                color: #666;
                font-size: 14px;
                margin-bottom: 20px;
              }
              img {
                width: 250px;
                height: 250px;
              }
              .id {
                font-family: monospace;
                font-size: 10px;
                color: #999;
                margin-top: 16px;
              }
              .instructions {
                font-size: 12px;
                color: #666;
                margin-top: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${bookTitle}</h1>
              <p class="subtitle">Scan to see this book's journey</p>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <p class="id">ID: ${digitalId}</p>
              <p class="instructions">Scan this QR code to view and add to this book's reading history</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      {/* QR Code Card */}
      <div className="p-5 rounded-xl bg-linear-to-br from-accent/5 to-accent/10 border border-accent/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Book&apos;s Journey QR
              </p>
              <p className="text-xs text-muted-foreground">
                Scan to see reading history
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
          >
            View QR
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link
            href={`/book-history/${digitalId}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            View History
          </Link>
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-lg bg-card border border-border text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
            title="Download QR Code"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-lg bg-card border border-border text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
            title="Print QR Code"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Book QR Code</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* QR Code Image */}
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-white rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>

              {/* Book Info */}
              <div className="text-center mb-6">
                <p className="font-semibold text-foreground mb-1">
                  {bookTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  Scan to view this book&apos;s journey
                </p>
              </div>

              {/* ID Display */}
              <div className="p-3 rounded-lg bg-muted/50 text-center mb-6">
                <p className="text-xs text-muted-foreground mb-1">Digital ID</p>
                <p className="font-mono text-sm text-foreground">{digitalId}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary/50 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </button>
              </div>
            </div>

            {/* Footer Tip */}
            <div className="px-6 py-4 bg-accent/5 border-t border-accent/10">
              <div className="flex gap-2">
                <svg
                  className="w-5 h-5 text-accent shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="text-xs text-muted-foreground">
                  Print and place this QR code inside the book so future readers
                  can scan and add their journey!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
