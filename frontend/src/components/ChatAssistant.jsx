import React, { useState, useRef, useEffect } from 'react';
import { roomAPI } from '../services/api';

// ──────────────────────────────────────────────────────────────
// Smart room-aware assistant engine
// ──────────────────────────────────────────────────────────────
function buildResponse(input, rooms) {
    const q = input.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|good morning|good evening|namaste|hlo|yo)\b/.test(q)) {
        return `👋 Hello! I'm **RoomBot**, your personal room-finding assistant!\n\nI can help you:\n- 🔍 Find rooms by city, price, or size\n- 💰 Tell you about pricing\n- 🛏️ Filter by beds/baths\n- 📍 Suggest popular areas\n\nWhat are you looking for today?`;
    }

    // Thanks
    if (/thank|thanks|thx|ty\b/.test(q)) {
        return `😊 You're welcome! Is there anything else I can help you find?`;
    }

    // Help
    if (/^(help|what can you do|commands)\b/.test(q)) {
        return `Here's what I can do for you:\n\n🔍 **"rooms in Mumbai"** → Filter by city\n💰 **"rooms under 10000"** → Filter by price\n🛏️ **"2 bedroom rooms"** → Filter by bedrooms\n📋 **"show all rooms"** → List all available rooms\n❓ **"how to list a room"** → Guide for owners\n\nJust ask naturally — I'll understand!`;
    }

    // How many rooms available
    if (/how many|total rooms|count/.test(q)) {
        return `📊 There are currently **${rooms.length} room${rooms.length !== 1 ? 's' : ''}** listed on RoomFinder.`;
    }

    // Show all rooms
    if (/show all|all rooms|list rooms|browse/.test(q)) {
        if (rooms.length === 0) return `😕 No rooms available right now. Check back soon!`;
        const sample = rooms.slice(0, 3).map(r =>
            `• **${r.title}** — ₹${r.price}/mo in ${r.address?.city || 'N/A'} (${r.bedrooms} bed)`
        ).join('\n');
        return `Here are some available rooms:\n\n${sample}\n\n${rooms.length > 3 ? `...and ${rooms.length - 3} more. Scroll the main page to see all!` : ''}`;
    }

    // Price queries
    const priceUnder = q.match(/under\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
    const priceAbove = q.match(/above|more than|over\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
    const priceMatch = q.match(/(?:rs\.?|inr|₹)\s*(\d+)/i) || q.match(/(\d{4,})/);

    if (priceUnder) {
        const max = parseInt(priceUnder[1]);
        const filtered = rooms.filter(r => r.price <= max);
        if (filtered.length === 0) return `😕 No rooms found under ₹${max}. Try increasing your budget.`;
        const list = filtered.slice(0, 3).map(r => `• **${r.title}** — ₹${r.price}/mo in ${r.address?.city}`).join('\n');
        return `🏠 Found **${filtered.length}** room${filtered.length !== 1 ? 's' : ''} under ₹${max}:\n\n${list}\n\nUse the search bar to apply this filter!`;
    }

    // City / location search
    const cityKeywords = ['in', 'at', 'near', 'around', 'from'];
    for (const kw of cityKeywords) {
        const cityMatch = q.match(new RegExp(`(?:${kw})\\s+([a-z\\s]+)`, 'i'));
        if (cityMatch) {
            const cityQuery = cityMatch[1].trim();
            const filtered = rooms.filter(r =>
                (r.address?.city || '').toLowerCase().includes(cityQuery) ||
                (r.title || '').toLowerCase().includes(cityQuery)
            );
            if (filtered.length > 0) {
                const list = filtered.slice(0, 3).map(r => `• **${r.title}** — ₹${r.price}/mo`).join('\n');
                return `📍 Found **${filtered.length}** room${filtered.length !== 1 ? 's' : ''} in "${cityQuery}":\n\n${list}\n\nType it in the **City or Place** search box for the full list!`;
            }
        }
    }

    // Bedroom queries
    const bedMatch = q.match(/(\d+)\s*(?:bed|bedroom|bhk|br)/i);
    if (bedMatch) {
        const beds = parseInt(bedMatch[1]);
        const filtered = rooms.filter(r => r.bedrooms === beds);
        if (filtered.length === 0) return `😕 No ${beds}-bedroom rooms found currently. Try searching in the filter above.`;
        const list = filtered.slice(0, 3).map(r => `• **${r.title}** — ₹${r.price}/mo in ${r.address?.city}`).join('\n');
        return `🛏️ Found **${filtered.length}** room${filtered.length !== 1 ? 's' : ''} with ${beds} bedroom${beds > 1 ? 's' : ''}:\n\n${list}`;
    }

    // How to list/post a room
    if (/list|post|add|publish|create|sell|rent out|owner/.test(q)) {
        return `🏢 **Listing your room is easy!**\n\n1. Click **Sign Up** and choose "Room Owner"\n2. After registering, go to **New Listing**\n3. Fill in your room details, price, and location\n4. Click **Publish Listing**\n\nYour room will be live on the platform instantly! 🚀`;
    }

    // Amenities
    if (/amenity|amenities|wifi|parking|gym|pool|furnished|ac|air cond/.test(q)) {
        const amenityMap = { wifi: 'WiFi', parking: 'Parking', gym: 'Gym', pool: 'Pool', ac: 'AC', furnished: 'Furnished' };
        const found = Object.entries(amenityMap).find(([key]) => q.includes(key));
        if (found) {
            const [, label] = found;
            const filtered = rooms.filter(r => r.amenities?.some(a => a.toLowerCase().includes(found[0])));
            if (filtered.length === 0) return `😕 No rooms with **${label}** found right now. Check back later!`;
            const list = filtered.slice(0, 3).map(r => `• **${r.title}** — ₹${r.price}/mo`).join('\n');
            return `✅ Found **${filtered.length}** room${filtered.length !== 1 ? 's' : ''} with **${label}**:\n\n${list}`;
        }
        return `🏠 Many rooms on RoomFinder include amenities like WiFi, parking, AC, and more. Use the search bar and look at individual room pages for the full amenity list!`;
    }

    // Contact / booking
    if (/contact|book|enquire|enquiry|phone|number/.test(q)) {
        return `📞 To contact a room owner:\n1. Click on any room card to open the **Room Details** page\n2. You'll find the owner's contact info there\n3. Reach out directly to schedule a visit!\n\nWould you like me to find a room for you?`;
    }

    // Default catch-all
    return `🤔 I didn't quite understand that. Here are some things you can ask me:\n\n• "Rooms in Pune"\n• "Rooms under ₹8000"\n• "2 bedroom rooms"\n• "How to list my room"\n• "Show all rooms"\n\nOr just type what you're looking for! 😊`;
}

// ──────────────────────────────────────────────────────────────
// Chat UI Component
// ──────────────────────────────────────────────────────────────
const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'bot',
            text: `👋 Hi! I'm **RoomBot** — your AI room-finding assistant!\n\nAsk me anything about rooms, pricing, locations, or how to list your property. I'm here 24/7! 🏠`,
            time: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [rooms, setRooms] = useState([]);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Pre-load rooms so assistant can answer questions
    useEffect(() => {
        roomAPI.getAllRooms({})
            .then(res => setRooms(res.data?.rooms || []))
            .catch(() => { });
    }, []);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text) return;

        const userMsg = { id: Date.now(), role: 'user', text, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate thinking delay
        setTimeout(() => {
            const response = buildResponse(text, rooms);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: response, time: new Date() }]);
            setIsTyping(false);
        }, 700 + Math.random() * 400);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Render markdown-like bold text
    const renderText = (text) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
                ? <strong key={i}>{part.slice(2, -2)}</strong>
                : part.split('\n').map((line, j) => (
                    <span key={`${i}-${j}`}>{line}{j < part.split('\n').length - 1 && <br />}</span>
                ))
        );
    };

    const quickReplies = ['Show all rooms', 'Rooms under ₹10000', 'How to list a room', '2 bedroom rooms'];

    return (
        <>
            {/* ── Floating Button ── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                title="Chat with RoomBot"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
                {/* Unread dot */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            {/* ── Chat Panel ── */}
            <div
                className={`fixed bottom-24 right-6 z-[9998] w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col border border-white/20 overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
                    }`}
                style={{ maxHeight: '520px', background: '#fff' }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🤖</div>
                    <div>
                        <p className="font-bold text-white text-sm">RoomBot</p>
                        <p className="text-indigo-200 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Online · Room Expert
                        </p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="ml-auto text-white/70 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50" style={{ maxHeight: '320px' }}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'bot' && (
                                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-sm mr-2 shrink-0 mt-0.5">🤖</div>
                            )}
                            <div
                                className={`max-w-[75%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                                    }`}
                            >
                                {renderText(msg.text)}
                                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-sm mr-2 shrink-0">🤖</div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Quick Reply Chips */}
                <div className="flex gap-1.5 flex-wrap px-3 py-2 border-t border-gray-100 bg-white">
                    {quickReplies.map(reply => (
                        <button
                            key={reply}
                            onClick={() => { setInput(reply); setTimeout(() => inputRef.current?.focus(), 50); }}
                            className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full transition-all whitespace-nowrap font-medium"
                        >
                            {reply}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about rooms..."
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isTyping}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatAssistant;
