import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Plus, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import TextArea from "@/components/blog-editor";

export default function CreateBlogPage() {
  const oldBlogPost = JSON.parse(localStorage.getItem("createPost") ?? "{}");
  const [blogPost, setBlogPost] = useState({
    title: oldBlogPost?.title ?? "",
    content: oldBlogPost?.content ?? "",
    published: false,
  });

  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(true);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlogPost((prev) => ({ ...prev, title: e.target.value }));
    setIsSaved(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBlogPost((prev) => ({ ...prev, content: e.target.value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (blogPost.title === "" && blogPost.content === "") return;
    localStorage.setItem("createPost", JSON.stringify(blogPost));
    setIsSaved(true);
    // Save logic here
  };

  const handlePublish = () => {
    console.log("Publishing blog post:", blogPost);
    setBlogPost((e) => ({ ...e, published: !e.published }));
    // Publish logic here
  };

  const handleCreate = () => {
    toast("Creating Blog ...", { duration: 1000 });
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      toast.error("Please login first");
      return;
    }
    fetch("/api/api/v1/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(blogPost),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        if (data.id) {
          toast.success("Blog created successfully!");
          localStorage.removeItem("createPost");
          navigate("/blog/" + data.id);
        } else {
          toast.error("Failed to create blog");
        }
      })
      .catch((error) => {
        console.error("Error creating blog:", error);
        toast.error("Failed to create blog");
      });
  };

  const handleClear = () => {
    localStorage.removeItem("createPost");
    setBlogPost({ title: "", content: "", published: false });
    setIsSaved(true);
  };

  const userEmail: string = localStorage.getItem("email")!;

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      toast.error("Please login first");
      navigate("/signin");
      return;
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarFallback>
                  {userEmail ? userEmail.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {userEmail ?? "Unknown"}
              </span>
            </div>

            <span className="text-sm text-muted-foreground">
              {isSaved ? "Saved" : "Unsaved changes"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-full text-center active:bg-accent/50"
              onClick={handleSave}
            >
              <Bell className="h-5 w-5" />
              <span>Save</span>
            </Button>

            <Button
              variant="default"
              className={`rounded-full w-20 ${cn(
                blogPost.published
                  ? "bg-green-500 hover:bg-green-500/70"
                  : "bg-gray-500 hover:bg-gray-500/70"
              )}`}
              onClick={handlePublish}
            >
              {blogPost.published ? "Public" : "Private"}
            </Button>
            <Button
              onClick={handleCreate}
              className="rounded-full text-center bg-yellow-400 hover:bg-yellow-400/70 active:bg-yellow-500"
            >
              <PlusCircle />
              Create
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto grid max-w-4xl grid-cols-12 gap-4 px-4 py-8">
        <div className="col-span-1 flex justify-center">
          <Button
            onClick={handleClear}
            variant="ghost"
            title="Clear"
            size="icon"
            className="rounded-full"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        <div className="col-span-11 space-y-6">
          <input
            type="text"
            value={blogPost.title}
            onChange={handleTitleChange}
            placeholder="Title"
            className="w-full border-none bg-transparent text-4xl font-bold outline-none placeholder:text-muted-foreground/50"
          />

          {/* The new text area */}

          <TextArea
            value={blogPost.content}
            onChange={handleContentChange}
            placeholder="Tell your story..."
          />

          {/* <textarea
            value={blogPost.content}
            onChange={handleContentChange}
            placeholder="Tell your story..."
            className="min-h-[60vh] w-full resize-none border-none bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
          /> */}
        </div>
      </div>
    </div>
  );
}
