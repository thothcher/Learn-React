// Accounts need the C# API. It runs locally (npm run dev) and on Vercel;
// the GitHub Pages build has no backend, so accounts stay hidden there.
export const accountsEnabled = import.meta.env.VITE_ENABLE_ACCOUNTS === 'true'
