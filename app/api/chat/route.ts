import { NextResponse } from 'next/server';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `
You are Fzee AI, the official intelligent travel AI assistant for Fzee Travels and Tours.
Your mission is to provide warm, professional, fast, and helpful assistance to travel agents, pilgrims, and travelers.

Key Details about Fzee Travels & Tours:
- Primary Support & Booking WhatsApp: 0330 4084080 (+92 330 4084080)
- B2B Agent & Group Desk WhatsApp: 0331 4084080 (+92 331 4084080)
- Email: info@fzeetravels.com
- Main Services:
  1. Umrah & Hajj Packages: Customized & group packages with hotel accommodations in Makkah (near Haram) and Madinah, transport, ground services, and visa processing.
  2. Flight Reservations: Domestic & international airlines ticket booking with exclusive B2B fares and group seat blockings.
  3. Hotel Bookings: Worldwide hotel bookings, with special deals in Saudi Arabia, UAE, Turkey, Far East, and Europe.
  4. Visa Assistance: Saudi Tourist/Umrah Visa, UAE e-visas, UK, USA, Schengen, Far East visa guidance and document submission.
  5. B2B Travel Agent Portal: Travel agents can sign up for free, access wholesale net rates, top up wallets, and manage group bookings.

Behavior Guidelines:
- Keep answers helpful, concise, well-structured (use bullet points when listing items), and friendly.
- Encourage users to contact our support team on WhatsApp (0330-4084080 for general inquiries or 0331-4084080 for B2B agents) for instant bookings.
- If asked about prices, explain that rates vary by season, flight availability, and hotel class, and offer to connect them via WhatsApp for exact instant quotes.
`;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const userMessage = messages[messages.length - 1]?.content || '';
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      try {
        // Prepare Gemini API request
        const contents = messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

        // Insert system instruction at the beginning if needed
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const aiResponse =
            data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (aiResponse) {
            return NextResponse.json({
              response: aiResponse,
              source: 'gemini',
            });
          }
        }
      } catch (err) {
        console.error('Gemini API call failed, falling back to smart responder:', err);
      }
    }

    // Fallback Smart Assistant Engine when API key is not present or API call fails
    const fallbackResponse = generateSmartFallback(userMessage);

    return NextResponse.json({
      response: fallbackResponse,
      source: 'smart-fallback',
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {
        response:
          'I apologize, but I am experiencing a temporary connection issue. You can chat directly with our team on WhatsApp at **0330 4084080** or **0331 4084080** for immediate assistance!',
        source: 'error-fallback',
      },
      { status: 500 }
    );
  }
}

function generateSmartFallback(input: string): string {
  const query = input.toLowerCase();

  if (query.includes('umrah') || query.includes('hajj') || query.includes('makkah') || query.includes('madinah') || query.includes('ziyarat')) {
    return `🕋 **Umrah & Hajj Services at Fzee Travels**

We offer premium and customized Umrah packages tailored to your schedule and budget:
- **Star Hotels**: Close proximity to Haram in Makkah & Markaziah in Madinah
- **Complete Logistics**: Transport, Ziyarat tours & Ground handling included
- **Visa Processing**: Fast-track Umrah & Saudi Tourist visa processing

Would you like a customized quote? Connect directly with our Umrah desk on WhatsApp at **0330 4084080**!`;
  }

  if (query.includes('flight') || query.includes('ticket') || query.includes('airline') || query.includes('booking') || query.includes('pnr')) {
    return `✈️ **Flight Reservations & Tickets**

Fzee Travels offers flight tickets for top international & domestic airlines:
- Best fares for PIA, Saudi Arabian Airlines, Emirates, Etihad, Qatar Airways, Airblue, and Fly Jinnah.
- Exclusive group fares & block seats for group travel.
- Flexible date changes and seat selection.

Share your origin, destination, and travel dates with us on WhatsApp at **0330 4084080** for instant ticket availability!`;
  }

  if (query.includes('visa') || query.includes('passport') || query.includes('document')) {
    return `🛂 **Visa Processing Services**

We handle visa documentation and submissions for multiple destinations:
- **Saudi Arabia**: Tourist E-Visa & Umrah Visas
- **UAE / Dubai**: 30-day & 60-day tourist visas
- **Other Countries**: UK, USA, Schengen states, Turkey, Malaysia, Azerbaijan & Far East

For required documents and processing fees, contact our visa specialists on WhatsApp at **0330 4084080**.`;
  }

  if (query.includes('agent') || query.includes('b2b') || query.includes('partner') || query.includes('register') || query.includes('commission') || query.includes('portal')) {
    return `💼 **Fzee B2B Travel Agent Portal**

Are you a travel agent looking to expand your business?
- Access wholesale net rates for flights, hotels, and Umrah packages
- Instant wallet top-ups & automated ticket issuance
- Sub-agent management and real-time booking tracking
- **Free Registration**: Sign up in minutes with zero setup fees!

Connect directly with our B2B Agent Desk on WhatsApp at **0331 4084080** to activate your agent account!`;
  }

  if (query.includes('hotel') || query.includes('stay') || query.includes('room')) {
    return `🏨 **Worldwide Hotel Accommodations**

Fzee Travels provides hotel bookings from budget to 5-star luxury resorts:
- Premium stays in Makkah & Madinah (Clock Tower, Abraj Al Bait, Pullman Zamzam, Oberoi, etc.)
- Hotel reservations in Dubai, Istanbul, Bangkok, London, and nationwide in Pakistan.

Message us your preferred location and dates on WhatsApp at **0330 4084080** for instant rates!`;
  }

  if (query.includes('contact') || query.includes('phone') || query.includes('number') || query.includes('office') || query.includes('whatsapp') || query.includes('call') || query.includes('support')) {
    return `📞 **Contact Fzee Travels and Tours**

Our team is ready to assist you:
- **General Inquiries & Bookings**: WhatsApp / Call **0330 4084080** (+92 330 4084080)
- **B2B Agent & Group Desk**: WhatsApp / Call **0331 4084080** (+92 331 4084080)
- **Email**: info@fzeetravels.com

Feel free to click the WhatsApp button in this window to chat live with an agent!`;
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('salam') || query.includes('assalam')) {
    return `Assalam-o-Alaikum! 👋 Welcome to **Fzee Travels and Tours**.

How can I assist you with your travel plans today? You can ask me about:
- 🕋 **Umrah & Hajj Packages**
- ✈️ **Flight Ticket Reservations**
- 🛂 **Visa Assistance**
- 💼 **Joining as a B2B Travel Agent**
- 🏨 **Hotel Bookings**

You can also speak with our live agents anytime on WhatsApp (**0330 4084080** or **0331 4084080**)!`;
  }

  return `Thank you for reaching out to **Fzee Travels and Tours**! 🌍

I am here to help you with flight tickets, Umrah & Hajj packages, hotel bookings, visa assistance, or registering as a B2B travel agent.

For immediate personalized assistance, click the WhatsApp button below or message our support team directly at **0330 4084080** or **0331 4084080**!`;
}
