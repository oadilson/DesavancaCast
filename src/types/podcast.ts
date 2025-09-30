export interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  releaseDate: string; // Mantido como string para exibição, mas vem como ISO string
  audioUrl: string;
  coverImage?: string;
  // Campos do banco de dados
  podcast_id?: string;
  guid?: string;
  cover_image?: string;
  audio_url?: string;
  release_date?: string;
  is_edited?: boolean; // Adicionado para rastrear edições
  newsletter_content?: string | null; // Novo campo para o conteúdo
  newsletter_subtitle?: string | null; // Novo campo para o subtítulo
  isLiked?: boolean; // NOVO: Indica se o episódio foi curtido pelo usuário atual
  host?: string; // Adicionado para a página de detalhes
  podcastTitle?: string; // Adicionado para a página de detalhes
  is_premium?: boolean; // NOVO: Indica se o episódio é premium
}

export interface Podcast {
  id: string;
  title: string;
  host: string;
  description:string;
  coverImage: string;
  monthly_listeners?: string | null;
  episodes: Episode[];
}

export interface AudioTrail {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  episodes: Episode[];
}