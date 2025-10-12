'use client';

import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';

export function SWRProvider({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          return fetch(process.env.NEXT_PUBLIC_API_BASE_URL + url, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          }).then(res => res.json());
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }}
    >
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </SWRConfig>
  );
}