import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Newspaper } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface NewsletterReaderProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
  title: string;
  subtitle: string | null;
}

const NewsletterReader: React.FC<NewsletterReaderProps> = ({ isOpen, onClose, content, title, subtitle }) => {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-podcast-black-light border-podcast-border text-podcast-white max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-podcast-border">
          <div>
            <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-podcast-green" />
              {title}
            </DialogTitle>
            {subtitle && <p className="text-base sm:text-lg text-podcast-gray mt-1">{subtitle}</p>}
            <DialogDescription className={subtitle ? 'mt-2' : ''}>
              Você pode continuar ouvindo o episódio enquanto lê.
            </DialogDescription>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <article className="prose prose-invert prose-sm sm:prose-lg max-w-none p-4 sm:p-8 prose-headings:font-bold prose-headings:text-podcast-white prose-h1:text-3xl sm:prose-h1:text-4xl prose-h2:text-2xl sm:prose-h2:text-3xl prose-h3:text-xl sm:prose-h3:text-2xl prose-p:text-podcast-gray prose-a:text-podcast-green prose-a:no-underline hover:prose-a:underline prose-strong:text-podcast-white prose-blockquote:border-l-4 prose-blockquote:border-podcast-purple prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-podcast-green prose-img:rounded-lg prose-hr:border-podcast-border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </article>
        </ScrollArea>
        <DialogFooter className="p-4 border-t border-podcast-border">
          <Button onClick={onClose} variant="outline" className="bg-transparent border-podcast-gray hover:bg-podcast-border hover:text-podcast-white">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterReader;