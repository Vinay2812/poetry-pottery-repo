import { Header } from "@/components/header";
import { UserProfileContainer } from "@/features/user-profile";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-20">
        <div className="flex max-w-xl flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-4xl font-medium tracking-tight text-balance">
            Poetry & Pottery
          </h1>
          <p className="text-muted-foreground">
            Handcrafted pottery, workshops, and events — the Poetry & Pottery
            platform.
          </p>
        </div>
        <UserProfileContainer />
      </main>
    </>
  );
}
