// ––––––––– app/(console)/layout.tsx –––––––––––––––––––––––––––––––––––
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
// import 'mapbox-gl/dist/mapbox-gl.css';
 
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}