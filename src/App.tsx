import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import SearchResults from "./pages/SearchResults";
import Episodes from "./pages/Episodes";
import Popular from "./pages/Popular";
import Releases from "./pages/Releases";
import LikedEpisodes from "./pages/LikedEpisodes";
import Downloads from "./pages/Downloads";
import RecentPlays from "./pages/RecentPlays";
import EpisodeDetail from "./pages/EpisodeDetail";
import Premium from "./pages/Premium"; // Importar a nova página
import { PodcastPlayerProvider } from "./context/PodcastPlayerContext";
import { DownloadProvider } from "./context/DownloadContext";
import { SubscriptionProvider } from "./context/SubscriptionContext"; // Importar o novo provider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SubscriptionProvider> {/* Adicionar o SubscriptionProvider */}
          <DownloadProvider>
            <PodcastPlayerProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/episodes" element={<Episodes />} />
                <Route path="/popular" element={<Popular />} />
                <Route path="/releases" element={<Releases />} />
                <Route path="/liked" element={<LikedEpisodes />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/recent" element={<RecentPlays />} />
                <Route path="/episode/:episodeId" element={<EpisodeDetail />} />
                <Route path="/premium" element={<Premium />} /> {/* NOVA ROTA */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PodcastPlayerProvider>
          </DownloadProvider>
        </SubscriptionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;