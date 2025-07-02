import React from 'react';

export default function LogoutIcon({ style = {}, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 24 24"
      style={style}
      className={className}
    >
      <path
        fill="currentColor"
        d="M16.5 12a.75.75 0 0 1 .75-.75h-7.19l2.22-2.22a.75.75 0 1 1 1.06-1.06l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22h7.19A.75.75 0 0 1 16.5 12ZM5 3.75A2.25 2.25 0 0 1 7.25 1.5h9.5A2.25 2.25 0 0 1 19 3.75v16.5A2.25 2.25 0 0 1 16.75 22.5h-9.5A2.25 2.25 0 0 1 5 20.25V3.75Zm1.5 0v16.5c0 .414.336.75.75.75h9.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-9.5a.75.75 0 0 0-.75.75Z"
      />
    </svg>
  );
}
