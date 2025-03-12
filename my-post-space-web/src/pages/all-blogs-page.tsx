import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // shadcn utility for conditional classes
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckIcon, Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for blog posts

interface PublicPostType {
  id: string;
  title: string;
  author?: { name?: string; email?: string };
}

interface PrivatePostType {
  id: string;
  title: string;
  published: boolean;
}

export default function AllBlogsPage() {
  const [publicPosts, setPublicPosts] = useState([]);
  const [privatePosts, setPrivatePosts] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("for-you");

  useEffect(() => {
    const fetchBlogs = async () => {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        toast.error("Please login first");
        navigate("/signin");
        return;
      }
      toast("Fetching Blogs For You ...", { duration: 1000 });
      try {
        const response = await fetch("/api/api/v1/blog/bulk", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setPublicPosts(data.publicPosts || []);
          setPrivatePosts(data.userPosts || []);
        } else {
          toast.error(`Status: ${response.status}`, {
            description: JSON.stringify(data),
          });
        }
      } catch (error: any) {
        toast.error("Failed to fetch blogs", {
          description: error.message,
        });
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Tabs
        defaultValue={activeTab}
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <div className="border-b">
          <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="for-you"
              className="h-10 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              For you
            </TabsTrigger>
            <TabsTrigger
              value="private"
              className="h-10 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Private posts
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="for-you" className="mt-6 space-y-10">
          {publicPosts.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-center text-muted-foreground">
                Nothing for now
              </p>
            </div>
          ) : (
            publicPosts
              .slice()
              .reverse()
              .map((post: PublicPostType) => (
                <PublicPostCard key={post.id} post={post} />
              ))
          )}
        </TabsContent>

        <TabsContent value="private" className="mt-6">
          {privatePosts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center">
              <div className="text-center text-muted-foreground">
                You haven't created any post
              </div>
              <div>
                <Link className="hover:underline" to="/create">
                  Create Here
                </Link>
              </div>
            </div>
          ) : (
            privatePosts
              .slice()
              .reverse()
              .map((post: PrivatePostType) => (
                <div className="*:my-2" key={post.id}>
                  <PrivatePostCard post={post} />
                </div>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

const PrivatePostCard = ({ post }: { post: PrivatePostType }) => {
  return (
    <Card key={post.id} className="p-4">
      <CardContent className="space-y-3">
        <span
          className={cn(
            "inline-block rounded-full px-3 py-1 text-xs font-semibold transition-colors",
            post.published
              ? "bg-green-100 text-green-600 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {post.published ? "Published" : "Draft"}
        </span>
        <div className="flex items-center justify-between">
          <Link to={`/blog/${post.id}`} className="group block">
            <h2 className="text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
              {post.title}
            </h2>
          </Link>
          <span>{post.published && <ShareButton id={post.id} />}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const PublicPostCard = ({ post }: { post: PublicPostType }) => {
  return (
    <Card key={post.id} className="p-4">
      <CardContent className="space-y-3">
        {/* Author Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {post.author?.name?.charAt(0).toUpperCase() ??
                post.author?.email?.charAt(0).toUpperCase() ??
                "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">
            {post.author?.name ?? post.author?.email ?? "Unknown Author"}
          </span>
        </div>

        {/* Post Title */}
        <div className="flex items-center justify-between">
          <Link to={`/blog/${post.id}`} className="group block">
            <h2 className="text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
              {post.title}
            </h2>
          </Link>
          <ShareButton id={post.id} />
        </div>
      </CardContent>
    </Card>
  );
};

const ShareButton = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleCopy}
      className="flex items-center gap-1"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-green-500" />
      ) : (
        <Share2Icon className="h-4 w-4 text-primary" />
      )}
      <span className="sr-only">{copied ? "Copied" : "Copy link"}</span>
    </Button>
  );
};
