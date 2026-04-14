import { RouterProvider } from 'react-router';
import { router } from './routes';
import './theme-store'; // Initialize theme on load (applies .dark to <html>)

export default function App() {
  return (
    <div
      className="max-w-[430px] mx-auto min-h-screen bg-background overflow-x-hidden"
      style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
    >
      <RouterProvider router={router} />
    </div>
  );
}