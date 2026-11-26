import { redirect } from "next/navigation";
import { getIdentity } from "@/lib/auth/session";
import { getProfile } from "@/lib/data/profiles";
import { isDemoMode } from "@/lib/config";
import Chat from "@/components/Chat";
import { storageBackend } from "@/lib/store";

export default async function Home() {
  const identity = await getIdentity();
  if (!identity) redirect("/login");
  const profile = getProfile(identity.profileId);
  return (
    <Chat
      userId={identity.userId}
      isAdmin={identity.role === "admin"}
      profileName={profile?.displayName ?? "Unbekanntes Profil"}
      demoMode={isDemoMode()}
      tempStorage={storageBackend() === "temporaer"}
    />
  );
}
