import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BlogPostType {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author?: {
    name?: string;
    email?: string;
  };
}

export default function BlogPage() {
  const [blogPost, setBlogPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      toast.error("Invalid blog ID");
      navigate("/");
      return;
    }

    const fetchBlog = async () => {
      try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
          toast.error("Please login first");
          navigate("/signin");
          return;
        }

        const response = await fetch(`/api/api/v1/blog/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch blog: ${response.status}`);
        }

        const data: BlogPostType = await response.json();
        setBlogPost(data);
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast.error("Error loading blog post");
      }
    };

    fetchBlog();
  }, [id, navigate]);

  const handlePublish = async () => {
    if (!blogPost) return;

    setLoading(true);
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        toast.error("Please login first");
        navigate("/signin");
        return;
      }

      const response = await fetch(`/api/api/v1/blog`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          id,
          published: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to publish: ${response.status}`);
      }

      toast.success("Blog published successfully!");
      setBlogPost({ ...blogPost, published: true });
    } catch (error) {
      console.error("Error publishing blog:", error);
      toast.error("Failed to publish blog");
    } finally {
      setLoading(false);
    }
  };

  if (!blogPost) {
    return (
      <div className="flex items-center justify-center text-lg text-muted-foreground">
        There is nothing to display at the moment
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <article className="col-span-1 space-y-6 md:col-span-2">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl">
            {blogPost.title}
          </h1>

          {!blogPost.published && (
            <div className="flex gap-4">
              <Button onClick={handlePublish} disabled={loading}>
                {loading ? "Publishing..." : "Publish"}
              </Button>
              {/* <Button
                variant="outline"
                onClick={() => navigate(`/edit/${blogPost.id}`)}
              >
                Edit
              </Button> */}
            </div>
          )}

          <div className="prose prose-invert max-w-none text-justify">
            <p className="whitespace-pre-wrap">{blogPost.content}</p>
          </div>
        </article>

        <aside className="col-span-1 space-y-6">
          <div className="sticky top-20 space-y-4">
            <h2 className="text-xl font-semibold">Author</h2>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {blogPost.author?.name?.charAt(0).toUpperCase() ??
                    blogPost.author?.email?.charAt(0).toUpperCase() ??
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">
                  {blogPost.author?.name ??
                    blogPost.author?.email ??
                    "Unknown Author"}
                </h3>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
