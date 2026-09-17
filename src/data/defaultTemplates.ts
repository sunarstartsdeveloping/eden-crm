import { CommunicationTemplate } from '../types/crm';

export const DEFAULT_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'tmpl-quote',
    title: 'Luxury Stay Quote & Experience Preview',
    category: 'quote',
    channel: 'whatsapp',
    content: `Dear {{guest_name}}, Greetings from Eden Wellness & Hospitality, Salan Gaon (Mussoorie Foothills).

Thank you for your enquiry regarding a stay at Eden. Here are the tailored details for your requested itinerary:

Dates: {{check_in}} to {{check_out}}
Suite / Residence: {{room_name}} (Capacity: {{num_guests}} Guests)
Estimated Investment: {{total_amount}} (Includes breakfast at Nouveau Table and full retreat amenities)

Inclusions with your stay:
- Daily morning yoga and meditation at our sunrise deck
- Access to heated infinity pool, jacuzzi and wellness lounge
- Complimentary afternoon high tea at The Nook cafe
- High-speed optical fiber WiFi and private estate parking

To secure your reservation, a 50% advance deposit is required. Please let us know if you would like us to block these dates for you.

Warm regards,
{{staff_name}}
Eden Wellness & Hospitality, Salan Gaon
Phone: +91 98970 00000 | Web: edenwellness.in`
  },
  {
    id: 'tmpl-confirmation',
    title: 'Official Booking Confirmation & Arrival Directions',
    category: 'confirmation',
    channel: 'whatsapp',
    content: `Dear {{guest_name}},

Your stay at Eden Wellness & Hospitality is officially confirmed. We look forward to welcoming you to Salan Gaon.

RESERVATION SUMMARY:
- Booking Reference: {{booking_id}}
- Accommodation: {{room_name}} (Room {{room_number}})
- Check-in: {{check_in}} (From 2:00 PM)
- Check-out: {{check_out}} (Until 11:00 AM)
- Total Amount: {{total_amount}}

DIRECTIONS TO PROPERTY:
Eden Wellness is situated in Salan Gaon, 20 minutes from Dehradun Rajpur Road and 45 minutes before Mussoorie Mall Road.
Google Maps: https://maps.google.com/?q=Eden+Wellness+Salan+Gaon

Please reply with your estimated arrival time so our team can prepare your welcome refreshments and express check-in.

Best regards,
Front Desk Team | Eden Wellness`
  },
  {
    id: 'tmpl-wellness-intake',
    title: 'Pre-Arrival Wellness & Dietary Consultation',
    category: 'wellness_intake',
    channel: 'whatsapp',
    content: `Dear {{guest_name}},

In anticipation of your arrival on {{check_in}}, our wellness director Dr. Ananya Bhatt and Executive Chef Raghavendra Joshi would like to customize your stay experience.

Could you kindly share:
1. Any specific dietary preferences (e.g., Sattvic, Vegan, Gluten-Free, Allergies)?
2. Preferred time for your complimentary yoga and steam/jacuzzi sessions?
3. Any spa treatments you would like pre-booked (Abhyanga Detox, Cedar Deep Tissue, Aromatherapy)?

You may reply directly to this message. We will ensure every detail is prepared prior to your arrival.

Warmly,
The Wellness Team at Eden`
  },
  {
    id: 'tmpl-review',
    title: 'Post-Stay Gratitude & Review Request',
    category: 'post_stay_review',
    channel: 'whatsapp',
    content: `Dear {{guest_name}},

Thank you for choosing Eden Wellness & Hospitality for your mountain retreat. It was our pleasure to host you in Salan Gaon.

We hope you had a restful stay and returned with wonderful memories.

If you enjoyed your experience, we would appreciate it if you could take a moment to share your feedback on Google or Tripadvisor:

Google Review: https://g.page/r/eden-wellness-salan-gaon/review
Tripadvisor: https://tripadvisor.com/reviewit/eden-wellness-retreat

We look forward to welcoming you back on your next visit to Uttarakhand.

Sincerely,
Vikramaditya Sen & The Eden Team`
  },
  {
    id: 'tmpl-anniversary',
    title: 'Loyalty & Anniversary Privilege Offer',
    category: 'anniversary_offer',
    channel: 'whatsapp',
    content: `Warm Greetings {{guest_name}},

On behalf of everyone at Eden Wellness & Hospitality, we extend our best wishes for your milestone occasion.

As a valued returning guest, we are pleased to offer you an exclusive courtesy for your next retreat:
- 15% courtesy savings on any Valley Suite or Villa
- Complimentary 60-minute couples massage at The Spa
- Welcome refreshments upon arrival

Valid for stays within the next 60 days. Reply to this message to check availability.

Warm regards,
Vikramaditya Sen | Owner, Eden Wellness`
  }
];
