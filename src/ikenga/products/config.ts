// ============================================================
// IKENGA UNIFIED PLATFORM — PRODUCT DEFINITIONS
//
// Four products, one credit pool, distinct voices.
// Each product injects its tone into the generation engine.
// ============================================================

export interface ProductConfig {
  id:              ProductId;
  name:            string;
  tagline:         string;
  description:     string;
  color:           string;          // accent hex
  bgColor:         string;          // card bg
  borderColor:     string;          // card border
  tone:            string;          // injected into generation tone field
  toneDirective:   string;          // injected into notes / system context
  sampleOutputs:   SampleOutput[];  // static homepage demo examples
}

export interface SampleOutput {
  type:    string;
  label:   string;
  preview: string;
}

export type ProductId = "IKENGA" | "JUO" | "OBA" | "OMENALA";

export const PRODUCTS: Record<ProductId, ProductConfig> = {

  IKENGA: {
    id:          "IKENGA",
    name:        "IKENGA",
    tagline:     "Your Chi in Motion",
    description: "The original brand momentum engine. Authentic entrepreneurial fire for brands that refuse to move small.",
    color:       "#FFD700",
    bgColor:     "#0a0800",
    borderColor: "#3a3000",
    tone:        "bold, authentic, momentum-driven, entrepreneurial, unapologetic",
    toneDirective:
      "Write with raw entrepreneurial energy. This brand has a Chi — a momentum that cannot be faked. Every line should feel like it was written by a founder who has been in the room and won.",
    sampleOutputs: [
      {
        type:    "Social post",
        label:   "Instagram",
        preview: "Most brands post. Few brands move. The difference is not budget — it is Chi. Your audience can feel when content is manufactured. They can also feel when it is alive. We help you stay alive.",
      },
      {
        type:    "Email subject",
        label:   "Campaign",
        preview: "You are not behind. You are building momentum. Here is your content plan for the week.",
      },
      {
        type:    "Video hook",
        label:   "LinkedIn",
        preview: "I almost quit building in public — until I realised I was measuring the wrong thing entirely.",
      },
    ],
  },

  JUO: {
    id:          "JUO",
    name:        "JUO",
    tagline:     "Ask better. Lead more.",
    description: "The thought leadership engine. Ask the questions your industry avoids. Build authority through insight.",
    color:       "#60a5fa",
    bgColor:     "#00080a",
    borderColor: "#003040",
    tone:        "inquisitive, educational, analytical, authoritative, thought-provoking",
    toneDirective:
      "Write with intellectual authority. Lead with powerful questions that expose assumptions. This brand builds trust by teaching, not selling. Every piece of content should leave the reader thinking differently.",
    sampleOutputs: [
      {
        type:    "Social post",
        label:   "LinkedIn",
        preview: "Why do most founders go quiet when business slows down? That is exactly when the audience needs to hear from you most. Silence communicates fear. Insight communicates leadership.",
      },
      {
        type:    "Email subject",
        label:   "Newsletter",
        preview: "The question your competitors are not asking (but your clients are).",
      },
      {
        type:    "Video hook",
        label:   "YouTube",
        preview: "What if everything you know about content marketing is optimised for the wrong metric?",
      },
    ],
  },

  OBA: {
    id:          "OBA",
    name:        "OBA",
    tagline:     "Speak like royalty.",
    description: "Premium brand voice engine. Authoritative, commanding, built for category leaders and luxury brands.",
    color:       "#c084fc",
    bgColor:     "#080010",
    borderColor: "#2a0050",
    tone:        "authoritative, commanding, premium, regal, decisive",
    toneDirective:
      "Write with commanding authority and total confidence. This brand leads its category and never explains itself. Every word is deliberate. Every claim is certain. Premium brands do not beg for attention — they create it.",
    sampleOutputs: [
      {
        type:    "Social post",
        label:   "Instagram",
        preview: "We do not compete. We set the standard others measure themselves against. If you want the best — you already know where to find it.",
      },
      {
        type:    "Email subject",
        label:   "Launch",
        preview: "By invitation only: the collection is ready.",
      },
      {
        type:    "Video hook",
        label:   "Brand film",
        preview: "There are brands. And then there is this.",
      },
    ],
  },

  OMENALA: {
    id:          "OMENALA",
    name:        "OMENALA",
    tagline:     "Culture is the brand.",
    description: "Cultural identity engine. Afrocentric storytelling, proud heritage, community-first. For brands rooted in African excellence.",
    color:       "#4ade80",
    bgColor:     "#000a04",
    borderColor: "#003020",
    tone:        "culturally proud, heritage-driven, community-first, Afrocentric, warm, celebratory",
    toneDirective:
      "Write with deep cultural pride and warmth. Celebrate heritage, community, and identity as the brand's core story. Reference African history, values, and excellence naturally. Make every person in the community feel seen and represented.",
    sampleOutputs: [
      {
        type:    "Social post",
        label:   "Instagram",
        preview: "Your culture is not a niche. It is a superpower. When your brand speaks with authentic pride, you do not just attract customers — you build a movement of people who belong.",
      },
      {
        type:    "Email subject",
        label:   "Community",
        preview: "This is for the ones who built in silence — your time is now.",
      },
      {
        type:    "Video hook",
        label:   "Short-form",
        preview: "My grandmother never called herself an entrepreneur. But she built something that fed three generations. We call that Omenala.",
      },
    ],
  },
};

export const PRODUCT_IDS: ProductId[] = ["IKENGA", "JUO", "OBA", "OMENALA"];

export function getProduct(id: string): ProductConfig {
  return PRODUCTS[(id as ProductId)] ?? PRODUCTS.IKENGA;
}
