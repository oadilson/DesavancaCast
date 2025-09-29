import Layout from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import PodcastOverview from "@/components/PodcastOverview"; // Import the new component

const Index = () => {
  return (
    <Layout>
      <ScrollArea className="h-full">
        <PodcastOverview /> {/* Render the new PodcastOverview component */}
      </ScrollArea>
    </Layout>
  );
};

export default Index;