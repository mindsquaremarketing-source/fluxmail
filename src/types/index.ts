export type ShopifyStore = {
  id: string;
  name: string;
  domain: string;
  accessToken: string;
};

export type EmailCampaign = {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EmailTemplate = {
  id: string;
  name: string;
  html: string;
  createdAt: Date;
  updatedAt: Date;
};
