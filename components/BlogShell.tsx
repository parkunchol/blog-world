import type { User } from "@supabase/supabase-js";
import { BlogSidebar } from "@/components/BlogSidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllCategories, getAllTags } from "@/lib/taxonomy";

export async function BlogShell({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const [categories, tags] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ]);

  return (
    <>
      <SiteHeader user={user} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <aside className="order-2 w-full shrink-0 lg:order-1 lg:w-56 lg:max-w-[240px]">
            <BlogSidebar
              user={user}
              categories={categories}
              tags={tags}
            />
          </aside>
          <div className="order-1 min-w-0 flex-1 lg:order-2">{children}</div>
        </div>
      </div>
    </>
  );
}
