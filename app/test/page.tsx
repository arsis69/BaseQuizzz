"use client";

export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'red' }}>Test Page</h1>
      <p>If you can see this with red text, Next.js and styles are working!</p>
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        This is a styled box to verify inline styles work.
      </div>
    </div>
  );
}
