declare global {
  // Prisma JSON Types (used by prisma-json-types-generator)
  namespace PrismaJson {
    // SettingValue types for SiteSetting.value
    interface HeroImages {
      home: string;
      ourStory: string;
      products: string;
      events: string;
    }

    interface ContactInfo {
      address: string;
      email: string;
      phone: string;
      hours: string;
    }

    interface SocialLinks {
      instagram: string;
      facebook: string;
      twitter: string;
      pinterest: string;
    }

    // CategoryIconConfig for category_icons setting
    type CategoryIconConfig = Record<string, string>;

    type SettingValue =
      HeroImages | ContactInfo | SocialLinks | CategoryIconConfig;

    // ContentBlocks types for ContentPage.content
    interface AboutValue {
      icon: string;
      title: string;
      description: string;
    }

    interface AboutTeamMember {
      name: string;
      role: string;
      image: string;
      bio: string;
    }

    interface AboutProcessStep {
      step: string;
      title: string;
      description: string;
    }

    interface AboutPageContent {
      storyTitle: string;
      storySubtitle: string;
      storyContent: string[];
      values: AboutValue[];
      team: AboutTeamMember[];
      processSteps: AboutProcessStep[];
    }

    interface FAQItem {
      question: string;
      answer: string;
    }

    interface FAQCategory {
      title: string;
      faqs: FAQItem[];
    }

    interface FAQPageContent {
      categories: FAQCategory[];
    }

    interface ShippingOption {
      icon: string;
      title: string;
      description: string;
      price: string;
    }

    interface ShippingInfo {
      title: string;
      content: string;
    }

    interface ReturnsPolicy {
      icon: string;
      title: string;
      description: string;
    }

    interface ReturnStep {
      step: string;
      title: string;
      description: string;
    }

    interface ShippingPageContent {
      shippingOptions: ShippingOption[];
      shippingInfo: ShippingInfo[];
      returnsPolicy: ReturnsPolicy[];
      returnSteps: ReturnStep[];
    }

    interface GlazeType {
      name: string;
      icon: string;
      description: string;
      care: string;
    }

    interface CareWarning {
      icon: string;
      title: string;
      description: string;
    }

    interface CarePageContent {
      glazeTypes: GlazeType[];
      warnings: CareWarning[];
      safeFor: string[];
      avoid: string[];
    }

    interface PrivacySection {
      title: string;
      content: string;
    }

    interface PrivacyPageContent {
      lastUpdated: string;
      introduction: string;
      sections: PrivacySection[];
      contactEmail: string;
    }

    interface TermsSection {
      title: string;
      content: string;
    }

    interface TermsPageContent {
      lastUpdated: string;
      introduction: string;
      sections: TermsSection[];
      contactEmail: string;
    }

    type ContentBlocks =
      | AboutPageContent
      | FAQPageContent
      | ShippingPageContent
      | CarePageContent
      | PrivacyPageContent
      | TermsPageContent;

    // ShippingAddress for ProductOrder.shipping_address JSON field
    interface ShippingAddress {
      name: string;
      address_line_1: string;
      address_line_2?: string | null;
      city: string;
      state: string;
      zip: string;
      contact_number?: string | null;
    }

    // ProductCustomizationData for Cart, Wishlist, and PurchasedProductItem custom_data fields
    interface CustomizationOptionSnapshot {
      type: string;
      optionId: number;
      name: string;
      value: string;
      priceModifier: number;
    }

    interface ProductCustomizationData {
      options: CustomizationOptionSnapshot[];
      totalModifier: number;
    }

    // DailyWorkshopPricingSnapshot for DailyWorkshopRegistration.pricing_snapshot
    interface DailyWorkshopAppliedTier {
      tier_id: number;
      hours: number;
      price_per_person: number;
      pieces_per_person: number;
    }

    interface DailyWorkshopBlackoutRecovery {
      pending_slot_start_times: string[];
      required_slots: number;
      window_start_minutes: number;
      window_end_minutes: number;
    }

    interface DailyWorkshopPricingSnapshot {
      hours: number;
      price_per_person: number;
      pieces_per_person: number;
      applied_tiers: DailyWorkshopAppliedTier[];
      slot_duration_minutes: number;
      blackout_recovery?: DailyWorkshopBlackoutRecovery;
    }
  }
}

export {};
