declare global {
  namespace PrismaJson {
    interface ProductSelection {
      group_id: number;
      group_name: string;
      option_id: number | null;
      option_name: string | null;
      text: string | null;
      price_modifier: number;
    }

    interface ProductCustomisation {
      options: ProductSelection[];
      reference_image_urls: string[];
    }

    // Rows written before reference photos existed hold a bare option array.
    type ProductSelections = ProductSelection[] | ProductCustomisation;

    interface ShippingAddress {
      name: string;
      phone: string;
      line1: string;
      line2: string | null;
      landmark: string | null;
      city: string;
      state: string;
      pincode: string;
    }

    interface ContentSectionItem {
      title: string;
      body: string;
    }

    interface ContentSection {
      heading: string;
      body: string;
      items: ContentSectionItem[];
    }

    type ContentSections = ContentSection[];
  }
}

export {};
