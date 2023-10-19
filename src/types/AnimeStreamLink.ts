export interface AnimeStreamLink {
  link: string;
  subs_link: string;
  is_hls: boolean;
  extra_headers?: Record<string, string>;
  success?: boolean
  server?: string
  is_playable?: boolean
}