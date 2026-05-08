import React from "react";

export default function Footer() {
  return (
    <footer className="py-8 text-center text-sm" style={{ color: 'var(--text-dim)', borderTop: '1px solid var(--border)' }}>
        © {new Date().getFullYear()} DriveShare. Built with ❤️ in India.
      </footer>
  )
}