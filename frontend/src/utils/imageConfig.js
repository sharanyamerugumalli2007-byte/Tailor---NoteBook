/**
 * TailorCraft - Centralized Image Asset Configuration
 * Curated high-resolution tailoring, boutique, ethnic wear and fabric photography from Unsplash.
 */

export const IMAGE_CONFIG = {
  // Hero & Banners
  hero: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80", // Tailor boutique with dress form
  heroAlt: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1600&q=80",
  loginBanner: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80", // Pastel fashion boutique
  adminLoginBanner: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
  
  // Craft & Studio Photography
  tailorWorking: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80", // Measuring & drafting
  sewingMachine: "https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80", // Pink/gold sewing machine
  measuringTape: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80", // Fabric & tape measure
  fabricsRolls: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80", // Silk and pastel rolls
  luxuryBoutique: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",

  // Garment Categories & Featured Designs
  blouse: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80", // Embroidered blouse
  saree: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80", // Silk saree & custom draping
  dress: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80", // Flowing gown / dress
  kurti: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80", // Designer Kurti / Kurta
  lehenga: "https://images.unsplash.com/photo-1583391733975-021e14be2611?auto=format&fit=crop&w=800&q=80", // Bridal Lehenga Choli
  suit: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80", // Bandhgala / Suit
  shirt: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80", // Tailored shirt
  pants: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80", // Trousers

  // Avatars
  avatarFemale: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  avatarMale: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  masterTailor: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
};

export const GARMENT_OPTIONS = [
  { id: 'Blouse', name: 'Designer Blouse', image: IMAGE_CONFIG.blouse, basePrice: 1200, desc: 'Princess cut, padded, back hook, custom neckline' },
  { id: 'Saree Blouse', name: 'Bridal Saree Blouse', image: IMAGE_CONFIG.blouse, basePrice: 2200, desc: 'Maggam work, zardozi embroidery, deep neck latkan' },
  { id: 'Dress', name: 'Western / Indo-Western Dress', image: IMAGE_CONFIG.dress, basePrice: 2800, desc: 'A-line, bodycon, flared evening party dresses' },
  { id: 'Kurti', name: 'Designer Kurti / Tunic', image: IMAGE_CONFIG.kurti, basePrice: 1500, desc: 'Straight cut, A-line, Anarkali kurti stitching' },
  { id: 'Salwar Suit', name: 'Salwar Kameez Suit', image: IMAGE_CONFIG.saree, basePrice: 2400, desc: 'Churidar, Patiala, Palazzo suit sets' },
  { id: 'Lehenga', name: 'Bespoke Lehenga Choli', image: IMAGE_CONFIG.lehenga, basePrice: 6500, desc: 'Heavy flare lehenga with can-can and dupatta styling' },
  { id: 'Pants', name: 'Tailored Trousers / Pants', image: IMAGE_CONFIG.pants, basePrice: 1400, desc: 'Cigarette pants, formal trousers, palazzo' },
  { id: 'Shirt', name: 'Bespoke Dress Shirt', image: IMAGE_CONFIG.shirt, basePrice: 1600, desc: 'Crisp collar, custom cuffs, perfect shoulder fit' },
  { id: 'Custom Design', name: 'Custom Design / Other', image: IMAGE_CONFIG.fashion || IMAGE_CONFIG.hero, basePrice: 3000, desc: 'Bring your own sketch, reference photo or fabric' }
];

export default IMAGE_CONFIG;
