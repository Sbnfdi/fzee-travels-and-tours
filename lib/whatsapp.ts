/**
 * Fzee Travels and Tours - WhatsApp Integration Utility
 */

export const WHATSAPP_CONFIG = {
  primary: {
    number: '923304084080',
    displayNumber: '0330 4084080',
    formattedDisplay: '+92 330 4084080',
    label: 'Customer Support & Bookings',
    description: 'For general inquiries, Umrah packages, flights & hotel reservations',
  },
  secondary: {
    number: '923314084080',
    displayNumber: '0331 4084080',
    formattedDisplay: '+92 331 4084080',
    label: 'B2B Agent & Group Desk',
    description: 'For travel agents, group bookings & partnership inquiries',
  },
};

export type WhatsAppTopic =
  | 'general'
  | 'umrah'
  | 'flights'
  | 'hotels'
  | 'visa'
  | 'b2b_agent'
  | 'group_booking';

const TOPIC_PRESETS: Record<WhatsAppTopic, { message: string; numberKey: 'primary' | 'secondary' }> = {
  general: {
    message: 'Hello Fzee Travels & Tours! I would like to inquire about your travel services.',
    numberKey: 'primary',
  },
  umrah: {
    message: 'Hello Fzee Travels! I am interested in your Umrah packages. Please share current rates and package details.',
    numberKey: 'primary',
  },
  flights: {
    message: 'Hi Fzee Travels! I need assistance with booking domestic/international flight tickets.',
    numberKey: 'primary',
  },
  hotels: {
    message: 'Hello! I am looking for hotel accommodation reservations through Fzee Travels.',
    numberKey: 'primary',
  },
  visa: {
    message: 'Hi Fzee Travels! I need guidance and assistance regarding visa processing.',
    numberKey: 'primary',
  },
  b2b_agent: {
    message: 'Hello! I am a travel agent interested in registering for the Fzee Travels B2B Portal.',
    numberKey: 'secondary',
  },
  group_booking: {
    message: 'Hi Fzee Travels! I would like to inquire about customized group tour packages.',
    numberKey: 'secondary',
  },
};

/**
 * Generate a direct WhatsApp click-to-chat URL
 */
export function getWhatsAppUrl(
  text?: string,
  numberKey: 'primary' | 'secondary' = 'primary'
): string {
  const number = WHATSAPP_CONFIG[numberKey].number;
  const encodedText = encodeURIComponent(text || TOPIC_PRESETS.general.message);
  return `https://wa.me/${number}?text=${encodedText}`;
}

/**
 * Generate a topic-specific WhatsApp URL
 */
export function getTopicWhatsAppUrl(topic: WhatsAppTopic): string {
  const preset = TOPIC_PRESETS[topic];
  return getWhatsAppUrl(preset.message, preset.numberKey);
}
