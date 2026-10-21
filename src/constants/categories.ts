// ==============================================================================
// News Categories Constants
// ==============================================================================

export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: 'haryana', name: 'हरियाणा', description: 'हरियाणा राज्य की सभी ताज़ा व मुख्य खबरें' },
  { slug: 'regional', name: 'क्षेत्रीय', description: 'सिरसा, फतेहाबाद, हिसार, आदमपुर, ऐलनाबाद, नोहर व आसपास की खबरें' },
  { slug: 'mandi-bhav', name: 'मंडी भाव', description: 'हरियाणा व सीमावर्ती मंडियों के ताज़ा भाव' },
  { slug: 'weather', name: 'मौसम', description: 'जिलावार मौसम पूर्वानुमान व बारिश का अलर्ट' },
  { slug: 'panchang', name: 'पंचांग व राशिफल', description: 'दैनिक राशिफल, शुभ मुहूर्त, चौघड़िया व राहुकाल' },
  { slug: 'govt-schemes', name: 'सरकारी योजनाएं', description: 'हरियाणा व केंद्र सरकार की जन कल्याणकारी योजनाएं' },
  { slug: 'govt-jobs', name: 'सरकारी नौकरी', description: 'HSSC, हरियाणा पुलिस, रिजल्ट, एडमिट कार्ड व भर्तियां' },
  { slug: 'sports', name: 'खेल कूद', description: 'क्रिकेट स्कोर, हरियाणा के खिलाड़ी व खेल समाचार' },
  { slug: 'business', name: 'बिजनेस व बाजार', description: 'सोना-चांदी भाव, पेट्रोल-डीजल रेट व शेयर बाजार अपडेट' },
  { slug: 'history', name: 'आज का इतिहास', description: 'इतिहास के पन्नों से आज के दिन की प्रमुख घटनाएं' },
  { slug: 'technology', name: 'टेक व ऑटो', description: 'रेलवे, रोडवेज, तकनीक व ऑटोमोबाइल से जुड़ी खबरें' },
  { slug: 'top-news', name: 'टॉप 10', description: 'दिनभर की 10 बड़ी और जरूरी खबरें' },
];
