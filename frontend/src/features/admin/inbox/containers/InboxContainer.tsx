"use client";

import { useCallback } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAdminQueryState } from "@/features/admin/shell";
import { AdminPageHeader } from "@/features/admin/ui";

import { ContactMessagesContainer } from "@/features/admin/inbox/containers/ContactMessagesContainer";
import { SubscribersContainer } from "@/features/admin/inbox/containers/SubscribersContainer";
import { toInboxTab } from "@/features/admin/inbox/types";

export function InboxContainer() {
  const { values, patch } = useAdminQueryState();
  const tab = toInboxTab(values.tab);

  // Messages are the default, so that tab leaves the address bar clean.
  const handleTabChange = useCallback(
    (value: string) => {
      patch({ tab: value === "messages" ? null : value });
    },
    [patch],
  );

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        eyebrow="Studio"
        title="Inbox"
        description="Messages from the contact form and the newsletter list."
      />
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>
        <TabsContent value="messages">
          <ContactMessagesContainer />
        </TabsContent>
        <TabsContent value="subscribers">
          <SubscribersContainer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
